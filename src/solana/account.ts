const bip39 = require('bip39');
const { Authorized,Keypair,Lockup,Transaction,SystemProgram,NONCE_ACCOUNT_LENGTH,StakeProgram,PublicKey } = require("@solana/web3.js");
const { derivePath } = require('ed25519-hd-key');
const bs58 = require('bs58');


export function generateSolKeyPair(mnemonic: any, addressIndex: string):any {
    const seed = bip39.mnemonicToSeedSync(mnemonic);

    let accountFromSeed = Keypair.fromSeed(derivePath("m/44'/501'/0'/" + addressIndex + "'", seed.toString('hex')).key);

    // console.log(accountFromSeed.publicKey.toBase58());
    // console.log(Buffer.from(accountFromSeed.secretKey).toString('hex'));

    const account = {
        publicKey: accountFromSeed.publicKey.toBase58(),
        privateKey: bs58.encode(accountFromSeed.secretKey),
        privateKeyHex: Buffer.from(accountFromSeed.secretKey).toString('hex')
    }
    return account;
}


export function prepareAccount(params:any) {
    const {
        authorAddress, from, recentBlockhash, minBalanceForRentExemption, privs,
    } = params;

    const authorPrivateKey = (privs?.find((ele: { address: any; })=>ele.address===authorAddress))?.key;
    if(!authorPrivateKey) throw new Error("authorPrivateKey 为空");
    const nonceAcctPrivateKey = (privs?.find((ele: { address: any; })=>ele.address===from))?.key;
    if(!nonceAcctPrivateKey) throw new Error("nonceAcctPrivateKey 为空");

    const author = Keypair.fromSecretKey(new Uint8Array(Buffer.from(authorPrivateKey, "hex")));
    const nonceAccount = Keypair.fromSecretKey(new Uint8Array(Buffer.from(nonceAcctPrivateKey, "hex")));


    let tx = new Transaction();
    tx.add(
        SystemProgram.createAccount({
            fromPubkey: author.publicKey,
            newAccountPubkey: nonceAccount.publicKey,
            lamports: minBalanceForRentExemption,
            space: NONCE_ACCOUNT_LENGTH,
            programId: SystemProgram.programId,
        }),

        SystemProgram.nonceInitialize({
            noncePubkey: nonceAccount.publicKey,
            authorizedPubkey: author.publicKey,
        })
    );
    tx.recentBlockhash = recentBlockhash;


    tx.sign(author, nonceAccount);
    return tx.serialize().toString("base64");
}


/**
 * address
 * network type
 * @param params
 */
export function verifySolAddress (params: any) {
    const { address } = params;
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}


export function createStakingAccount(params: any) {
    const {authorPrivateKey, stakeAccountPrivateKey, lamportsForStakeAccount, recentBlockhash, votePubkeyStr } = params
    let tx = new Transaction();

    const fromPublicKey = Keypair.fromSecretKey(new Uint8Array(Buffer.from(authorPrivateKey, "hex")));
    let authorizedAccount = fromPublicKey;
    const stakeAccount = Keypair.fromSecretKey(new Uint8Array(Buffer.from(stakeAccountPrivateKey, 'hex')), { skipValidation: true });
    // 创建质押账户
    let createAccountTransaction = StakeProgram.createAccount({
        fromPubkey: fromPublicKey.publicKey,
        authorized: new Authorized(authorizedAccount.publicKey, authorizedAccount.publicKey),
        lamports: lamportsForStakeAccount,
        lockup: new Lockup(0, 0, fromPublicKey.publicKey),
        stakePubkey: stakeAccount.publicKey
    });
    tx.add(createAccountTransaction);

    // 设置委托
    let votePubkey = new PublicKey(votePubkeyStr);
    let delegateTransaction = StakeProgram.delegate({
        authorizedPubkey: authorizedAccount.publicKey,
        stakePubkey: stakeAccount.publicKey,
        votePubkey: votePubkey,
    });
    tx.add(delegateTransaction)

    tx.recentBlockhash = recentBlockhash;
    tx.sign(fromPublicKey,stakeAccount);

    return tx.serialize().toString("base64");
}