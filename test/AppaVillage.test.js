const { expect } = require("chai");
const Appa = artifacts.require("AppaVillage");
const Web3 = require("web3");
const web3 = new Web3();
const _baseURI =
  "https://gateway.pinata.cloud/ipfs/QmPXDNxTfirDej1MUc6Nh91eDB2NZar8B5sXrUJDdGPRPU/";

const _owner1 = "0x98ac3c4a968D349F4Bd84507ac957ab0Bb602Acf";
const _owner2 = "0x307206BAAd2CD7C04c8ba377df66Ba06B2556f7e";

contract("AppaVillage NFTs", (accounts) => {
  let contract;
  let whitelist;
  let price;
  beforeEach(async () => {
    contract = await Appa.new(_baseURI);
    whitelist = [accounts[1].toString(), accounts[2].toString()];
    await contract.addWhitelist(whitelist);
    price = await contract.getPrice();
  });

  it("should have 7 tokens minted right after deployment", async () => {
    const total = await contract.totalSupply();
    expect(total.toString()).to.equal("7");
  });

  it("should mint to 2 owner addresses", async () => {
    const ownerOneBalance = await contract.balanceOf(_owner1);
    const ownerTwoBalance = await contract.balanceOf(_owner2);
    const total = await contract.totalSupply();
    expect(ownerOneBalance.toString()).to.equal("6");
    expect(ownerTwoBalance.toString()).to.equal("1");
    expect(total.toString()).to.equal("7");
  });

  it("should pause selling at initial state", async () => {
    const paused = await contract._paused();
    expect(paused).to.equal(true);
  });

  it("should pause public sale correctly", async () => {
    await contract.pause(false, 1);
    const paused = await contract._paused();
    const preSale = await contract._presalePaused();
    expect(paused).to.equal(false);
    expect(preSale).to.equal(true);
  });

  it("should pause pre sale correctly", async () => {
    await contract.pause(false, 2);
    const paused = await contract._paused();
    const preSale = await contract._presalePaused();
    expect(paused).to.equal(true);
    expect(preSale).to.equal(false);
  });

  it("should hide all tokens real image at initial state", async () => {
    const hide = await contract._hide();
    expect(hide).to.equal(true);
  });

  it("should mint correct Appa with getAppa function", async () => {
    await contract.pause(false, 1);
    await contract.getAppa(1, { from: accounts[0], value: price });
    const account0Balance = await contract.balanceOf(accounts[0]);
    expect(account0Balance.toString()).to.not.equal("0");
  });

  it("should getAppa mint start minting at tokenId : 7", async () => {
    await contract.pause(false, 1);
    await contract.getAppa(1, { from: accounts[0], value: price });
    const ownerOfTokenSeven = await contract.ownerOf(7);
    expect(ownerOfTokenSeven).to.equal(accounts[0]);
  });

  it("should be able to claimWhitelist", async () => {
    await contract.pause(false, 2);
    await contract.claimWhitelist(1, { from: accounts[2], value: price });
    const balance = await contract.balanceOf(accounts[2]);
    expect(balance.toString()).to.not.equal("0");
  });

  it("should only whitelisted be able to claimWhitelist", async () => {
    await contract.pause(false, 2);
    try {
      await contract.claimWhitelist(1, { from: accounts[3], value: price });
      expect(false);
    } catch (e) {
      expect(true);
    }
  });

  it("should withdraw ETH to owner", async () => {
    await contract.pause(false, 1);
    const amount = 5;
    const totalPrice = amount * price;
    await contract.getAppa(amount, { from: accounts[3], value: totalPrice });
    try {
      await contract.withdraw();
      expect(false);
    } catch (e) {
      expect(true);
    }
  });
});
