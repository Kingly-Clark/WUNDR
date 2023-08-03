import { ethers } from "hardhat";
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const Wunder = await ethers.getContractFactory("Wunder");
  const wunder = await Wunder.deploy();
  await wunder.deployed();
  console.log("Wunder deployed to:", wunder.address);
  await sleep(2000);

  const minter = "0x7D78710570D65b17D860Dd6AC51ECa426cc8Ee9B";
  console.log(`Granting MINTER_ROLE to ${minter}`);
  await wunder.grantRole(await wunder.MINTER_ROLE(), minter);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exitCode = 0)
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
