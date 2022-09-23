import hardhat from "hardhat";
import { updateContractConfig } from "../utils";
// @ts-ignore
import savedConfig from "../../contracts.json";
import { getSignerForDeployer, getSignerIndex } from "./utils";
import DeploymentModules from "./contracts";
// @ts-ignore
const ethers = hardhat.ethers;

let addresses;
let network;

const setAddresses = (deltaConfig) => {
  addresses = { ...addresses, ...deltaConfig };
  updateContractConfig(network, addresses);
};

export const deploy = async () => {
  network = process.env.HARDHAT_NETWORK?.toLowerCase();
  addresses = savedConfig[network];
  console.log(`network is ${network}`);
  const isUpgrading = process.argv.includes("upgrade-contracts");
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
  // Execute deployment routines.
  for (let module of DeploymentModules) {
    for (let arg of process.argv) {
      const deploymentNames = module.deployments().map((d) => d.name);
      if (!deploymentNames.includes(arg)) continue;
      // Upgrade or deploy.
      if (!isUpgrading) {
        await module.deploy(arg, deployer, setAddresses, addresses);
      } else if (module.upgrade != null) {
        await module.upgrade(arg, deployer, addresses);
      }
    }
  }
  const delta = balance.sub(await deployer.getBalance());
  console.log(
    `deployment used a total of ${ethers.utils.formatEther(delta)} ETH`
  );
  return addresses;
};
