const bip39 = require('bip39');
const ethers = require('ethers');
import { hdkey } from "@ethereumjs/wallet";
// import { hdkey } from '@ethereumjs/wallet';
const { privateToPublic,publicToBuffer, toBuffer } = require('ethereumjs-util');


export function createMnemonic(length: any) {
    // 生成 12 字的助记词
  const mnemonic = bip39.generateMnemonic(128); // 128 bits => 12 words

  return mnemonic;
}

export function validationMnemonic(mnemonic: any) {
    // 验证助记词是否正确
    const bool = bip39.validateMnemonic(mnemonic);
    return bool;
}

export function generateKeyPair(mnemonic: any, addressIndex: string) {
    // 生成种子
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    // 通过种子生成 HD 钱包
    const hdNode = ethers.utils.HDNode.fromSeed(Buffer.from(seed.toString("hex"), 'hex'));
    const {
        privateKey,
        publicKey,
        address
    } = hdNode.derivePath("m/44'/60'/0'/0/" + addressIndex + '');
    
    return {privateKey,publicKey}
}

export function compressPublicKey(publicKey: any) {
  const pubKeyBuffer = toBuffer(publicKey);

  const x = pubKeyBuffer.slice(1, 33); // x 坐标
  const y = pubKeyBuffer.slice(33, 65); // y 坐标
  const prefix = y[31] % 2 === 0 ? Buffer.from([0x02]) : Buffer.from([0x03]);
  return Buffer.concat([prefix, x]).toString('hex');
}



