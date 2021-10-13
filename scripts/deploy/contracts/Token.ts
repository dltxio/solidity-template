import { deployContract } from "../utils";

export const contractNames = () => ["token"];

export const constructorArguments = () => [
  process.env.CONSTRUCTOR_TOKEN_NAME,
  process.env.CONSTRUCTOR_TOKEN_SYMBOL,
  process.env.CONSTRUCTOR_TOKEN_DECIMALS
];

export const deploy = async (deployer, setAddresses) => {
  console.log("deploying Token");
  const token = await deployContract(
    "Token",
    constructorArguments(),
    deployer,
    1
  );
  console.log(`deployed Token to address ${token.address}`);
  setAddresses({ token: token.address });
  return token;
};
