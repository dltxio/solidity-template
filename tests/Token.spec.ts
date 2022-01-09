import { ethers } from "hardhat";
import { ethers as tsEthers } from "ethers";
import { expect } from "chai";
import { getEventData } from "./utils";
import { Token, Token__factory } from "../build/typechain";

let token: Token;
let deployer: tsEthers.Signer;
let user: tsEthers.Wallet;

describe("ERC20 Token", () => {
  before(async () => {
    deployer = (await ethers.getSigners())[0];
    token = await new Token__factory(deployer).deploy("Token", "TKN", 18);
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
    user = new ethers.Wallet(
      "0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef",
      deployer.provider
    );
    // Send ETH to user from signer.
    await deployer.sendTransaction({
      to: user.address,
      value: ethers.utils.parseEther("1")
    });
    // List protected functions.
    let userToken = token.connect(user);
    const ownerFunctions = [
      () => userToken.mint(user.address, "1"),
      () => userToken.burn(user.address, "1")
    ];
    // Assert that all protected functions revert when called from an user.
    for (let ownerFunction of ownerFunctions) {
      let result;
      try {
        result = await ownerFunction();
      } catch (error) {
        expect(error.toString()).to.include("Ownable: caller is not the owner");
        continue;
      }
      throw new Error("Allowed user to call protected functions");
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
