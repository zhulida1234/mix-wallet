import { generateKeyPair,compressPublicKey} from "../../src/base";
import { createEthAddress } from "../../src/ethereum/address";
import {ethSign} from "../../src/ethereum/transcation";
require('dotenv').config();

describe('ethereum wallet unit test case', ()=> {
    test('create Address', ()=>{
        const mnemonic = 'picnic dizzy churn drift cheap social decide myself pool soup tone modify';
        const {privateKey,publicKey} = generateKeyPair(mnemonic,"0");
        console.log(privateKey,publicKey);
        
        const ethAddress = createEthAddress(mnemonic,"0");
        console.log("address",ethAddress.address);

    });


    test('sign eth legacy', ()=>{
        const rawHex = ethSign({
            "privateKey": process.env.PRIVATE_KEY,
            "nonce": 3,
            "from": "0x702b4B92b74ac470d1eeb91106A2e7Be73F8b92b",
            "to": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            "amount": "0.1",
            "gasLimit": 21000,
            "gasPrice": 39000000000,
            "decimal": 18,
            "chainId": 11155111,
            "tokenAddress": "0x00"
        })
        console.log(rawHex);

    })

    test('sign eth eip1559', async () => {
        const rawHex = ethSign({
            "privateKey": process.env.PRIVATE_KEY,
            "nonce": 54,
            "from": "0x702b4B92b74ac470d1eeb91106A2e7Be73F8b92b",
            "to": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            "amount": "0.01",
            "gasLimit": 21000,
            "maxFeePerGas": 2900000000,
            "maxPriorityFeePerGas": 2600000000,
            "decimal": 18,
            "chainId": 11155111,
            "tokenAddress": "0x00"
        })
        console.log(rawHex)
    });


})