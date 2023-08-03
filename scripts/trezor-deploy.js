const Wunder = artifacts.require("Wunder");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const minterWallet = "0x7D78710570D65b17D860Dd6AC51ECa426cc8Ee9B";

async function main() {
  console.log("Deploying Wunder");
  // let wunder = await WunderWunder.at("");
  let wunder = await Wunder.new();
  console.log(`Wunder address: ${wunder.address}`);
  await sleep(3000);

  console.log(`Granting MINTER_ROLE to ${minterWallet}`);
  const MINTER_ROLE = await wunder.MINTER_ROLE();
  await wunder.grantRole(MINTER_ROLE, minterWallet);
  console.log(`Minter role granted to ${minterWallet}`);
  await sleep(3000);
}

module.exports = async (callback) => {
  try {
    await main();
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }

  callback();
};
