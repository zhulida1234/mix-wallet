// @ts-ignore
import { Interface } from '@ethersproject/abi';
import { FeeMarketEIP1559Transaction, Transaction } from '@ethereumjs/tx'
import Common from '@ethereumjs/common'

const ethers = require('ethers');
const BigNumber = require('BigNumber.js');


function numberToHex(value: any) {
    const number = BigNumber(value);
    const result = number.toString(16);
    return '0x' + result;
}

export function ethSign(params: any) {
    let { privateKey, nonce, from, to, gasPrice, gasLimit, amount, tokenAddress, tokenId, decimal, maxPriorityFeePerGas, maxFeePerGas, chainId, data } = params;
    const transactionNonce = numberToHex(nonce);
    const gasLimits = numberToHex(gasLimit);
    const chainIdHex = numberToHex(chainId);
    let newAmount = BigNumber(amount).times((BigNumber(10).pow(decimal)));
    const numBalanceHex = numberToHex(newAmount);
    let txData: any = {
        nonce: transactionNonce,
        gasLimit: gasLimits,
        to,
        from,
        chainId: chainIdHex,
        value: numBalanceHex
    }
    if (maxFeePerGas && maxPriorityFeePerGas) {
        txData.maxFeePerGas = numberToHex(maxFeePerGas);
        txData.maxPriorityFeePerGas = numberToHex(maxPriorityFeePerGas);
    } else {
        txData.gasPrice = numberToHex(gasPrice);
    }
    if (tokenAddress && tokenAddress !== "0x00") {
        if (tokenId) {  // 检查 tokenId 是否存在
            const ABI = [
                "function safeTransferFrom(address from, address to, uint256 tokenId)"
            ];
            const iface = new Interface(ABI);
            txData.data = iface.encodeFunctionData("safeTransferFrom", [from, to, tokenId]); // 使用 safeTransferFrom 方法
            txData.to = tokenAddress;
            txData.value = 0;
        } else {
            const ABI = [
                "function transfer(address to, uint amount)"
            ];
            const iface = new Interface(ABI);
            txData.data = iface.encodeFunctionData("transfer", [to, numBalanceHex]);
            txData.to = tokenAddress;
            txData.value = 0;
        }
    }
    if (data) {
        txData.data = data;
    }
    let common: any, tx: any;
    if (txData.maxFeePerGas && txData.maxPriorityFeePerGas) {
        common = (Common as any).custom({
            chainId: chainId,
            defaultHardfork: "london"
        });
        tx = FeeMarketEIP1559Transaction.fromTxData(txData, {
            common
        });
    } else {
        common = (Common as any).custom({ chainId: chainId })
        tx = Transaction.fromTxData(txData, {
            common
        });
    }
    console.log('tx',tx)
    const privateKeyBuffer = Buffer.from(privateKey, "hex");
    const signedTx = tx.sign(privateKeyBuffer);
    const serializedTx = signedTx.serialize();
    if (!serializedTx) {
        throw new Error("sign is null or undefined");
    }
    return `0x${serializedTx.toString('hex')}`;
}
