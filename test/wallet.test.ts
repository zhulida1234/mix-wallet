require('dotenv').config();
const { createMnemonic,validationMnemonic,generateKeyPair,compressPublicKey} = require("../src/base");
const config = require('../config.json');
const env = process.env.NODE_ENV || 'mainnet';


describe('wallet unit test case', ()=> {
    test('hello world', () => {
        const currentConfig = config["mainnet"];

        console.log(env)
        console.log(currentConfig)
    })

    test('generate mnemonic', () => {
        const length = 128;  // 可以选择128位，160，196，224 或者256位
        const mnemonic = createMnemonic(length);
        console.log(mnemonic);
    })

    // 第一次我执行出来的助记词结果是  
    test('validation mnemonic', () => {
        const mnemonic = 'picnic dizzy churn drift cheap social decide myself pool soup tone modify';
        const validationResult = validationMnemonic(mnemonic);
        console.log("助记词验证结果:",validationResult);
    })

    // 根据助记词，导出rootKey
    test('generate keyPair', () => {
        const mnemonic = 'picnic dizzy churn drift cheap social decide myself pool soup tone modify';
        const {privateKey,publicKey} = generateKeyPair(mnemonic,"0");
        console.log("privateKey",privateKey);
        console.log("publicKey",publicKey);
    })

    // 压缩公钥
    test('compress public key', () => {
        const publicKey = '0x39f21b4139fa88bb2f5f2913de16491ae53186f2e3395c5c40834a7d872b02649fa23f6442cd24feb01d680eedf99ea8a2f3b0a5e7634289c119f359d96c92f1';
        const compressKey = compressPublicKey(publicKey);
        console.log("compressKey",compressKey);
    })


})