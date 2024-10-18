import crypto from "crypto";
import {wordList} from "./wordList/Englist";
import crc32 from "crc-32";
const n = 1626;
const NETS = ['NET_MAIN', 'NET_TEST', 'NET_STAGE'];
const assert = require('assert');
const NET_BYTES = [18, 53, 24]; // 主网、测试网、预备网络的网络字节
const { keccak256 } = require('js-sha3');
import { MoneroWalletConfig, MoneroWalletFull } from 'monero-ts';
import moneroTs from "monero-ts";
import {Networks} from "bitcore-lib";
const base58 = require('bs58');

/**
 * 对数据进行大端序（Big-endian）和小端序（Little-endian）之间的转换
 * @param word
 */
function endianSwap(word:any) {
    return word.match(/.{2}/g).reverse().join('');
}

/**
 * 提取校验和
 * @param phrase
 */
function getChecksum(phrase:any) {
    const words = phrase.split(' ');
    const prefixLength = 3; // unique prefix length, e.g., first 3 characters
    // 取前12个 或 24个单词，从每个单词中取前3个字节，拼接成一个字符串
    const wstr = words.slice(0, words.length > 13 ? 24 : 12)
        .map((word:any) => word.substring(0, prefixLength))
        .join('');
    // 使用crc32.buf 函数对wstr进行crc32 hash 运算，并将计算结果转成非负整数，再对单词总数取模
    const z = (crc32.buf(Buffer.from(wstr, 'utf8')) >>> 0) % words.length;
    return words[z];
}

/**
 * 根据publicSpendKey 和 publicViewKey 生成地址
 * @param publicSpendKey
 * @param publicViewKey
 * @param net
 */
function generatePublicAddress(params: any) {
    const{publicSpendKey, publicViewKey, net = 'NET_MAIN'} = params;
    // 验证网络类型
    const netIndex = NETS.indexOf(net);
    assert(netIndex !== -1, "Invalid network type");

    // 获取网络字节
    const netByte = NET_BYTES[netIndex];

    // 拼接数据字符串
    const data = netByte.toString(16) + publicSpendKey + publicViewKey;

    // 生成 Keccak-256 校验和并截取前8个字符
    const checksum = keccak256(Buffer.from(data, 'hex')).slice(0, 8);

    // 完整数据字符串（带校验和）
    const fullData = data + checksum;

    // 使用 base58 编码
    return base58.encode(Buffer.from(fullData, 'hex'));

}

/**
 * 将助记词重新转换为hex
 * @param phrase
 */
function wordListToHex(phrase: any) {
    const words = phrase.split(' ');
    let out = '';

    for (let i = 0; i < words.length / 3; i++) {
        const word1 = words[3 * i];
        const word2 = words[3 * i + 1];
        const word3 = words[3 * i + 2];

        const w1 = wordList.indexOf(word1);
        const w2 = wordList.indexOf(word2) % n;
        const w3 = wordList.indexOf(word3) % n;

        const x = w1 + n * ((w2 - w1 + n) % n) + n * n * ((w3 - w2 + n) % n);
        out += endianSwap(x.toString(16).padStart(8, '0'));
    }

    // 需要扣除掉校验和对应的后8位
    return out.slice(0,-8);
}

/**
 * 生成25位助记词
 * @param len
 */
export function createMeneroMnemonic(len:any){
    const buffer = crypto.randomBytes(32);
    const hexStr = buffer.toString('hex');
    const out = [];

    for(let i=0; i< hexStr.length/8;i++){
        const word = endianSwap(hexStr.slice(8 * i, 8 * i +8));
        const x = parseInt(word, 16);
        const w1 = x % n;
        const w2 = (Math.floor(x / n) + w1) % n;
        const w3 = (Math.floor(x / (n * n)) + w2) % n;
        out.push(wordList[w1], wordList[w2], wordList[w3]);
    }

    // 计算校验和
    const checksum = getChecksum(out.join(' '));
    out.push(checksum);

    return out.join(' ');
}

/**
 * 根据助记词导出公私钥
 * @param mnemonic
 */
export async function generateMeneroKeyPair(mnemonic:any){

    // const hex = wordListToHex(mnemonic)
    // console.log(hex)

    const config = new MoneroWalletConfig();
    config.setSeed(mnemonic);
    config.setNetworkType('mainnet')

    const wallet = await MoneroWalletFull.createWallet(config);

    const address = await wallet.getPrimaryAddress()
    const publicSpendKey = await wallet.getPublicSpendKey();
    const privateSpendKey = await wallet.getPrivateSpendKey();
    const publicViewKey = await wallet.getPublicViewKey();
    const privateViewKey = await wallet.getPrivateViewKey()

    return {
        primaryAddress:address,
        publicSpendKey:publicSpendKey,
        publicViewKey:publicViewKey,
        privateSpendKey:privateSpendKey,
        privateViewKey:privateViewKey
    }

}

/**
 * 生成随机钱包（包含助记词,公私钥....）
 */
export async function generateWallet(){

    let walletKeys = await moneroTs.createWalletKeys({networkType: moneroTs.MoneroNetworkType.MAINNET, language: "English"});
    const mnemonic = await walletKeys.getSeed();
    const address = await walletKeys.getPrimaryAddress();
    const spendKey = await walletKeys.getPublicSpendKey();
    const privateKey = await walletKeys.getPrivateSpendKey();
    console.log("Seed phrase: " + mnemonic);
    console.log("Address: " + address); // get address of account 0, subaddress 0
    console.log("Spend key: " + spendKey);
    console.log("Private key: " + privateKey);

    const wallectAccount ={
        mnemonic: mnemonic,
        address: address,
        spendKey: spendKey,
        privateKey: privateKey
    }

}


