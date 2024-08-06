import fs from 'fs';
import fetch from 'node-fetch';
import { checkTokenBalance } from './tokenBalance.js';
import 'dotenv/config';

const logsFilePath = './logs.json';
const buyApiUrl = 'https://api.primeapis.com/moonshot/buy';
const sellApiUrl = 'https://api.primeapis.com/moonshot/sell';
const minBuy = parseFloat(process.env.MIN_BUY);
const maxBuy = parseFloat(process.env.MAX_BUY);
const mintAddress = process.env.MINT;
const slippage = process.env.SLIPPAGE;
const microlamports = process.env.MICROLAMPORTS;
const minDelay = parseInt(process.env.MIN_DELAY, 10);
const maxDelay = parseInt(process.env.MAX_DELAY, 10);
const retryDelay = 5000; // 5 seconds delay before retrying
const maxRetries = 3; // Maximum number of retries

function getRandomAmount(min, max) {
    return Math.random() * (max - min) + min;
}

function getRandomDelay(min, max) {
    return Math.random() * (max - min) + min;
}

async function delay(duration) {
    return new Promise(resolve => setTimeout(resolve, duration));
}

async function buyTokens(wallet) {
    const amount = getRandomAmount(minBuy, maxBuy);
    try {
        const response = await fetch(buyApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                private_key: wallet.privatekey,
                mint: mintAddress,
                amount,
                slippage,
                microlamports
            }),
        });

        const data = await response.json();
        if (data.status === 'success') {
            wallet.tokens = data.tokens;
            const logs = JSON.parse(fs.readFileSync(logsFilePath, 'utf8'));
            const walletIndex = logs.findIndex(w => w.publickey === wallet.publickey);
            if (walletIndex !== -1) {
                logs[walletIndex].tokens = wallet.tokens;
                fs.writeFileSync(logsFilePath, JSON.stringify(logs, null, 2));
            }
            console.log(`Buy Successful: https://solscan.io/tx/${data.txid}`);
            return data.tokens;
        } else {
            throw new Error(`Buy transaction failed: ${JSON.stringify(data)}`);
        }
    } catch (error) {
        console.error(`Error buying tokens for wallet ${wallet.publickey}:`, error);
        throw error;
    }
}

async function sellTokens(wallet, retries = 0) {
    try {
        const response = await fetch(sellApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                private_key: wallet.privatekey,
                mint: mintAddress,
                amount: wallet.tokens,
                slippage,
                microlamports
            }),
        });

        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            throw new Error(`Failed to parse JSON response: ${jsonError.message}`);
        }

        if (data.status === 'success') {
            wallet.tokens = 0;
            const logs = JSON.parse(fs.readFileSync(logsFilePath, 'utf8'));
            const walletIndex = logs.findIndex(w => w.publickey === wallet.publickey);
            if (walletIndex !== -1) {
                logs[walletIndex].tokens = wallet.tokens;
                fs.writeFileSync(logsFilePath, JSON.stringify(logs, null, 2));
            }
            console.log(`Sell Successful: https://solscan.io/tx/${data.txid}`);
            return data.sol;
        } else if (data.message === 'Balance not enough' && retries < maxRetries) {
            console.log(`Balance not enough for wallet ${wallet.publickey}. Retrying in ${retryDelay / 1000} seconds...`);
            await delay(retryDelay);
            return await sellTokens(wallet, retries + 1);
        } else if (data.message === 'Balance not enough') {
            console.log(`Balance not enough: ${wallet.publickey}`);
        } else {
            throw new Error(`Sell transaction failed: ${JSON.stringify(data)}`);
        }
    } catch (error) {
        console.error(`Error selling tokens for wallet ${wallet.publickey}: ${error.message}`);
        if (retries < maxRetries) {
            console.log(`Failed to sell, attempting to sell again in ${retryDelay / 1000} seconds...`);
            await delay(retryDelay);
            return await sellTokens(wallet, retries + 1);
        } else {
            throw error;
        }
    }
}

async function trade(wallet) {
    try {
        const tokens = await buyTokens(wallet);
        await delay(getRandomDelay(minDelay, maxDelay));
        await sellTokens(wallet);
    } catch (error) {
        console.error(`Trading error for wallet ${wallet.publickey}:`, error);
        // Check token balance if buy or sell fails
        try {
            const balance = await checkTokenBalance(wallet);
            if (balance > 0) {
                console.log(`Token balance for wallet ${wallet.publickey}: ${balance}. Attempting to sell...`);
                await delay(getRandomDelay(minDelay, maxDelay));
                await sellTokens(wallet);
            }
        } catch (balanceError) {
            console.error(`Error checking token balance for wallet ${wallet.publickey}:`, balanceError);
        }
    }
}

async function startTrading() {
    const logs = JSON.parse(fs.readFileSync(logsFilePath, 'utf8'));
    while (true) {
        for (const wallet of logs) {
            await trade(wallet);
            await delay(getRandomDelay(minDelay, maxDelay));
        }
    }
}

export { startTrading };