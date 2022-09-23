import { Signer, Contract } from "ethers";
import * as Token from "./Token";
import * as TokenUpgradeable from "./TokenUpgradeable";
import * as NFT from "./NFT";
import * as NFTa from "./NFTa";

/**
 *  A deployment is an input object consisting of the deployment name
 *  and constructor arguments.
 */
export type Deployment = {
  name: string;
  constructorArguments: string[];
};

export type DeploymentFunction = (
  name: string,
  deployer: Signer,
  setAddresses: Function,
  addresses?: any
) => Promise<Contract>;

export type UpgradeFunction = (
  name: string,
  deployer: Signer,
  addresses?: any
) => void;

export interface DeploymentModule {
  deploy: DeploymentFunction;
  deployments: () => Deployment[];
  upgrade?: UpgradeFunction;
}

const modules: DeploymentModule[] = [Token, TokenUpgradeable, NFT, NFTa];

export default modules;
