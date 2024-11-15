import { Ed25519Keypair, fromB64 } from '@mysten/sui.js';



export function createSuiAddress (seedHex: string, receiveOrChange: string, addresIndex: string, network: string): any {
    // const keyPair = Ed25519Keypair.deriveKeypairFromSeed(seedHex, "m/44'/784'/0'/0'/${addresIndex}'");
    const keyPair = Ed25519Keypair.deriveKeypairFromSeed(seedHex,"m/44'/784'/0'/0'/"+addresIndex+"'")
    return {
        privateKey: Buffer.from(fromB64(keyPair.export().privateKey)).toString('hex'),
        publicKey: Buffer.from(keyPair.getPublicKey().toBytes()).toString('hex'),
        address: keyPair.getPublicKey().toSuiAddress()
    };
}