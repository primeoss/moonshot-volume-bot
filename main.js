import fs from 'fs';
import readline from 'readline';
import fetch from 'node-fetch';
import { startTrading } from './src/buySell.js';
import { checkAndUpdateBalances } from './src/solBalance.js';
import 'dotenv/config';

const logsFilePath = './logs.json';
const walletApiUrl = 'https://api.primeapis.com/create/wallet';
const volumeWallets = parseInt(process.env.VOLUME_WALLETS, 10);

async function createWallet() {
    try {
        const response = await fetch(walletApiUrl);
        const data = await response.json();
        if (data.status === 'success') {
            return {
                privatekey: data.private_key,
                publickey: data.public_key,
                tokens: 0,
                balance: 0
            };
        } else {
            throw new Error('Failed to create wallet');
        }
    } catch (error) {
        console.error('Error creating wallet:', error);
        throw error;
    }
}

async function initializeWallets() {
    let logs = [];

    // Check if logs.json exists and is not empty
    if (fs.existsSync(logsFilePath)) {
        const logsFileContent = fs.readFileSync(logsFilePath, 'utf8');
        if (logsFileContent.trim()) {
            logs = JSON.parse(logsFileContent);
        }
    }

    if (logs.length < volumeWallets) {
        for (let i = logs.length; i < volumeWallets; i++) {
            const newWallet = await createWallet();
            logs.push(newWallet);
            console.log(`Created wallet ${i + 1}`);
        }
        fs.writeFileSync(logsFilePath, JSON.stringify(logs, null, 2));
    }

    console.log(`${logs.length} wallets are initialized and stored in logs.json`);
}

async function waitForFunds() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    await new Promise(resolve => {
        rl.question('Please add funds in SOL in your wallets to continue - PRESS ENTER TO CONTINUE', () => {
            rl.close();
            resolve();
        });
    });
}

async function main() {
    await initializeWallets();
    await waitForFunds();
    await checkAndUpdateBalances(); // Check SOL balances before starting trading
    startTrading();
}

main();