import { deployProxy, upgradeProxy } from "../utils";

export const contractNames = () => ["token-upgradeable"];

export const constructorArguments = () => [
  process.env.CONSTRUCTOR_TOKEN_NAME,
  process.env.CONSTRUCTOR_TOKEN_SYMBOL,
  process.env.CONSTRUCTOR_TOKEN_DECIMALS
];

export const deploy = async (deployer, setAddresses) => {
  console.log("deploying TokenTokenUpgradeable");
  const tokenUpgradeable = await deployProxy(
    "TokenUpgradeable",
    constructorArguments(),
    deployer,
    1
  );
  console.log(
    `deployed TokenUpgradeable to address ${tokenUpgradeable.address}`
  );
  setAddresses({ tokenUpgradeable: tokenUpgradeable.address });
  return tokenUpgradeable;
};

export const upgrade = async (deployer, addresses) => {
  return await upgradeProxy(
    "TokenUpgradeable",
    addresses.tokenUpgradeable,
    deployer,
    1
  );
};
