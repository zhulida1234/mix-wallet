import {createAddressByWalletVersion,createAddressByMnemonic} from "../../src/ton/address"
import {WalletVersion} from "../../src/ton/walletCommon";
require('dotenv').config();





describe("ton wallet address and transaction test",()=>{
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