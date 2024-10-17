import * as bitcoin from 'bitcoinjs-lib';
const ecc = require('tiny-secp256k1');
const { BIP32Factory } = require('bip32');
const bip32 = BIP32Factory(ecc);

// 定义支持的网络类型
type NetworkName = 'mainnet' | 'testnet'; // 根据需要添加更多网络

export function createAddress(params: any): any {

    const { seedHex, receiveOrChange, addressIndex, network, method} = params;
    const root = bip32.fromSeed(Buffer.from(seedHex, 'hex'));

    let path = "m/44'/0'/0'/0/" + addressIndex + '';
    if (receiveOrChange === '1') {
        path = "m/44'/0'/0'/1/" + addressIndex + '';
    }

    const child = root.derivePath(path);
    const networkType = bitcoin.networks[network as keyof typeof bitcoin.networks]; // 使用类型断言
    let address: string | undefined;
    switch (method) {
        case 'p2pkh':
            
            const p2pkhAddress = bitcoin.payments.p2pkh({
                pubkey: child.publicKey,
                network: networkType
              });
              address = p2pkhAddress.address;
              break;
        case 'p2wpkh':
                // eslint-disable-next-line no-case-declarations
            const p2wpkhAddress = bitcoin.payments.p2wpkh({
                pubkey: child.publicKey,
                network: networkType
            });
            address = p2wpkhAddress.address;
            break;
        case 'p2sh':
                // eslint-disable-next-line no-case-declarations
            const p2shAddress = bitcoin.payments.p2sh({
                redeem: bitcoin.payments.p2wpkh({
                    pubkey: child.publicKey,
                    network: networkType
                  })
                }); 
            address = p2shAddress.address;
            break;           
        default:
            console.log('This way can not support');
    }

    return {
        privateKey: Buffer.from(child.privateKey).toString('hex'),
        publicKey: Buffer.from(child.publicKey).toString('hex'),
        address
      };

}