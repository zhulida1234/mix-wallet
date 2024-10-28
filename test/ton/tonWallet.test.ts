import { mnemonicToWalletKey } from "@ton/crypto";
import {
    WalletContractV1R1,
    WalletContractV1R2,
    WalletContractV1R3,
    WalletContractV2R1,
    WalletContractV2R2,
    WalletContractV3R1,
    WalletContractV3R2,
    WalletContractV4, WalletContractV5Beta, WalletContractV5R1
} from "@ton/ton";
import {string} from "zod";
const { derivePath, getPublicKey } = require('ed25519-hd-key');
const TonWeb = require('tonweb-lite');
const bip39 = require('bip39');
require('dotenv').config();

describe("ton wallet address and transaction test",()=>{
    test('create address',async()=>{
        // open wallet v4 (notice the correct wallet version here)
        const mnemonic = process.env.TON_MNEMONIC + ""; // your 24 secret words (replace ... with the rest of the words)
        console.log("mnemonic:",mnemonic)
        // const mnemonicArr = mnemonic.split(" ");
        const keyPair = await mnemonicToWalletKey(mnemonic.split(" "));
        console.log("private Key",keyPair.secretKey.toString("hex"))
        console.log("public Key",keyPair.publicKey.toString("hex"))

        const seedHex = bip39.mnemonicToSeedSync(mnemonic)
        const addressIndex = 0
        const { key } = derivePath("m/44'/607'/0'/" + addressIndex + "'", seedHex);
        console.log("private Key from derivePath",key.toString("hex"))
        console.log("public Key",getPublicKey(key, false).toString('hex'))


        // const walletV3R2 = WalletContractV3R2.create({ publicKey: key.publicKey, workchain: 0 })
        // const walletV3R1 = WalletContractV3R1.create({ publicKey: key.publicKey, workchain: 0 })
        // const walletV2R2 = WalletContractV2R2.create({ publicKey: key.publicKey, workchain: 0 })
        // const walletV2R1 = WalletContractV2R1.create({ publicKey: key.publicKey, workchain: 0 })
        // const walletV1R3 = WalletContractV1R3.create({ publicKey: key.publicKey, workchain: 0 })
        // const walletV1R2 = WalletContractV1R2.create({ publicKey: key.publicKey, workchain: 0 })
        // const walletV1R1 = WalletContractV1R1.create({ publicKey: key.publicKey, workchain: 0 })
        const walletV5R1 = WalletContractV5R1.create({ publicKey: keyPair.publicKey })

        // print wallet address
        // console.info("V5Beta address",walletV5Beta.address.toString({bounceable:false}),walletV5Beta.address.toString({urlSafe:true,bounceable:false}))
        // console.info("V4 address",wallet.address.toString({bounceable:false}),wallet.address.toString({urlSafe:true,bounceable:false}));
        // console.info("V3R2 address",walletV3R2.address.toString({bounceable:false}),walletV3R2.address.toString({urlSafe:true,bounceable:false}))
        // console.info("V3R1 address",walletV3R1.address.toString({bounceable:false}),walletV3R1.address.toString({urlSafe:true,bounceable:false}))
        // console.info("V2R2 address",walletV2R2.address.toString({bounceable:false}),walletV2R2.address.toString({urlSafe:true,bounceable:false}))
        // console.info("V2R1 address",walletV2R1.address.toString({bounceable:false}),walletV2R1.address.toString({urlSafe:true,bounceable:false}))
        // console.info("V1R3 address",walletV1R3.address.toString({bounceable:false}),walletV1R3.address.toString({urlSafe:true,bounceable:false}))
        // console.info("V1R2 address",walletV1R2.address.toString({bounceable:false}),walletV1R2.address.toString({urlSafe:true,bounceable:false}))
        // console.info("V1R1 address",walletV1R1.address.toString({bounceable:false}),walletV1R1.address.toString({urlSafe:true,bounceable:false}))
        console.info("V5R1 address",walletV5R1.address.toString({bounceable:false}),walletV5R1.address.toString({urlSafe:true,bounceable:false}));

    })

    test('换另外一种思路进行验证',async ()=>{
        const mnemonic = process.env.TON_MNEMONIC + "";
        const seedHex = bip39.mnemonicToSeedSync(mnemonic)
        const addressIndex = 0
        const { key } = derivePath("m/44'/607'/0'/" + addressIndex + "'", seedHex);
        const publicKey = getPublicKey(key, false).toString('hex');

        const tonweb = new TonWeb();
        const WalletClass = tonweb.wallet.all['v4R2'];

        const publikKey = new Uint8Array(Buffer.from(publicKey, "hex"))
        const wallet = new WalletClass(tonweb.provider, {
            publicKey: publikKey,
            wc: 0
        });
        const walletAddress =  await wallet.getAddress();

        console.log("privateKey",key.toString('hex') + publicKey)
        console.log("publicKey",publicKey)
        console.log("address",walletAddress.toString(true, true, false, false))



    })

    test('test get mnemonic',()=>{
        const mnemonic = process.env.TON_MNEMONIC + ""; // your 24 secret words (replace ... with the rest of the words)

        const mnemonicArr = mnemonic.split(" ");
    })




})