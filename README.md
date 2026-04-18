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