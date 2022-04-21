import { deployNFTa } from "../utils";
import { NFTa } from "../../../build/typechain";

export const contractNames = () => ["nft"];

export type NftAConstructorArguments = [string, string];

export const constructorArguments: () => NftAConstructorArguments = () => [
  process.env.CONSTRUCTOR_NFT_A_NAME,
  process.env.CONSTRUCTOR_NFT_A_SYMBOL
];

export const deploy = async (deployer, setAddresses) => {
  console.log("deploying NFTa");
  const token: NFTa = await deployNFTa(constructorArguments(), deployer, 1);
  console.log(`deployed NFTa to address ${token.address}`);
  setAddresses({ token: token.address });
  return token;
};
