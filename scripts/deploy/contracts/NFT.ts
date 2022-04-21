import { deployNFT } from "../utils";
import { NFT } from "../../../build/typechain";
import { BigNumberish } from "ethers";

export const contractNames = () => ["nft"];

export type NftConstructorArguments = [
  string,
  string,
  BigNumberish,
  string,
  string
];

export const constructorArguments: () => NftConstructorArguments = () => [
  process.env.CONSTRUCTOR_NFT_NAME,
  process.env.CONSTRUCTOR_NFT_SYMBOL,
  process.env.CONSTRUCTOR_NFT_MAX,
  process.env.CONSTRUCTOR_FIXED_OWNER_ADDRESS,
  process.env.CONSTRUCTOR_BASE_URI
];

export const deploy = async (deployer, setAddresses) => {
  console.log("deploying NFT");
  const token: NFT = await deployNFT(constructorArguments(), deployer, 1);
  console.log(`deployed NFT to address ${token.address}`);
  setAddresses({ token: token.address });
  return token;
};
