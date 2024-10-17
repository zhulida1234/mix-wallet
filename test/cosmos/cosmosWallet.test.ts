
const bip39 = require("bip39")
import { createAtomAddress,
    importAtomAddress,
    publicKeyToAddress,
    verifyAtomAddress,
    signAtomTransaction,
    SignV2Transaction } from "../../src/cosmos"



describe('atom unit test case',() => {
    test('createAddress', async () => {
        const mnemonic = "champion junior low analyst plug jump entire barrel slight swim hidden remove";
        const seed = bip39.mnemonicToSeedSync(mnemonic)
        const account = await createAtomAddress(seed.toString("hex"), "0", "mainnet")
        console.log(account)
    });

    test('import atom address', async () => {
        const params = {
            privateKey: "2d687f974a2758d27843a0c4fc71304ee829994f5654ffd3b5a9dd2047f9dac3",
        }
        const account = await importAtomAddress(params)
        console.log(account)
    });

    test('import public to address', async () => {
        const account = await publicKeyToAddress("02e89035cb37433124462e75fa1b96a3b6681929a8d1904e52c237e2375f66f395")
        console.log(account)
        // cosmos1ale03zlshghgtkxg0m8e8f0j574cc45jdaf0gf
    });

    test('verify atom address', async () => {
        const params = {
            address: "cosmos16j52zqaeykz3qfdjw9ssys7ktaz3x7nple2mze",
            network: "mainnet"
        }
        let verifyRes = verifyAtomAddress(params)
        console.log(verifyRes);
    });

    test('sign atom transaction', async () => {
        const params = {
            privateKey: "2d687f974a2758d27843a0c4fc71304ee829994f5654ffd3b5a9dd2047f9dac3",
            chainId: 1,
            from: "cosmos1r9x50xmfcqyt0wmfxmfrl7fwtju90gzehhl5y6",
            to: "cosmos1er40wr3v78awxt02k4hq6evl3qjrpd4fkdmmq3",
            memo: "1010",
            amount: 0.1,
            fee: 1,
            accountNumber: 2782398,
            sequence:1,
            decimal: 6
        }
        let signTx = await signAtomTransaction(params)
        console.log(signTx);
    });

    test('sign version 2 atom transaction', async () => {
        const params = {
            privateKey: "2d687f974a2758d27843a0c4fc71304ee829994f5654ffd3b5a9dd2047f9dac3",
            chainId: "cosmoshub-4",
            from: "cosmos1z79jxnsw64c20upyfu8rfe89pdsel48kfmzjgu",  // cosmos1z79jxnsw64c20upyfu8rfe89pdsel48kfmzjgu
            to: "cosmos1er40wr3v78awxt02k4hq6evl3qjrpd4fkdmmq3",
            memo: "101111",
            amount_in: "0.1",
            fee: "0.01",
            gas: "117674",
            accountNumber: 2782398,
            sequence: 11,
            decimal: 6
        }
        let signTx = await SignV2Transaction(params)
        console.log(signTx);
    });

})