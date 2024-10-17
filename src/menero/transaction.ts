
import {
    MoneroWalletFull,
    MoneroNetworkType,
    MoneroTxPriority,
    MoneroConnectionManager,
    MoneroWalletConfig,
} from 'monero-ts';
import moneroTs from "monero-ts";
require('dotenv').config();


export async function signTransaction(params:any) {
    const start = Date.now();
    // 生成一个离线钱包（用来离线签）
    const { mnemonic } = params;
    const config = new MoneroWalletConfig();
    config.setSeed(mnemonic);
    // config.setPath('/Users/zhulida/Monero/wallets/Leo/temp/Offline');
    config.setNetworkType(MoneroNetworkType.MAINNET)
    // const offlineWallet = await MoneroWalletFull.openWallet(config);
    let offlineWallet = await moneroTs.createWalletFull(config);
    const initOfflineCost = Date.now();
    console.log("离线钱包创建完成,耗时:",initOfflineCost-start);

    // 生成一个viewOnly钱包（用来创建交易）
    // create and sync view-only wallet without spend key

    const viewOnlyConfig = new MoneroWalletConfig();
    // viewOnlyConfig.setPath('/Users/zhulida/Monero/wallets/Leo/temp/ViewOnly');
    viewOnlyConfig.setNetworkType(MoneroNetworkType.MAINNET);
    viewOnlyConfig.setPrimaryAddress("46YkJDmikFfBAv61FH9pQsbSPm8K2nbT2eQ4gsgSCSi2jN2aE2YhjjQ39RVhxpAqzo4xoHQcGMbWzVqNnepGd3aoSevHHkU");
    viewOnlyConfig.setPrivateViewKey(process.env.PRIVATE_VIEW_KEY);
    viewOnlyConfig.setRestoreHeight(3260750);

    viewOnlyConfig.setServer("http://137.220.120.19:18089")

    let viewOnlyWallet =await moneroTs.createWalletFull(viewOnlyConfig);
    // let viewOnlyWallet = await MoneroWalletFull.openWallet(viewOnlyConfig);
    const initViewOnly = Date.now();
    console.log("viewOnly钱包创建完成,耗时",initViewOnly-initOfflineCost);
    await viewOnlyWallet.setDaemonConnection("http://137.220.120.19:18089")
    await viewOnlyWallet.sync();
    const sync = Date.now();
    console.log("钱包同步完成,耗时",sync-initViewOnly)

    const balance = await viewOnlyWallet.getBalance();
    const pvk = await viewOnlyWallet.getPublicViewKey();
    console.log(balance,pvk)


    const tx = await viewOnlyWallet.createTx({
        accountIndex: 0,
        address: "89PmbkZCu2s4xpkuYYHsUTGiUnpsNsaxFCqEF2J322NacY183Najv1MPxaGa7oc4XMf6dJ2Eo7fKNjZPp2SgV5sGDxxn68z",
        amount: 2000000000n,
    })
    const createTxConst = Date.now();
    console.log("创建交易完成，耗时",createTxConst-sync)

    // console.log(tx)

    let signedTxSet = await offlineWallet.signTxs(tx.txSet.unsignedTxHex);
    console.log("离线签名完成，耗时",Date.now()-createTxConst)

    console.log(signedTxSet)

    const txHash = await viewOnlyWallet.submitTxs(signedTxSet.getSignedTxHex())
    console.log("交易总耗时",Date.now()-start)
    return txHash
}

export async function createAndSendMeneroTransaction(){
    // 根据密码打开当前的钱包
    const config = new MoneroWalletConfig();
    // config.setSeed(mnemonic);
    config.setPath("/Users/zhulida/Monero/wallets/Leo/Leo")
    // 需要被加密
    config.setPassword(process.env.MENERO_PASSWORD)
    config.setNetworkType('mainnet')

    let connectionManager = new MoneroConnectionManager();
    await connectionManager.addConnection({uri: "http://137.220.120.19:18089",priority: 1});
    await connectionManager.addConnection({uri: "http://node.community.rino.io:18081"});
    await connectionManager.addConnection({uri: "xmr.monopolymoney.eu:18089"});
    config.setConnectionManager(connectionManager)

    const wallet = await MoneroWalletFull.openWallet(config);

    const walletProxy =await wallet.getWalletProxy();
    console.log(walletProxy)
    wallet.setDaemonConnection({uri: "http://137.220.120.19:18089"})

    const balance = await wallet.getBalance();
    const pvk = await wallet.getPublicViewKey();
    console.log(balance,pvk)

    // await wallet.setConnectionManager(connectionManager)

    let tx = await wallet.createTx({
        accountIndex: 0,
        address: "89PmbkZCu2s4xpkuYYHsUTGiUnpsNsaxFCqEF2J322NacY183Najv1MPxaGa7oc4XMf6dJ2Eo7fKNjZPp2SgV5sGDxxn68z",
        amount: 1000000000n,
        priority: MoneroTxPriority.NORMAL,
    })

    console.log(tx);

    return await wallet.relayTx(tx);

}