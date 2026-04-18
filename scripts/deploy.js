const hre = require("hardhat");

async function main() {
  const CampusToken = await hre.ethers.getContractFactory("CampusToken");
  const token = await CampusToken.deploy();

  await token.waitForDeployment();

  console.log(`CampusToken deployed to: ${token.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});