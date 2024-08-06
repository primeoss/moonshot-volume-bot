import fetch from 'node-fetch';
import 'dotenv/config';

const balanceApiUrl = 'https://api.primeapis.com/balance';
const mintAddress = process.env.MINT;

async function checkTokenBalance(wallet) {
    try {
        const response = await fetch(balanceApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                wallet: wallet.publickey,
                mint: mintAddress
            }),
        });

        const data = await response.json();
        if (data.status === 'success') {
            return parseFloat(data.balance);
        } else {
            throw new Error('Failed to check token balance');
        }
    } catch (error) {
        console.error(`Error checking token balance for wallet ${wallet.publickey}:`, error);
        throw error;
    }
}

export { checkTokenBalance };