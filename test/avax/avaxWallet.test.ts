import * as bip39 from "bip39";
import { generateAccountBothCPXAddress } from "../../src/avax/address"
require('dotenv').config();

describe('avax wallet test case',()=>{
    test('create account with c-chain',()=>{
        // set this to 'test' environment for testing, or 'prod' for production.

        const mnemonic = process.env.AVAX_MNEMONIC!;
        const seed = bip39.mnemonicToSeedSync(mnemonic,"")

        const account = generateAccountBothCPXAddress(seed);

        console.log(account)

    })

    test('test offline sign transaction',()=>{

    })



})




