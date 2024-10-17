const bitcore = require('bitcore-lib')

export function buildAndSignTx (params: { privateKey: string; signObj: any; network: string; }): string {
    const { privateKey, signObj, network } = params;
    const net = bitcore.Networks[network];
    const inputs = signObj.inputs.map((input: { address: any; txid: any; vout: any; amount: any; })=> {
      return {
        address: input.address,
        txId: input.txid,
        outputIndex: input.vout,
        // eslint-disable-next-line new-cap
        script: new bitcore.Script.fromAddress(input.address).toHex(),
        satoshis: input.amount
      };
    });
    const outputs = signObj.outputs.map((output: { address: any; amount: any; }) => {
      return {
        address: output.address,
        satoshis: output.amount
      };
    });
    const transaction = new bitcore.Transaction(net).from(inputs).to(outputs);
    transaction.version = 2;
    transaction.sign(privateKey);
    return transaction.toString();
  }