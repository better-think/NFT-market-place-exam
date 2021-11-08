const hre = require("hardhat");
const fs = require('fs');
const { ethers, upgrades } = require("hardhat");
const { getImplementationAddress } = require("@openzeppelin/upgrades-core");
// normal deploy
// async function main() {
//   const NFTMarket = await hre.ethers.getContractFactory("NFTMarket");
//   const nftMarket = await NFTMarket.deploy();
//   await nftMarket.deployed();
//   console.log("nftMarket deployed to:", nftMarket.address);

//   const NFT = await hre.ethers.getContractFactory("NFT");
//   const nft = await NFT.deploy(nftMarket.address);
//   await nft.deployed();
//   console.log("nft deployed to:", nft.address);

//   let config = `
//   export const nftmarketaddress = "${nftMarket.address}"
//   export const nftaddress = "${nft.address}"
//   `

//   let data = JSON.stringify(config)
//   fs.writeFileSync('config.js', JSON.parse(data))

// }

// upgradeable deploy
async function main() {
    const tokenAddress = "0xf740E266a17918c20cE2dd40eEfad2B2f8Dacb45";
    const NFTMarket = await ethers.getContractFactory("NFTMarket");
    const nftMarket = await upgrades.deployProxy(NFTMarket, [tokenAddress]);
    await nftMarket.deployed();
    console.log("nftMarket deployed to:", nftMarket.address);

    const nftMarketImplAddress = await getImplementationAddress(
        nftMarket.provider,
        nftMarket.address
    );
    await hre.run("verify:verify", { address: nftMarketImplAddress });
    console.log("nftMarket verify:", nftMarketImplAddress);

    const NFT = await hre.ethers.getContractFactory("NFT");
    const nft = await upgrades.deployProxy(NFT, [nftMarket.address]);
    await nft.deployed();
    console.log("nft deployed to:", nft.address);

    const nftImplAddress = await getImplementationAddress(
        nft.provider,
        nft.address
    );
    await hre.run("verify:verify", { address: nftImplAddress });
    console.log("nft verify:", nftImplAddress);

    let config = `
  export const nftmarketaddress = "${nftMarket.address}"
  export const nftaddress = "${nft.address}"
  `

    let data = JSON.stringify(config)
    fs.writeFileSync('config.js', JSON.parse(data))

}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
