import { ethers } from "hardhat";
import { ethers as tsEthers } from "ethers";
import { expect } from "chai";
import { isAddress } from "ethers/lib/utils";
import { NFT, NFT__factory } from "../build/typechain";

let token: NFT;
let deployer: tsEthers.Signer;
let user: tsEthers.Wallet;

describe("ERC721 Token", () => {
  before(async () => {
    deployer = (await ethers.getSigners())[0];
    token = await new NFT__factory(deployer).deploy("ERC721Token", "NFT", 100);
    user = new ethers.Wallet(
      "0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef",
      deployer.provider
    );
    // Send ETH to user from signer.
    await deployer.sendTransaction({
      to: user.address,
      value: ethers.utils.parseEther("1000")
    });
  });

  it("Should have sale not active when contract is deployed", async () => {
    //Check contract has deployed
    const address = token.address;
    const verifyAddress = isAddress(address);
    expect(verifyAddress === true);

    //Check sale active status
    expect((await token.isSaleActive()) === false);
  });

  it("Should return sale active status", async () => {
    await token.toggleSaleStatus();
    expect((await token.isSaleActive()) === true);
  });

  it("Should only allow owner to toggle if sale is active", async () => {
    await expect(token.connect(user).toggleSaleStatus()).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );
  });

  it("Should only mint NFTs if the sale is active", async () => {
    await token.toggleSaleStatus();
    await expect(token.mint(5, user.address)).to.be.revertedWith(
      "Sale is not active"
    );
  });

  it("Should only allow owner to mint a pass", async () => {
    await token.toggleSaleStatus();
    await expect(token.connect(user).mint(5, user.address)).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );
  });

  it("Should mint tokens", async () => {
    token.connect(deployer);
    await token.mint(5, user.address);
    const balance = await token.balanceOf(user.address);
    expect(balance).to.equal(5);
  });

  //Time out in for loop if trying to test other colors, but logic is same
  it("Should not mint more than max number of passes", async () => {
    //Already minted 5, max is 100, need to mint 95 more
    await token.mint(95, user.address);
    await expect(token.mint(1, user.address)).to.be.revertedWith(
      "Not enough tokens remaining to mint"
    );
  });

  it("Should only allow owner to call renounceOwnership and new owner always be the fixed address ", async () => {
    await expect(token.connect(user).renounceOwnership()).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );

    await token.renounceOwnership();
    const newOwner = await token.owner();
    expect(newOwner).to.equal("0x1156B992b1117a1824272e31797A2b88f8a7c729"); //this the fixed new owner address

    await expect(token.renounceOwnership()).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );
  });
});
