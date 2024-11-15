import {createSuiAddress} from "../../src/sui/account";
import {mnemonicToSeed} from "bip39";


describe('sui unit test case',()=>{
    test('create sui adress', async () => {
        // const mnemonic = "around dumb spend sample oil crane plug embrace outdoor panel rhythm salon";
        const mnemonic = "piece super wrestle timber desk layer walnut reward clock sleep reunion alter neglect timber tiger chronic path rely scrub segment hotel orbit secret metal"
        const params_1 = {
            mnemonic: mnemonic,
            password: ""
        }
        const seed = await mnemonicToSeed(mnemonic,"")
        const account = createSuiAddress(seed.toString("hex"), "0", "0", "mainnet")
        console.log(account)
    });


})