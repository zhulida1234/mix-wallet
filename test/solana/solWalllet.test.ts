import {generateSolKeyPair,prepareAccount,verifySolAddress,createStakingAccount} from "../../src/solana/account";
import {signSolTransaction} from "../../src/solana/transcation";
import {delegateStake,deactivateStake,withdrawFunds} from "../../src/solana/staking";
import { getRecentBlockhash } from "../../src/utils";
const axios = require('axios');
const { derivePath, getPublicKey } = require('ed25519-hd-key');
const bip39 = require('bip39');
const bs58 = require('bs58');
import {Connection, NonceAccount} from "@solana/web3.js";
import {IncomingMessage} from "node:http";
require('dotenv').config();

const { Keypair } = require("@solana/web3.js");
const mnemonic = process.env.MNEMONIC;

describe('wallet unit test case', ()=> {
    test('test seed derive key', () => {
        console.log("测试根据助记词推导对应的key")
        // const mnemonic = process.env.MNEMONIC;
        const mnemonic = "face defy torch paper dial goddess floor wage nephew floor million belt"

        // const account = generateSolKeyPair(mnemonic,"0");
        const account = generateSolKeyPair(mnemonic,"500")

        // 注意这边的address 和 public一致
        console.log(account)
    })

    test('signTransaction', async() => {
        const params = {
            from: "4wHd9tf4x4FkQ3JtgsMKyiEofEHSaZH5rYzfFKLvtESD",
            nonceAccount: "FvjWo4jbdsAP4ZHtJfiUpv5xb6TpBWRtDASGPmKKR39E",
            amount: "0.01",
            to: "782jzEK7e9VuGRu1j8Vm5cDU8t2GeyZbT6JgGJxhLTPB",
            nonce: "GGLM3xu9yXzDoH3uhMEPcqqju6BB6C1FzoWKdiji5x5t",
            decimal: 9,
            privateKey: "55a70321542da0b6123f37180e61993d5769f0a5d727f9c817151c1270c290963a7b3874ba467be6b81ea361e3d7453af8b81c88aedd24b5031fdda0bc71ad32",
            mintAddress: ""
        }
        let tx_msg = await signSolTransaction(params)
        console.log("tx_msg===", tx_msg)
    })

    test('prepareAccount', async () => {
        const blockHash = await getRecentBlockhash();

        const params = {
            authorAddress: "4wHd9tf4x4FkQ3JtgsMKyiEofEHSaZH5rYzfFKLvtESD",
            from: "4wHd9tf4x4FkQ3JtgsMKyiEofEHSaZH5rYzfFKLvtESD",
            recentBlockhash: blockHash,
            minBalanceForRentExemption: 1647680,
            privs: [
                {
                    address: "4wHd9tf4x4FkQ3JtgsMKyiEofEHSaZH5rYzfFKLvtESD",
                    key: "55a70321542da0b6123f37180e61993d5769f0a5d727f9c817151c1270c290963a7b3874ba467be6b81ea361e3d7453af8b81c88aedd24b5031fdda0bc71ad32"
                },
                {
                    address: "4wHd9tf4x4FkQ3JtgsMKyiEofEHSaZH5rYzfFKLvtESD",
                    key: "55a70321542da0b6123f37180e61993d5769f0a5d727f9c817151c1270c290963a7b3874ba467be6b81ea361e3d7453af8b81c88aedd24b5031fdda0bc71ad32"
                }
            ]
        }
        let tx_msg = await prepareAccount(params)
        console.log("tx_msg===", tx_msg)
    });

    test('decode nonce', async () => {
        const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
        // connection.getNonce("55a70321542da0b6123f37180e61993d5769f0a5d727f9c817151c1270c290963a7b3874ba467be6b81ea361e3d7453af8b81c88aedd24b5031fdda0bc71ad32")
        const base58Data = "df8aQUMTjFpKK2cwmaeJaGzBFKgXYcjdLvS1nZDrZH3BQvsUvQLLW9LpE5JUgUy66FYCWhWihfdow5WQvspUmrT38TM6HmznsG9TfNgLc79H"
        const aa = NonceAccount.fromAccountData(Buffer.from(base58Data))
        // const decodeData = bs58.decode(base58Data)
        console.log(aa)
    });

    // test success
    test('verifyAddress', async () => {
        const blockHash = await getRecentBlockhash();
        const params = {
            // 这个是常见的钱包账号私钥
            authorPrivateKey: "55a70321542da0b6123f37180e61993d5769f0a5d727f9c817151c1270c290963a7b3874ba467be6b81ea361e3d7453af8b81c88aedd24b5031fdda0bc71ad32",
            // 这个是全新的私钥，用于构建stakingAccount
            stakeAccountPrivateKey: "ae7aebb8767bb0117f2034c6f13a971a8327676092b30d87cd069620deaa133a0eb55ff73c71d436f86e2388ff8ebc55e77a1a5ffa6e4a5c56cdb3517f25c0e0",
            // 需要往里面存入的钱
            lamportsForStakeAccount: 19947680,
            recentBlockhash: blockHash,
            votePubkeyStr: "7PmWxxiTneGteGxEYvzj5pGDVMQ4nuN9DfUypEXmaA8o"
        }
        let tx_msg = verifySolAddress(params)
        console.log("tx_msg===", tx_msg)
    });
})

