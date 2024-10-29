import {createAddressByWalletVersion,createAddressByMnemonic} from "../../src/tonCoin/address"
import {WalletVersion} from "../../src/tonCoin/walletCommon";
require('dotenv').config();

describe("tonCoin wallet address and transaction test",()=>{
    test('create address',async()=>{

        const mnemonic = process.env.TON_MNEMONIC!; // your 24 secret words (replace ... with the rest of the words)
        console.log("mnemonic:",mnemonic)

        const account = await createAddressByWalletVersion(mnemonic,WalletVersion.V5R1)

        console.info(" account",account);

    })

    test('create address V2',async ()=>{
        const mnemonic = process.env.TON_MNEMONIC!;

        const account = await createAddressByMnemonic(mnemonic)
        console.info(" account",account);
    })
})