const hre = require("hardhat");
const fs = require('fs');
const { ethers, upgrades } = require("hardhat");

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

//  npx hardhat run scripts/deploy_erc20.js --network rinkeby
// npx hardhat verify --network rinkeby 0x383304C7ef78090612Df95EDb8fb242409D9341b "NFT Token" "GCoin1"
async function main() {

    const GCoin = await ethers.getContractFactory("GCoin");
    const gCoin = await GCoin.deploy();
    await gCoin.deployed();
    console.log("token deployed to:", gCoin.address);



    let config = `
  export const gCoin = "${gCoin.address}"
  `

    let data = JSON.stringify(config)
    fs.writeFileSync('config_erc20' + gCoin.address + ".js", JSON.parse(data))

}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
