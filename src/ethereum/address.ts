const ethers = require('ethers');
const bip39 = require('bip39');

export function createEthAddress (mnemonic: string, addressIndex: string) {
    const seed = bip39.mnemonicToSeedSync(mnemonic)
    const hdNode = ethers.utils.HDNode.fromSeed(Buffer.from(seed.toString("hex"), 'hex'));
    const {
        privateKey,
        publicKey,
        address
    } = hdNode.derivePath("m/44'/60'/0'/0/" + addressIndex + '');
    return {
        privateKey,
        publicKey,
        address
    };
}
