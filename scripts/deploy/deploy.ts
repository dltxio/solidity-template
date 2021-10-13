import hardhat from "hardhat";
import { ethers as tsEthers } from "ethers";
import { updateContractConfig } from "../utils";
import * as Token from "./contracts/Token";
// @ts-ignore
import savedConfig from "../../contracts.json";
import * as TokenUpgradeable from "./contracts/TokenUpgradeable";
import {getSignerForDeployer, getSignerIndex} from "./utils";
// @ts-ignore
const ethers = hardhat.ethers;

let addresses;
let network;

interface DeploymentModule {
  constructorArguments: (addresses?: any) => any[],
  deploy: (
    deployer: tsEthers.Signer,
    setAddresses: Function,
    addresses?: any
  ) => Promise<tsEthers.Contract>,
  upgrade?: (deployer: tsEthers.Signer, addresses?: any) => void,
  args: string[],
}

const setAddresses = (deltaConfig) => {
  addresses = { ...addresses, ...deltaConfig };
  updateContractConfig(network, addresses);
};

export const deploy = async () => {
  network = process.env.HARDHAT_NETWORK?.toLowerCase();
  addresses = savedConfig[network];
  console.log(`network is ${network}`);
  const isUpgrading = process.argv.includes('upgrade-contracts');
  const deployer = await getSignerForDeployer();
  console.log("using deployer index ", getSignerIndex());
  console.log(`deployer is ${await deployer.getAddress()}`);
  const gasPrice = await deployer.provider.getGasPrice();
  console.log(
    `gas price is `,
    `${ethers.utils.formatUnits(gasPrice, "gwei")} gwei`
  );
  const balance = await deployer.getBalance();
  console.log(`balance is ${ethers.utils.formatEther(balance)} ETH`);
  // Define deployment routines.
  const modules: DeploymentModule[] = [
    Token,
    TokenUpgradeable
  ];
  // Execute deployment routines.
  for (let routine of modules) {
    let foundArg = false;
    for (let arg of routine.args) {
      if (!process.argv.includes(arg)) continue;
      foundArg = true;
    }
    // Abort if argument not passed to script.
    if (!foundArg) continue;
    // Upgrade or deploy.
    if (!isUpgrading) {
      await routine.deploy(deployer, setAddresses, addresses);
    } else if (routine.upgrade != null) {
      await routine.upgrade(deployer, addresses);
    }
  }
  const delta = balance.sub(await deployer.getBalance());
  console.log(`deployment used a total of ${ethers.utils.formatEther(delta)} ETH`);
  return addresses;
};
