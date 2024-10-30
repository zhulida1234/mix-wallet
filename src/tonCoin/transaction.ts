import {internal,external,beginCell,storeMessage, TonClient, WalletContractV4} from "@ton/ton";
import TonWeb from "tonweb-lite";
import {getHttpEndpoint} from "@orbs-network/ton-access";
import core_1 from "@ton/core";


export async function createTransaction(account:any){
    const {publicKey,privateKey,address} = account;

    const wallet = WalletContractV4.create({ publicKey: Buffer.from(publicKey,"hex"), workchain: 0 });

    // initialize ton rpc client on testnet
    const endpoint = await getHttpEndpoint({ network: "mainnet" });
    const client = new TonClient({ endpoint });

    const walletContract = client.open(wallet);
    const seqno = await walletContract.getSeqno();

    const balance = await client.getBalance(wallet.address);
    console.log('seqno',seqno)
    console.log('balance',balance)

    const tx = await walletContract.createTransfer({
        secretKey: Buffer.from(privateKey,"hex"),
        seqno:seqno,
        messages: [
            internal({
                to: "UQDOo-WUcxQnZmAeAFHJGgp_Jdqs_t_mjxGUTuYbSklG1MDx",
                value: "0.01",
                bounce: false,
            })
        ]
    })

    console.log("tx.hash",tx.hash().toString("hex"))
    const tonweb = new TonWeb();

    // 最后一步是发送交易的逻辑，如果不需要，可以注释掉
    // await walletContract.send(tx);

    // 后面几步是将交易打包成可以执行的boc格式
    const ext = external({
        to: wallet.address,
        body: tx
    })
    console.log('ext',ext)

    const builder = beginCell();
    const finalBoc = builder.store(storeMessage(ext)).endCell().toBoc()

    return tonweb.utils.bytesToBase64(finalBoc);

}