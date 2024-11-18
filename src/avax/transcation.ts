import { BN } from 'avalanche'
import {ChainIdType, TxState} from "./types";
import {cChain, ExportChainsC, ExportChainsP, ExportChainsX, pChain, xChain,SingletonWallet} from "@avalabs/avalanche-wallet-sdk";
import {WalletProvider} from "@avalabs/avalanche-wallet-sdk/src/Wallet/Wallet";

const IMPORT_DELAY = 5000 // in ms



export async function chainExport(amt: BN, sourceChain: ChainIdType, destinationChain: ChainIdType, wallet: SingletonWallet){
    let exportTxId

    try {
        switch (sourceChain) {
            case 'X':
                exportTxId = await wallet.exportXChain(amt,destinationChain as ExportChainsX)
                break
            case 'P':
                exportTxId = await wallet.exportPChain(amt,destinationChain as ExportChainsP)
                break
            case 'C':
                exportTxId = await wallet.exportCChain(amt,destinationChain as ExportChainsC)
                break
        }
    } catch (e) {
        throw e
    }

    this.exportId = exportTxId
    await this.waitExportStatus(exportTxId)
}

async function waitExportStatus(txId: string, remainingTries = 15){
    let status
    if (this.sourceChain === 'X') {
        status = await xChain.getTxStatus(txId)
    } else if (this.sourceChain === 'P') {
        let resp = await pChain.getTxStatus(txId)
        if (typeof resp === 'string') {
            status = resp
        } else {
            status = resp.status
            this.exportReason = resp.reason
        }
    } else {
        let resp = await cChain.getAtomicTxStatus(txId)
        status = resp
    }

    this.exportStatus = status

    if (status === 'Unknown' || status === 'Processing') {
        // If out of tries
        if (remainingTries <= 0) {
            this.exportState = TxState.failed
            this.exportStatus = 'Timeout'
            return false
        }

        // if not confirmed ask again
        setTimeout(() => {
            this.waitExportStatus(txId, remainingTries - 1)
        }, 1000)
        return false
    } else if (status === 'Dropped') {
        // If dropped stop the process
        this.exportState = TxState.failed
        return false
    } else {
        // If success start import
        this.exportState = TxState.success

        // Because the API nodes are behind a load balancer we are waiting for all api nodes to update
        this.importState = TxState.started
        this.importStatus = 'Waiting'
        setTimeout(() => {
            this.chainImport()
        }, IMPORT_DELAY)
    }
    return true
}

// STEP 3
export async function chainImport(canRetry = true,wallet: WalletProvider) {
    let importTxId
    try {
        if (this.targetChain === 'P') {
            importTxId = await wallet.importP(this.sourceChain as ExportChainsP)
        } else if (this.targetChain === 'X') {
            importTxId = await wallet.importX(this.sourceChain as ExportChainsX)
        } else {
            //TODO: Import only the exported UTXO

            importTxId = await wallet.importC(
                this.sourceChain as ExportChainsC,
                this.importFeeBN
            )
        }
    } catch (e) {
        // Retry import one more time
        if (canRetry) {
            setTimeout(() => {
                this.chainImport(false)
            }, IMPORT_DELAY)
            return
        }
        this.onerror(e)
        this.onErrorImport(e)
        return
    }

    this.importId = importTxId
    this.importState = TxState.started

    this.waitImportStatus(importTxId)
}

// STEP 4
async function waitImportStatus(txId: string) {
    let status

    if (this.targetChain === 'X') {
        status = await xChain.getTxStatus(txId)
    } else if (this.targetChain === 'P') {
        let resp = await pChain.getTxStatus(txId)
        if (typeof resp === 'string') {
            status = resp
        } else {
            status = resp.status
        }
    } else {
        let resp = await cChain.getAtomicTxStatus(txId)
        status = resp
    }


    if (status === 'Unknown' || status === 'Processing') {
        // if not confirmed ask again
        setTimeout(() => {
            this.waitImportStatus(txId)
        }, 1000)
        return false
    } else if (status === 'Dropped') {
        // If dropped stop the process
        this.importState = TxState.failed
        return false
    } else {
        // If success display success page
        this.importState = TxState.success
        this.onsuccess()
    }

    return true
}



