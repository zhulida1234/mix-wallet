const ethers = require('ethers');
import * as bech32 from "bech32";
const ecc = require('tiny-secp256k1');
const { BIP32Factory } = require('bip32');
const bip32 = BIP32Factory(ecc);
const common_1 = require("avalanche/dist/common");


export function generateAccountBothCPXAddress(seed: Buffer){

    const hdNode = ethers.utils.HDNode.fromSeed(seed);
    const {
        privateKey,
        publicKey,
        address
    } = hdNode.derivePath("m/44'/60'/0'/0/0");

    const root = bip32.fromSeed(seed);

    const child = root.derivePath("m/44'/9000'/0'/0/0");

    const addressBuffer = common_1.SECP256k1KeyPair.addressFromPublicKey(child.publicKey)
    const addressP = addressToString("avax", 'P', addressBuffer);
    const addressX = addressToString("avax",'X', addressBuffer);

    return {
        chainCPrivateKey:privateKey,
        chainCPublicKey:publicKey,
        chainCAddress:address,
        chainPAddress:addressP,
        chainXAddress:addressX
    }
}

function addressToString(hrp: string, chainid: string, bytes: Buffer): string {
    return `${chainid}-${bech32.bech32.encode(hrp, bech32.bech32.toWords(bytes))}`;
}

