import * as SPLToken from '@solana/spl-token';
import {TransferParams} from "@solana/web3.js";
const { Keypair, NONCE_ACCOUNT_LENGTH, PublicKey, SystemProgram, Transaction } = require("@solana/web3.js");
const BigNumber = require('BigNumber.js');


export async function signSolTransaction(params: any) {

    const { from, amount, nonceAccount, to, mintAddress, nonce, decimal, privateKey } = params;
    const fromAccount = Keypair.fromSecretKey(new Uint8Array(Buffer.from(privateKey, 'hex')), { skipValidation :true });
    const calcAmount = new BigNumber(amount).times(new BigNumber(10).pow(decimal)).toString();

    if (calcAmount.indexOf('.') !== -1) throw new Error('decimal 无效');
    const tx = new Transaction();
    const toPubkey = new PublicKey(to);
    const fromPubkey = new PublicKey(from);
    tx.recentBlockhash = nonce;
    if (mintAddress) {
        const mint = new PublicKey(mintAddress);
        const fromTokenAccount = await SPLToken.Token.getAssociatedTokenAddress(
            SPLToken.ASSOCIATED_TOKEN_PROGRAM_ID,
            SPLToken.TOKEN_PROGRAM_ID,
            mint,
            fromPubkey
        );
        const toTokenAccount = await SPLToken.Token.getAssociatedTokenAddress(
            SPLToken.ASSOCIATED_TOKEN_PROGRAM_ID,
            SPLToken.TOKEN_PROGRAM_ID,
            mint,
            toPubkey
        );
        tx.add(
            SystemProgram.nonceAdvance({
                noncePubkey: new PublicKey(nonceAccount),
                authorizedPubkey: fromAccount.publicKey
            }),
            SPLToken.Token.createTransferInstruction(
                SPLToken.TOKEN_PROGRAM_ID,
                fromTokenAccount,
                toTokenAccount,
                fromPubkey,
                [fromAccount],
                Number(calcAmount)
            )
        );
    } else {
        tx.add(
            SystemProgram.nonceAdvance({
                noncePubkey: new PublicKey(nonceAccount),
                authorizedPubkey: fromAccount.publicKey
            }),
            SystemProgram.transfer({
                fromPubkey: fromAccount.publicKey,
                toPubkey: new PublicKey(to),
                lamports: Number(calcAmount)
            })
        );
    }
    tx.sign(fromAccount);
    return tx.serialize().toString('base64');
}