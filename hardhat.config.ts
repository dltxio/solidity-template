import { config as dotenvConfig } from "dotenv";
dotenvConfig();
import "@nomiclabs/hardhat-ethers";
import "@nomicfoundation/hardhat-toolbox";
import "@typechain/hardhat";
import { HardhatUserConfig } from "hardhat/config";
import "hardhat-deploy";

// @ts-ignore - Workaround for issue with Tenderly plugin failing to parse hardhat config https://github.com/Tenderly/tenderly-cli/issues/108
BigInt.prototype.toJSON = function () {
  return this.toString();
};

const defaultKey = "0000000000000000000000000000000000000000000000000000000000000001";

const hardHatConfig: HardhatUserConfig = {
  gasReporter: {
    enabled: true,
    currency: "USD"
  },
  paths: {
    sources: "./contracts",
    cache: "./cache",
    artifacts: "./artifacts",
    tests: "./tests",
    deploy: "./deploy",
    deployments: "./deployments",
    imports: "./imports"
  },
  networks: {
    hardhat: {
      chainId: 1337,
      saveDeployments: true,
      allowUnlimitedContractSize: true,
      tags: ["local", "testing"]
    },

    localhost: {
      url: "http://localhost:8545",
      saveDeployments: false,
      tags: ["local"]
    },

    arbitrum: {
      url: process.env.ARBITRUM_URL,
      chainId: 42161,
      accounts: [process.env.ARBITRUM_DEPLOYER || defaultKey],
      saveDeployments: true,
      verify: {
        etherscan: {
          apiKey: process.env.ARBISCAN_API_KEY
        }
      },
      tags: ["production"]
    },

    // Staging / Development
    sepolia: {
      url: process.env.SEPOLIA_URL,
      accounts: [process.env.ARBITRUM_DEPLOYER || defaultKey],
      saveDeployments: true,
      verify: {
        etherscan: {
          // Warning: Do not set the environment var ETHERSCAN_API_KEY as it will override the API key for all other networks
          apiKey: process.env.DEFAULT_ETHERSCAN_API_KEY
        }
      },
      tags: ["uat"]
    }
  },
  solidity: {
    compilers: [
      {
        version: "0.8.17",
        settings: {
          optimizer: {
            enabled: true,
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
  },
  namedAccounts: {
    deployer: {
      default: 0,
      arbitrum: `privatekey://${process.env.ARBITRUM_DEPLOYER}`
    }
  }
};

export default hardHatConfig;
