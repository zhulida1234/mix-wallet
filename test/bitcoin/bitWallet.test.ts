import * as bip39 from "bip39";
import { createAddress } from "../../src/bitcoin/address";
import { buildAndSignTx} from "../../src/bitcoin/transcation";
require('dotenv').config();
import * as assert from 'assert';


// 注意，助记词其实也是由 wallet.test.ts 第一次执行得到的结果
describe('btc unit test case', () => {
    test('createAddress by p2pkh mainnet', () => {
        console.log("start test")
        const mnemonic = "picnic dizzy churn drift cheap social decide myself pool soup tone modify";
        const seed = bip39.mnemonicToSeedSync(mnemonic,"")
        const param ={
            seedHex: seed.toString("hex"),
            receiveOrChange: "0",
            addressIndex: "0",
            network: "mainnet",
            method: "p2pkh"
        }
        const account = createAddress(param)
        
        console.log("p2pkh address",account.address)
        console.log("p2pkh privateKey",account.privateKey)
        console.log("p2pkh publicKey",account.publicKey)

        assert.strictEqual(account.address, '15cEA2eKktFEsMVdfStd124EMG4pDh4gFY');
        assert.strictEqual(account.privateKey, '23f0315a1b5a86eadacfa7c302430a7806ea86db52c61f15da1348431c3e8ac2');
        assert.strictEqual(account.publicKey, '0314f17ba7b5102714aff10dbdaed94526b399180a95244feb28984941c333bbdd');

    });
    test('createAddress by p2sh mainnet', () => {
        console.log("start test create by p2sh")
        const mnemonic = "picnic dizzy churn drift cheap social decide myself pool soup tone modify";
        const seed = bip39.mnemonicToSeedSync(mnemonic,"")
        
        const param = {
            seedHex: seed.toString("hex"),
            receiveOrChange: "0",
            addressIndex: "0",
            network: "mainnet",
            method: "p2sh"
        }

        const account = createAddress(param)
        
        console.log("p2sh address",account.address)
        console.log("p2sh privateKey",account.privateKey)
        console.log("p2sh publicKey",account.publicKey)
        assert.strictEqual(account.address, '33xVyDPHfY4uTqom3hfzkVDby3gLBbJpUU');
        assert.strictEqual(account.privateKey, '23f0315a1b5a86eadacfa7c302430a7806ea86db52c61f15da1348431c3e8ac2');
        assert.strictEqual(account.publicKey, '0314f17ba7b5102714aff10dbdaed94526b399180a95244feb28984941c333bbdd');

    });

    test('createAddress by p2wpkh mainnet', () => {
        console.log("start test create by p2wpkh")
        const mnemonic = "picnic dizzy churn drift cheap social decide myself pool soup tone modify";
        const seed = bip39.mnemonicToSeedSync(mnemonic,"")

        const param = {
            seedHex: seed.toString("hex"),
            receiveOrChange: "0",
            addressIndex: "0",
            network: "mainnet",
            method: "p2wpkh"
        }

        const account = createAddress(param)
        

        console.log("p2wpkh address",account.address)
        console.log("p2wpkh privateKey",account.privateKey)
        console.log("p2wpkh publicKey",account.publicKey)

        assert.strictEqual(account.address, 'bc1qx29qk297ehy3ngdfxnygdexdv7st9lgce2wvhr');
        assert.strictEqual(account.privateKey, '23f0315a1b5a86eadacfa7c302430a7806ea86db52c61f15da1348431c3e8ac2');
        assert.strictEqual(account.publicKey, '0314f17ba7b5102714aff10dbdaed94526b399180a95244feb28984941c333bbdd');
    });

    test('offline sign tx', async () => {
        const data = {
            inputs: [
                {
                    address: "1H1oAqmdfTNECrrHFAJ4AhbTUyPcQjrf72",
                    txid: "209706b97a9aed047df158bf57cfbdad94a5e9bd9ac5261034448ec4590bab8f",
                    amount: 100000000,
                    vout: 0,
                },
            ],
            outputs: [
                {
                    amount: 100000000,
                    address: "1H1oAqmdfTNECrrHFAJ4AhbTUyPcQjrf72",
                },
            ],
        };
        const rawHex = buildAndSignTx({
            privateKey: process.env.BTC_PRIVATE_KEY!,
            signObj: data,
            network: "mainnet"
        });
        console.log(rawHex);
    });


});