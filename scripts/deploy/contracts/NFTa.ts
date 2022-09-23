import {NFTa} from "../../../build/typechain";
import {Signer} from "ethers";
import {deployContract, getDeployment} from "../utils";
import {DeploymentFunction, SetAddresses} from "./index";

const constructorArguments = [
  process.env.CONSTRUCTOR_NFT_A_NAME,
  process.env.CONSTRUCTOR_NFT_A_SYMBOL
];

export const deployments = () => [{
  name: "nftA",
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
    "NFTa",
    deployment.constructorArguments,
    deployer
  ) as NFTa;
  console.log(`deployed ${deploymentName} to ${contract.address}`);
  setAddresses({ [deploymentName]: contract.address });
  return contract;
};
