# Moonshot Volume Bot

Increase your token's volume on Moonshot with our automated bot that uses multiple wallets, random buys, and random delays to continuously place buy and sell orders. 

## Features

- Custom Fee Option
- Custom Slippage Option
- Set Custom Min & Max Buy Limits
- Set Custom Min & Max Delay Limits
- Use Any Number of Wallets

## Prerequisites

This bot is built using Node.js. Ensure you have the latest version of Node.js installed on your Windows or Linux system before using it.

## Configuration

### .env File Setup

Before starting the bot, configure the `.env` file with the required details:

- **MINT:** Enter your token's correct mint address.
- **MICROLAMPORTS:** Fee for each transaction. Default: `400000` (0.000165 SOL).
- **SLIPPAGE:** Custom slippage for each transaction. Default: `1000` (10%).
- **MIN_BUY, MAX_BUY:** Minimum and maximum limits for each transaction.
- **MIN_DELAY, MAX_DELAY:** Minimum and maximum delay in milliseconds for each transaction.
- **VOLUME_WALLETS:** Number of wallets to use (e.g., 5, 10, 100).

### Additional Suggestions

- Set `microlamports` correctly. If transactions are failing, increase your `microlamports` and adjust your slippage.

## Installation Guide

1. Download and extract the bot on your Windows or Linux system.
2. Open the terminal in the bot's folder or open the folder in Visual Studio, then open the terminal.
3. Run the following command to install dependencies:
   ```sh
   npm install
   ```
4. To start the bot, use one of the following commands:
   ```sh
   npm start
   ```
   Or
   ```sh
   node main.js
   ```

5. The bot will create the required wallets and store them in `logs.json`. Ensure you copy each public key, add the necessary funds, and confirm the funds are above the min and max buy limits to run the bot without interruptions.

**Please add funds in SOL in your wallets to continue - PRESS ENTER TO CONTINUE**

## Restart Guide

When restarting the bot, it uses the same wallets stored in `logs.json`. If you want to use new wallets, delete everything from `logs.json` and start again.

## Important

We use PRIMEAPIS for processing transactions, and a system fee of 0.0005 SOL is added to each transaction. Store your private keys safely and only keep the necessary funds.

## Suggestions and Improvements

If you have suggestions for new features or encounter errors, please contact us:

- **Telegram:** [primeoss](https://t.me/primeoss)
- **Email:** [prime@oss.one](mailto:prime@oss.one)

Thank you for using the Moonshot Volume Bot.

Have fun!
