import BIP32Factory from 'bip32';
import * as ecc from 'tiny-secp256k1';
const bip32 = BIP32Factory(ecc);
const { fromHex, toBase64 } = require('@cosmjs/encoding');
const {
    Secp256k1Wallet,
    pubkeyToAddress: atomPubkeyToAddress
} = require('@cosmjs/amino');
const BigNumber = require('bignumber.js');
const {createSendMessage, createTxBody, createTxRawBytes }  = require("./proto-tx-service")
const { isValidAddress, verifyChecksum } = require("./validator");
const { getSignDoc, getAuthInfo, getDirectSignature } = require("./post-ibc-signer");



/**
 * Get address from seed
 * @param seedHex
 * @param addressIndex
 * @returns
 */
// 将公钥-->base64 编码--> 根据编码判断是 secp256k1 还是 ed25519 的公钥---> sha256---->ripemd160---> bech32 编码
export async function createAtomAddress(seedHex: string, addressIndex: string, network: string) {
    const node = bip32.fromSeed(Buffer.from(seedHex, 'hex'));
    const child = node.derivePath("m/44'/118'/0'/0/" + addressIndex + '');
    const publicKey = Buffer.from(child.publicKey.toString("hex"), 'hex');
    const prefix = 'cosmos';
    const pubkey = {
        type: 'tendermint/PubKeySecp256k1',
        value: toBase64(
            fromHex(publicKey.toString('hex'))
        )
    };
    const address = atomPubkeyToAddress(pubkey, prefix);
    return {
        privateKey: child.privateKey ? child.privateKey.toString('hex') : null,
        publicKey: Buffer.from(child.publicKey).toString('hex'),
        address
    };
}


/**
 * import address
 * private key
 * network
 * @param params
 */
export async function importAtomAddress (params: any) {
    const { privateKey } = params;
    const accounts = await Secp256k1Wallet.fromKey(new Uint8Array(Buffer.from(privateKey, 'hex')), 'cosmos');
    const accountList = await accounts.getAccounts();
    const address = accountList[0].address;
    return {
        privateKey,
        address
    };
}

/**
 * import Address by public key
 * @param publicKey
 */
export function publicKeyToAddress(publicKey: string) {
    const prefix = 'cosmos';
    const pubkey = {
        type: 'tendermint/PubKeySecp256k1',
        value: toBase64(
            fromHex(publicKey)
        )
    };
    return atomPubkeyToAddress(pubkey, prefix);
}


/**
 * address
 * network type
 * @param params
 */
export function verifyAtomAddress (params: any) {
    const { address } = params;
    const regex = new RegExp('^cosmos[a-zA-Z0-9]{39}$');
    return regex.test(address);
}

/**
 * sign transaction
 * @param params
 * @returns
 */
export async function signAtomTransaction (params: any): Promise<string> {
    const { privateKey, chainId, from, to, memo, amount, fee, gas, accountNumber, sequence, decimal } = params;
    const calcAmount = new BigNumber(amount).times(new BigNumber(10).pow(decimal)).toNumber();
    if (calcAmount % 1 !== 0) throw new Error('amount invalid');
    const calcFee = new BigNumber(fee).times(new BigNumber(10).pow(decimal)).toNumber();
    if (calcFee % 1 !== 0) throw new Error('fee invalid');
    const signDoc = {
        msgs: [
            {
                type: 'cosmos-sdk/MsgSend',
                value: {
                    from_address: from,
                    to_address: to,
                    amount: [{ amount: new BigNumber(amount).times(Math.pow(10, decimal)).toString(), denom: 'uatom' }]
                }
            }
        ],
        fee: {
            amount: [{ amount: new BigNumber(fee).times(Math.pow(10, decimal)).toString(), denom: 'uatom' }],
            gas: String(gas)
        },
        chain_id: chainId,
        memo: memo || '',
        account_number: accountNumber.toString(),
        sequence: sequence.toString()
    };
    const signer = await Secp256k1Wallet.fromKey(new Uint8Array(Buffer.from(privateKey, 'hex')), 'cosmos');
    const { signature } = await signer.signAmino(from, signDoc);
    const tx = {
        tx: {
            msg: signDoc.msgs,
            fee: signDoc.fee,
            signatures: [signature],
            memo: memo || ''
        },
        mode: 'sync'
    };
    return JSON.stringify(tx);
}


export async function SignV2Transaction(params: any): Promise<string> {
    const {  chainId, from, to, memo, amount_in, fee, gas, accountNumber, sequence, decimal, privateKey } = params;

    const amount = new BigNumber(amount_in).times(Math.pow(10, decimal)).toString();
    const feeAmount = new BigNumber(fee).times(Math.pow(10, decimal)).toString();
    const unit = "uatom";
    if (amount.toString().indexOf(".") !== -1) {
        throw new Error('input amount value invalid.');
    }
    if (feeAmount.toString().indexOf(".") !== -1) {
        throw new Error('input amount value invalid.');
    }
    if (!verifyAddress({ address: from }) || !verifyAddress({ address: to })) {
        throw new Error('input address value invalid.');
    }
    const sendMessage = createSendMessage(
        from,
        to,
        amount,
        unit
    );
    const messages = [sendMessage];
    const txBody = createTxBody(messages, memo);
    const { pubkey } = await Secp256k1Wallet.fromKey(
        fromHex(privateKey),
        "cosmos"
    );
    const authInfo = await getAuthInfo(
        pubkey,
        sequence.toString(),
        feeAmount,
        unit,
        gas
    );
    const signDoc = getSignDoc(chainId, txBody, authInfo, accountNumber);
    const signature = getDirectSignature(signDoc, fromHex(privateKey));
    const txRawBytes = createTxRawBytes(
        txBody,
        authInfo,
        signature
    );
    const txBytesBase64 = Buffer.from(txRawBytes, 'binary').toString('base64');
    const txRaw = { tx_bytes: txBytesBase64, mode: "BROADCAST_MODE_SYNC" };
    return JSON.stringify(txRaw);
}


function verifyAddress(params: any): boolean {
    const { address } = params;
    try {
        if (!isValidAddress(address) || !verifyChecksum(address)) return false;
        return true;
    } catch (error) {
        return false;
    }
}