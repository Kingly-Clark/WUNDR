import { ethers } from "hardhat";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  const totalSupply  = ethers.utils.parseEther("1000000000");

  const Wunder = await ethers.getContractFactory("Wunder");
  const wunder = await Wunder.deploy();
  await wunder.deployed();

  console.log("Wunder deployed to:", wunder.address);

  console.log("Granting MINTER_ROLE to deployer");
  await wunder.grantRole(await wunder.MINTER_ROLE(), deployer.address);
  await sleep(2000);
  console.log("Minting total supply to deployer");
  await wunder.mint(deployer.address, totalSupply)
  await sleep(2000);

  console.log("Revoking MINTER_ROLE from deployer");
  await wunder.revokeRole(await wunder.MINTER_ROLE(), deployer.address);
  await sleep(2000);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
