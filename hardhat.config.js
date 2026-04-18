require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  networks: {
    // ── Ganache GUI (default port 7545) ──────────────────────────
    // HOW TO SET YOUR KEY:
    //   Option A (recommended): set env variable before running
    //     export GANACHE_KEY=0xYourPrivateKeyHere
    //     npx hardhat run scripts/deploy.js --network ganache
    //
    //   Option B: replace process.env.GANACHE_KEY with your key directly
    //     accounts: ["0xYourActualPrivateKey"]
    ganache: {
      url: "http://127.0.0.1:7545",
      chainId: 1337,
      accounts: process.env.GANACHE_KEY ? [process.env.GANACHE_KEY] : [],
    },

    // ── Ganache CLI (port 8545) ──────────────────────────────────
    ganache_cli: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
      accounts: process.env.GANACHE_KEY ? [process.env.GANACHE_KEY] : [],
    },

    // ── Hardhat built-in node (for pure testing without Ganache) ──
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
  },

  gasReporter: {
    enabled: true,
    currency: "USD",
  },

  // Paths (defaults shown for clarity)
  paths: {
    sources:   "./contracts",
    tests:     "./test",
    cache:     "./cache",
    artifacts: "./artifacts",
  },
};