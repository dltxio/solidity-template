import { task } from "hardhat/config";
import contracts from "../../contracts.json";

task("read-balance")
  .addParam("address")
  .setAction(async (args, hre) => {
    const contractAddress = contracts[hre.network.name].token;
    console.log(`network is ${hre.network.name}`);
    console.log(`token address is ${contractAddress}`);
    const token = (await hre.ethers.getContractFactory("Token")).attach(
      contractAddress
    );
    const balance = await token.balanceOf(args.address);
    console.log(
      `balance is ${balance.toString()} wei for address ${args.address}`
    );
  });

task("mint")
  .addParam("address")
  .addParam("amount")
  .setAction(async (args, hre) => {
    const [deployer] = await hre.ethers.getSigners();
    const contractAddress = contracts[hre.network.name].token;
    console.log(`network is ${hre.network.name}`);
    console.log(`token address is ${contractAddress}`);
    const token = (await hre.ethers.getContractFactory("Token")).attach(
      contractAddress
    );
    const decimals = await token.decimals();
    const ten = hre.ethers.BigNumber.from("10");
    // Mint with the correct decimals.
    const mintAmount = ten.pow(decimals).mul(args.amount);
    const receipt = await token.mint(args.address, mintAmount);
    console.log("waiting for confirmation...");
    await receipt.wait(1);
    console.log(`minted ${args.amount} for address ${args.address}`);
  });
