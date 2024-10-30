import {internal, TonClient, WalletContractV4} from "@ton/ton";
import * as buffer from "node:buffer";
import {getHttpEndpoint} from "@orbs-network/ton-access";


export async function createTransaction(account:any){
    const {publicKey,privateKey,address} = account;

    const wallet = WalletContractV4.create({ publicKey: Buffer.from(publicKey,"hex"), workchain: 0 });

    // initialize ton rpc client on testnet
    const endpoint = await getHttpEndpoint({ network: "mainnet" });
    const client = new TonClient({ endpoint });

    const walletContract = client.open(wallet);
    const seqno = await walletContract.getSeqno();

    const balance = await client.getBalance(wallet.address);
    console.log('seqno',seqno)
    console.log('balance',balance)

    const tx = await walletContract.createTransfer({
        secretKey: Buffer.from(privateKey,"hex"),
        seqno:seqno,
        messages: [
            internal({
                to: "UQDOo-WUcxQnZmAeAFHJGgp_Jdqs_t_mjxGUTuYbSklG1MDx",
                value: "0.02",
                bounce: false,
            })
        ]
    })
    await walletContract.send(tx);

    return tx;

}