describe('test staking',()=>{
    test('test create Staking Address',async ()=>{
        const mnemonic = process.env.MNEMONIC;
        // 需要普通的EOA账户
        // 需要一个全新的秘钥对（可以弄一个全新助记词，也可以用的的助记词进行路径推导）
        // 需要设置最低的租金
        // recentBlockhash 扫链获取最新的区块hash
        // votePubkeyStr  这个是矿池的publicKey

        const eoaAccount = generateSolKeyPair(mnemonic,"0");
        const stakingAccount = generateSolKeyPair(mnemonic,"1");

        const blockHash = await getRecentBlockhash();

        const params = {
            authorPrivateKey: eoaAccount.privateKeyHex,
            stakeAccountPrivateKey: stakingAccount.privateKeyHex,
            lamportsForStakeAccount: 19947680,
            recentBlockhash: blockHash,
            votePubkeyStr: "7PmWxxiTneGteGxEYvzj5pGDVMQ4nuN9DfUypEXmaA8o"
        }

        const txSignHex = createStakingAccount(params)
        console.log("txSignHex==>",txSignHex)

    },10000)

    test('test setting delegate',async ()=>{
        const mnemonic = process.env.MNEMONIC;
        const eoaAccount = generateSolKeyPair(mnemonic,"0");

        const stakingAccount = generateSolKeyPair(mnemonic,"1");

        const blockHash = await getRecentBlockhash();
        console.log(blockHash)

        const params = {
            authorPrivateKey: eoaAccount.privateKeyHex,
            stakeAccountPrivateKey: stakingAccount.privateKeyHex,
            recentBlockhash: blockHash,
            votePubkeyStr: "7PmWxxiTneGteGxEYvzj5pGDVMQ4nuN9DfUypEXmaA8o"
        }
        const txSignHex = delegateStake(params)
        console.log("txSignHex==", txSignHex)

    },10000)

    test('deactivate stake', async () => {
        const eoaAccount = generateSolKeyPair(mnemonic,"0");
        const stakingAccount = generateSolKeyPair(mnemonic,"1");

        const blockHash = await getRecentBlockhash();

        const params = {
            authorPrivateKey: eoaAccount.privateKeyHex,
            stakeAccountPrivateKey: stakingAccount.privateKeyHex,
            recentBlockhash: blockHash,
        }
        const txSignHex =  deactivateStake(params)
        console.log("txSignHex==", txSignHex)
    },10000);

    test('withdraw funds', async () => {
        const eoaAccount = generateSolKeyPair(mnemonic,"0");
        const stakingAccount = generateSolKeyPair(mnemonic,"1");

        const blockHash = await getRecentBlockhash();

        const params = {
            authorPrivateKey: eoaAccount.privateKeyHex,
            stakeAccountPrivateKey: stakingAccount.privateKeyHex,
            recentBlockhash: blockHash,
            stakeBalance: 1010592,
        }
        const txSignHex =  withdrawFunds(params)
        console.log("txSignHex==", txSignHex)
    });

    test('test call get recentBlockHash', async()=> {
        const blockHash = await getRecentBlockhash()
        console.log(blockHash)

    })


})




