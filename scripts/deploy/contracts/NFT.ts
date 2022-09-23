import { Signer } from "ethers";
import { NFT } from "../../../build/typechain";
import {deployContract, getDeployment} from "../utils";
import {DeploymentFunction, SetAddresses} from "./index";

const constructorArguments = [
  process.env.CONSTRUCTOR_NFT_NAME,
  process.env.CONSTRUCTOR_NFT_SYMBOL,
  process.env.CONSTRUCTOR_NFT_MAX,
  process.env.CONSTRUCTOR_NFT_FIXED_OWNER_ADDRESS,
  process.env.CONSTRUCTOR_NFT_BASE_URI
];

export const deployments = () => [{
  name: "nft",
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
    "NFT",
    deployment.constructorArguments,
    deployer
  ) as NFT;
  console.log(`deployed ${deploymentName} to ${contract.address}`);
  setAddresses({ [deploymentName]: contract.address });
  return contract;
};
