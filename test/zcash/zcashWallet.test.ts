import { generateWallet } from '../../src/zcash/address'

describe('zcash wallet test',()=>{
    test('zcash wallet address generate',async ()=>{

        const mnemonic = 'shield sentence chicken lab hotel pluck sun family kite accident this voyage breeze mansion glide wool still goat useless unaware bounce brother run dog';

        const wallet = generateWallet(mnemonic);

        console.log(wallet)

        // 创建根密钥
        // const root = bip32.fromSeed(seed);
        //
        // //  / 推导 BIP44 路径 m/44'/133'/0'/0/0
        // const path = `m/44'/133'/0'`;
        // const childKey = root.derivePath(path);
        //
        // // 获取私钥
        // const privateKey = childKey.privateKey.toString('hex');
        // console.log(privateKey);


    })


})

