import { config as dotenvConfig } from "dotenv";
dotenvConfig();
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "hardhat-contract-sizer";
import "./scripts/tasks"
import {ethers} from "ethers";

const defaultKey = "0000000000000000000000000000000000000000000000000000000000000001";
const defaultRpcUrl = "https://localhost:8545";

export default {
  paths: {
    sources: "./contracts",
    cache: "./cache",
    artifacts: "./build",
    tests: "./tests"
  },
  networks: {
    hardhat: {
      chainId: 1337,
      accounts: [{
        privateKey: process.env.PRIVATE_KEY,
        balance: ethers.utils.parseEther(
          process.env.LOCAL_ETHER_BALANCE?.toString() ?? "1"
        ).toString(),
      }],
      allowUnlimitedContractSize: false,
    },
    kovan: {
      url: process.env.KOVAN_URL || defaultRpcUrl,
      accounts: [process.env.PRIVATE_KEY || defaultKey],
    },
    mainnet: {
      url: process.env.MAINNET_URL || defaultRpcUrl,
      accounts: [process.env.PRIVATE_KEY || defaultKey],
    },
  },
  solidity: {
    compilers: [{
      version: "0.8.3",
      settings: {
        optimizer: {
          enabled: false,
          runs: 200,
        },
      },
    }],
  },
};
