import {createMeneroMnemonic,generateMeneroKeyPair,generateWallet} from '../../src/menero/address'
import {createAndSendMeneroTransaction,signTransaction} from '../../src/menero/transaction'
require('dotenv').config();




describe('test menero wallet',()=>{

    // 创建助记词
    test('test create menero mnemonic',() => {
        // 使用 crypto.randomBytes 生成随机字节
        const mnemonic = createMeneroMnemonic(32);

        console.log(mnemonic)
    })

    // 创建钱包
    test('test create wallet mnemonic',async () => {
        // 直接使用menero SDK 创建一个钱包
        const wallectAccount = await generateWallet();

        console.log('执行完毕')
    })


    // 根据助记词导出公钥，私钥，地址
    test('export full key from mnemonic',async ()=> {
        const mnemonic = process.env.MENERO_MNEMONIC;

        const keyPair = await generateMeneroKeyPair(mnemonic);

        console.log(keyPair)

    })

    test('sign transaction tx', async()=>{
        const mnemonic = process.env.MENERO_MNEMONIC;

        const params = {
            mnemonic:mnemonic
        }

        const signedTx = await signTransaction(params);

        console.log(signedTx)

    },80000)

    test('create and send menero transaction tx', async()=>{

        const txHash = await createAndSendMeneroTransaction();

        console.log('txHash:',txHash)
    })




})



