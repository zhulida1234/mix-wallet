import { getHttpEndpoint } from "@orbs-network/ton-access";
import {createAddressByWalletVersion,createAddressByMnemonic} from "../../src/tonCoin/address"
import {createTransaction} from "../../src/tonCoin/transaction"
import {WalletVersion} from "../../src/tonCoin/walletCommon";
import {TonClient} from "@ton/ton";
require('dotenv').config();

describe("tonCoin wallet address and transaction test",()=>{
    test('create address',async()=>{

        const mnemonic = process.env.TON_MNEMONIC!; // your 24 secret words (replace ... with the rest of the words)
        console.log("mnemonic:",mnemonic)

        const account = await createAddressByWalletVersion(mnemonic,WalletVersion.V4R2)

        console.info(" account",account);

    })

    test('create address V2',async ()=>{
        const mnemonic = process.env.TON_MNEMONIC!;

        const account = await createAddressByMnemonic(mnemonic)
        console.info(" account",account);

        const endpoint = await getHttpEndpoint({ network: "mainnet" });
        const client = new TonClient({ endpoint });



    })

    test('create transaction and sign',async ()=>{
        const mnemonic = process.env.TON_MNEMONIC!;

        const account = await createAddressByWalletVersion(mnemonic,WalletVersion.V4R2)

        const tx = await createTransaction(account)

        console.log(tx)
    })
})