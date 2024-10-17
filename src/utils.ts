const axios = require('axios');

export async function getRecentBlockhash() {
    const url = 'https://api.mainnet-beta.solana.com';
    const headers = {
        'Content-Type': 'application/json'
    };
    const data = {
        jsonrpc: '2.0',
        id: 1,
        method: 'getLatestBlockhash',
        params: [
            {
                commitment: "processed"
            }
        ]
    };

    const response = await axios.post(url, data, { headers,
        proxy: {
            protocol: "http",
            host: '127.0.0.1',
            port: 7890,
        }});
    return response.data.result.value.blockhash;

}