import {
  deployContract,
  deployProxy,
  getDeployment,
  upgradeProxy
} from "../utils";
import {Token, TokenUpgradeable} from "../../../build/typechain";
import {DeploymentFunction, SetAddresses} from "./index";
import {Signer} from "ethers";

const constructorArguments = [
  process.env.CONSTRUCTOR_TOKEN_NAME,
  process.env.CONSTRUCTOR_TOKEN_SYMBOL,
  process.env.CONSTRUCTOR_TOKEN_DECIMALS
];

export const deployments = () => [{
  name: "token-upgradeable",
  constructorArguments
}];

export const deploy: DeploymentFunction = async (
  deploymentName: string,
  deployer: Signer,
  setAddresses: SetAddresses
) => {
  const deployment = getDeployment(deploymentName, deployments());
  console.log(`deploying ${deploymentName}`);
  const contract = await deployContract(
    "TokenUpgradeable",
    deployment.constructorArguments,
    deployer
  ) as Token;
  console.log(`deployed ${deploymentName} to ${contract.address}`);
  setAddresses({ [deploymentName]: contract.address });
  return contract;
};

export const upgrade = async (deployer, addresses) => {
  return await upgradeProxy(
    "TokenUpgradeable",
    addresses.tokenUpgradeable,
    deployer,
    1
  );
};
