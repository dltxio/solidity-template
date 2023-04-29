import { ethers } from "hardhat";
import { expect } from "chai";
import { isAddress } from "ethers/lib/utils";
import { NFTa, NFTa__factory } from "../build/typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signers";

let token: NFTa;
let deployer: SignerWithAddress;
let user: SignerWithAddress;

describe("ERC721a", () => {
  before(async () => {
    [deployer, user] = await ethers.getSigners();
    token = await new NFTa__factory(deployer).deploy("ERC721a", "NFTa");
    // Send ETH to user from signer.
    await deployer.sendTransaction({
      to: user.address,
      value: ethers.utils.parseEther("1000")
    });
  });

  it("Should deploy", async () => {
    // Check contract has deployed
    const address = token.address;
    const verifyAddress = isAddress(address);
    expect(verifyAddress).to.be.true;
  });

  it("Should mint tokens", async () => {
    await token.safeMint(user.address, 5);
    const balance = await token.balanceOf(user.address);
    expect(balance).to.equal(5);

    // Check token exists
    const tokenExists = await token.exists(1);
    expect(tokenExists).to.be.true;

    //Check total minted
    const total = await token.totalMinted();
    expect(total === ethers.utils.parseEther("5"));
  });

  it("Should return the owner of an indexed token", async () => {
    const tokenOwner = await token.getOwnershipAt(4);
    expect(tokenOwner.toString() === user.address);
  });
});
