# 🎓 Campus Coins: Decentralized Student Reward System

## 📌 Project Overview
Student participation in campus events, volunteering programs, and clubs often goes untracked or is rewarded inconsistently. Traditional manual tracking is prone to errors, favoritism, and lost data. 

**Campus Coins** solves this by introducing a decentralized, blockchain-powered token system. Using Ethereum smart contracts, this dApp creates a permanent, tamper-proof ledger that transparently logs every earned point, transfer, and redemption, ensuring complete fairness and accountability.

## ✨ Key Features
* **Role-Based Permissions (Proof of Authority concept):** Only the University Admin can authorize Club Organizers. Only Organizers can mint and distribute Campus Coins (CC) to students.
* **Tamper-Proof Ledger:** Every reward issued and perk redeemed is permanently recorded on the blockchain, preventing duplicate rewards or fraudulent transfers.
* **Smart Contract Validation:** The contract automatically verifies student balances before allowing them to redeem perks (like merchandise, event passes, or free coffee).
* **Web3 Integration:** Fully functional frontend that connects directly to user wallets via MetaMask.

## 🛠️ Tech Stack
* **Smart Contracts:** Solidity
* **Local Blockchain & Testing:** Hardhat
* **Frontend GUI:** HTML, CSS, Vanilla JavaScript
* **Web3 Library:** ethers.js
* **Wallet:** MetaMask

## 🚀 How It Works
1. **Organizers** log in via MetaMask and issue Campus Coins to a student's wallet address, attaching a "reason" (e.g., Beach Cleanup Volunteer) to the transaction.
2. **Students** connect their wallets to view their verified on-chain balance.
3. **Redemption:** Students interact with the smart contract to burn a specific amount of coins in exchange for campus perks.

## ⚙️ Project Setup & Installation

### Prerequisites
Before you begin, ensure you have the following installed:
* [Node.js](https://nodejs.org/) (v14 or higher)
* [MetaMask](https://metamask.io/) browser extension
* Python 3 (for running the local web server)

### 1. Clone the Repository
```bash
git clone [https://github.com/Jeevzz-10/Campus-Coins.git](https://github.com/Jeevzz-10/Campus-Coins.git)
cd Campus-Coins
```
### 2. Install Dependencies
Install Hardhat and the required Node packages:
```bash
npm install
```
### 3. Start the Local Blockchain
Run the Hardhat local node. This will generate 20 test accounts loaded with fake ETH for testing.
```bash
npx hardhat node
```
(Leave this terminal window open)
### 4. Configure MetaMask
Open MetaMask and add a custom network:
* Network Name: Hardhat Local
* RPC URL: http://127.0.0.1:8545
* Chain ID: 31337
* Currency Symbol: ETH
Import at least two accounts (one for the Admin, one for a Student) by copying the Private Keys from the Hardhat terminal into MetaMask.
### 5. Deploy the Smart Contract
Open a second terminal in the project folder and deploy the contract to your local blockchain:
```bash
npx hardhat run scripts/deploy.js --network localhost
```
Note: Copy the deployed contract address from the terminal output, open index.html, and paste it into the contractAddress variable inside the <script> tag.

### 6. Run the Frontend Application
In your second terminal, start a local Python web server:
```bash
python3 -m http.server 8000
```
Open your web browser and navigate to http://localhost:8000. Connect your MetaMask wallet, and you are ready to start issuing and redeeming Campus Coins!
