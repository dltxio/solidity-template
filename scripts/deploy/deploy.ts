import hardhat from "hardhat";
import { ethers as tsEthers } from "ethers";
import { updateContractConfig } from "../utils";
import * as Token from "./contracts/Token";
// @ts-ignore
const ethers = hardhat.ethers;

let config;
let network;

interface DeploymentModule {
  constructorArguments: (addresses?: any) => any[],
  deploy: (setAddresses: Function, addresses?: any) => Promise<tsEthers.Contract>,
  upgrade?: (addresses?: any) => void,
  args: string[],
}

const setAddresses = (deltaConfig) => {
  config = { ...config, ...deltaConfig };
  updateContractConfig(network, config);
};

export const deploy = async () => {
  network = process.env.HARDHAT_NETWORK?.toLowerCase();
  console.log(`network is ${network}`);
  const isUpgrading = process.argv.includes('upgrade-contracts');
  const [deployer] = await ethers.getSigners();
  console.log(`deployer is ${await deployer.getAddress()}`);
  const gasPrice = await deployer.provider.getGasPrice();
  console.log(
    `gas price is `,
    `${ethers.utils.formatUnits(gasPrice, "gwei")} gwei`
  );
  const balance = await deployer.getBalance();
  console.log(`balance is ${ethers.utils.formatEther(balance)} ETH`);
  // Define deployment routines.
  const modules: DeploymentModule[] = [Token];
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
      await routine.deploy(setAddresses, config);
    } else if (routine.upgrade != null) {
      await routine.upgrade(config);
    }
  }
  const delta = balance.sub(await deployer.getBalance());
  console.log(`deployment used a total of ${ethers.utils.formatEther(delta)} ETH`);
  return config;
};
