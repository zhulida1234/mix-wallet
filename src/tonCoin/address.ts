import {
    fromNano,
    TonClient,
    WalletContractV3R1,
    WalletContractV3R2,
    WalletContractV4,
    WalletContractV5Beta,
    WalletContractV5R1
} from "@ton/ton";
import crypto from "crypto";
import {mnemonicToSeed, mnemonicToSeedSync} from "bip39";
import {keyPairFromSeed} from "@ton/crypto";
import {WalletVersion} from "./walletCommon";
import {derivePath, getPublicKey} from "ed25519-hd-key";
import TonWeb from "tonweb-lite";
import {getHttpEndpoint} from "@orbs-network/ton-access";
const HARDENED_OFFSET = 0x80000000;
const ED25519_CURVE = 'ed25519 seed';
const replaceDerive = (val: string): string => val.replace("'", '');



type Keys = {
    key: Buffer;
    chainCode: Buffer;
};

function getMasterKeyFromSeed(seed: string): Keys {
    const hmac = crypto.createHmac('sha512', ED25519_CURVE);
    const I = hmac.update(Buffer.from(seed, 'hex')).digest();
    const IL = I.slice(0, 32);
    const IR = I.slice(32);
    return {
        key: IL,
        chainCode: IR
    };
}

function CKDPriv({ key, chainCode }: Keys, index: number): Keys {
    const indexBuffer = Buffer.allocUnsafe(4);
    indexBuffer.writeUInt32BE(index, 0);

    const data = Buffer.concat([Buffer.alloc(1, 0), key, indexBuffer]);

    const I = crypto.createHmac('sha512', chainCode).update(data).digest();
    const IL = I.slice(0, 32);
    const IR = I.slice(32);
    return {
        key: IL,
        chainCode: IR
    };
}


async function mnemonicToKeypair(mnemonic:string) {
    const seed = await mnemonicToSeed(mnemonic);
    const TON_DERIVATION_PATH = "m/44'/607'/0'";
    // const seedContainer = deriveED25519Path(TON_DERIVATION_PATH, seed.toString('hex'));

    const { key, chainCode } = getMasterKeyFromSeed(seed.toString("hex"));
    const segments = TON_DERIVATION_PATH
        .split('/')
        .slice(1)
        .map(replaceDerive)
        // eslint-disable-next-line radix
        .map(el => parseInt(el, 10));

    const seedContainer =  segments.reduce((parentKeys, segment) => CKDPriv(parentKeys, segment + HARDENED_OFFSET), {
        key,
        chainCode
    });

    return keyPairFromSeed(seedContainer.key)
}

export async function createAddressByWalletVersion(mnemonic:string,version:WalletVersion){

    const keyPair = await mnemonicToKeypair(mnemonic)

    let wallet;
    let address = "";
    let balance;

    // initialize ton rpc client on testnet
    const endpoint = await getHttpEndpoint({ network: "mainnet" });
    const client = new TonClient({ endpoint });

    switch (version) {
        case WalletVersion.V3R1:
             wallet = WalletContractV3R1.create({ workchain:0, publicKey:keyPair.publicKey })
             address = wallet.address.toString({bounceable:false});
             balance = await client.getBalance(wallet.address);
             break;
        case WalletVersion.V3R2:
            wallet = WalletContractV3R2.create({ workchain:0, publicKey:keyPair.publicKey })
            address = wallet.address.toString({bounceable:false});
            balance = await client.getBalance(wallet.address);
            break;
        case WalletVersion.V4R1:
            throw new Error('Unsupported wallet contract version - v4R1');
        case WalletVersion.V4R2:
            wallet = WalletContractV4.create({ workchain:0, publicKey:keyPair.publicKey });
            address = wallet.address.toString({bounceable:false});
            balance = await client.getBalance(wallet.address);
            break;
        case WalletVersion.V5_BETA:
            wallet = WalletContractV5Beta.create({
                walletId: {
                    networkGlobalId: -239
                },
                publicKey:keyPair.publicKey
            });
            address = wallet.address.toString({bounceable:false});
            balance = await client.getBalance(wallet.address);
            break;
        case WalletVersion.V5R1:
            wallet = WalletContractV5R1.create({ publicKey:keyPair.publicKey });
            address = wallet.address.toString({bounceable:false});
            balance = await client.getBalance(wallet.address);
            break;
    }

    // query balance from chain
    console.log("balance:", fromNano(balance));

    const account ={
        publicKey: keyPair.publicKey.toString("hex"),
        privateKey: keyPair.secretKey.toString("hex"),
        address : address
    }

    return account;
}

export async function createAddressByMnemonic(mnemonic:string){
    const seedHex = mnemonicToSeedSync(mnemonic)
    const { key } = derivePath("m/44'/607'/0'", seedHex.toString("hex"));
    const publicKey = getPublicKey(key, false).toString('hex');

    const tonweb = new TonWeb();
    const WalletClass = tonweb.wallet.all['v4R2'];

    const publikKey = new Uint8Array(Buffer.from(publicKey, "hex"))
    const wallet = new WalletClass(tonweb.provider, {
        publicKey: publikKey,
        wc: 0
    });
    const walletAddress =  await wallet.getAddress();

    return {
        publicKey:publicKey,
        privateKey:key.toString('hex') + publicKey,
        address:walletAddress.toString(true, true, false, false)
    }
}

