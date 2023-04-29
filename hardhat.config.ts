import { config as dotenvConfig } from "dotenv";
dotenvConfig();
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "@openzeppelin/hardhat-upgrades";
import "@nomiclabs/hardhat-etherscan";
import "hardhat-contract-sizer";
import "./scripts/tasks";
import "solidity-coverage";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "hardhat-gas-reporter";

const defaultKey =
  "0000000000000000000000000000000000000000000000000000000000000001";
const defaultRpcUrl = "https://localhost:8545";

export default {
  gasReporter: {
    enabled: true,
    currency: "ETH",
    gasPrice: "auto",
    showInChart: true
  },
  paths: {
    sources: "./contracts",
    cache: "./cache",
    artifacts: "./artifacts",
    tests: "./tests"
  },
  networks: {
    hardhat: {
      chainId: 1337,
      allowUnlimitedContractSize: false,
      accounts: {
        mnemonic:
          process.env.SEPOLIA_SEED ||
          "test test test test test test test test test test test junk",
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 20,
        passphrase: ""
      }
    },
    sepolia: {
      url: process.env.SEPOLIA_URL || defaultRpcUrl,
      accounts: {
        mnemonic:
          process.env.SEPOLIA_SEED ||
          "test test test test test test test test test test test junk",
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 20,
        passphrase: ""
      }
    },
    mainnet: {
      url: process.env.MAINNET_URL || defaultRpcUrl,
      accounts: [process.env.PRIVATE_KEY || defaultKey]
    }
  },
  etherscan: {
    // Obtain etherscan API key at https://etherscan.io/
    apiKey: process.env.ETHERSCAN_KEY
  },
  solidity: {
    compilers: [
      {
        version: "0.8.4",
        settings: {
          optimizer: {
            enabled: false,
            runs: 200
          }
        }
      }
    ]
  },
  typechain: {
    outDir: "build/typechain",
    target: "ethers-v5",
    alwaysGenerateOverloads: false,
    externalArtifacts: ["externalArtifacts/*.json"]
  }
};
