import * as bip39 from "bip39";
import {generateAccountBothCPXAddress} from "../../src/avax/address"
import {BitGoAPI} from '@bitgo/sdk-api';
import {AvaxC, TransactionBuilder} from '@bitgo/sdk-coin-avaxc'
import {CoinFamily, CoinKind, coins, Networks} from '@bitgo/statics/dist/src'
import {BaseCoin, TransactionType} from "@bitgo/sdk-core";

require('dotenv').config();

describe('avax wallet test case',()=>{

    let bitgoapi: BitGoAPI;
    let avaxCoin: BaseCoin;

    const account_1 = {
        address: '0xeeaf0F05f37891ab4a21208B105A0687d12c5aF7',
        owner_1: '4ee089aceabf3ddbf748db79b1066c33b7d3ea1ab3eb7e325121bba2bff2f5ca',
        owner_2: '5ca116d25aec5f765465432cc421ff25ef9ffdc330b10bb3d9ad61e3baad88d7',
        owner_3: '1fae946cc84af8bd74d610a88537e24e19c3349d478d86fc5bb59ba4c88fb9cc',
    };

    beforeAll(()=>{
        bitgoapi = new BitGoAPI({ env: 'prod' });
        bitgoapi.register('avaxc', AvaxC.createInstance);

        avaxCoin = bitgoapi.coin('avaxc')

    })


    test('create account with c-chain',()=>{
        // set this to 'test' environment for testing, or 'prod' for production.

        const mnemonic = process.env.AVAX_MNEMONIC!;
        const seed = bip39.mnemonicToSeedSync(mnemonic,"")

        const account = generateAccountBothCPXAddress(seed);

        console.log(account)

    })

    test('test offline sign transaction with chain c',async ()=>{

        const mnemonic = process.env.AVAX_MNEMONIC!;
        const seed = bip39.mnemonicToSeedSync(mnemonic,"")

        const account = generateAccountBothCPXAddress(seed);
        console.log(account.chainCPrivateKey)

        const builder = new TransactionBuilder(coins.get('avaxc'))
        builder.fee({
            fee: '28000000000',
            gasLimit: '7000000',
        })
        //counter其实就是nonce
        builder.counter(1)
        builder.type(TransactionType.Send)
        builder.contract(account.chainCAddress)
        builder.transfer().amount('1').to("0xeeaf0F05f37891ab4a21208B105A0687d12c5aF7").expirationTime(10000).contractSequenceId(1);

        builder.sign({ key: account.chainCPrivateKey.slice(2) });

        const unsignedTx = await builder.build();
        console.log(unsignedTx)
        const json = unsignedTx.toJson()
        console.log("json from ?",json.from)
        const unsignedTxForBroadcasting = unsignedTx.toBroadcastFormat();
        console.log(unsignedTxForBroadcasting)

        // const halfSignedRawTx = await avaxCoin.signTransaction({
        //     txPrebuild: {
        //         txHex: unsignedTxForBroadcasting,
        //     },
        //     prv: account_1.owner_2,
        //
        // });
        //
        // console.log(halfSignedRawTx)

        // avaxCoin.signMessage()
        // avaxCoin.signTransaction()


    })

    // staking amount
    test('test offline sign transaction with chain p',()=>{


    })


})




