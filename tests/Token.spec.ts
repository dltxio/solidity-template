import { ethers } from "hardhat";
import { Signer, ethers as tsEthers } from "ethers";
import { expect, use } from "chai";
import { getEventData } from "./utils";
import { Token, Token__factory } from "../build/typechain";

import { solidity } from "ethereum-waffle";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signers";
use(solidity);

let token: Token;
let deployer: Signer;
let user: SignerWithAddress;

describe("ERC20 Token", () => {
  before(async () => {
    [deployer, user] = await ethers.getSigners();
    token = await new Token__factory(deployer).deploy("Token", "TKN", 18);

    // Send ETH to user from signer.
    await deployer.sendTransaction({
      to: user.address,
      value: ethers.utils.parseEther("1000")
    });
  });

  it("Should return the correct decimal count", async () => {
    expect(await token.decimals()).to.equal(18);
  });

  it("Should mint tokens to deployer", async () => {
    const amount = ethers.BigNumber.from("10");
    const address = await deployer.getAddress();
    await token.mint(address, amount);
    const balance = await token.balanceOf(address);
    expect(balance).to.equal(amount);
  });

  it("Should burn tokens from deployer", async () => {
    const amount = ethers.BigNumber.from("10");
    const address = await deployer.getAddress();
    await token.burn(address, amount);
    const balance = await token.balanceOf(address);
    expect(balance).to.equal(0);
  });

  it("Should only allow deployer to mint/burn", async () => {
    // List protected functions.
    const userToken = token.connect(user);
    const ownerFunctions = [
      () => userToken.mint(user.address, "1"),
      () => userToken.burn(user.address, "1")
    ];
    // Assert that all protected functions revert when called from an user.
    for (const ownerFunction of ownerFunctions) {
      try {
        await expect(ownerFunction()).to.be.revertedWith(
          "Ownable: caller is not the owner"
        );
      } catch (error) {
        // the solidity-coverage plugin is not smart enough to run the
        // "revertedWith" unit test, so we account for that here.
        if (!`${error}`.includes("sender doesn't have enough funds to send tx"))
          throw error;
      }
    }
  });

  it("Should emit a transfer event", async () => {
    const deployerAddress = await deployer.getAddress();
    // Mint & transfer 1 wei.
    await token.mint(deployerAddress, "1");
    const receipt = await (await token.transfer(user.address, "1")).wait(1);
    const event = getEventData("Transfer", token, receipt);
    expect(event.from).to.equal(deployerAddress);
    expect(event.to).to.equal(user.address);
    expect(event.value).to.equal("1");
  });
});
