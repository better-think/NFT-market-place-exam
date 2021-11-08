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
//  npx hardhat run scripts/upgrade.js --network rinkeby
async function main() {
    //0x0B58F6B6Ad4083F5D0552DB4924fe1d15fE1A6d0
    const NFTMarket_ADDRESS = '0xBFA60d87640EC994df6fdDDC69416828af64D75d';
    const NFTMarketV2 = await ethers.getContractFactory("NFTMarket");
    const nftMarket = await upgrades.upgradeProxy(NFTMarket_ADDRESS, NFTMarketV2, { fn: 'initialize', arg: ["0xf740E266a17918c20cE2dd40eEfad2B2f8Dacb45"] });
    console.log("nftMarket upgraded to:", nftMarket.address);

    // const nftMarketImplAddress = await getImplementationAddress(
    //     nftMarket.provider,
    //     nftMarket.address
    // );
    // await hre.run("verify:verify", { address: nftMarketImplAddress });
    // console.log("nftMarket verify:", nftMarketImplAddress);


    // const NFT_ADDRESS = '0x35f9ce708786352F93394dccE7d4299A0D9f59A4';
    // const NFT = await hre.ethers.getContractFactory("NFT");
    // const nft = await upgrades.upgradeProxy(NFT_ADDRESS, NFT);
    // console.log("nft upgraded to:", nft.address);

    // const nftImplAddress = await getImplementationAddress(
    //     nft.provider,
    //     nft.address
    // );
    // await hre.run("verify:verify", { address: nftImplAddress });
    // console.log("nft verify:", nftImplAddress);
    //     let config = `
    //   export const nftmarketaddress = "${nftMarket.address}"
    //   export const nftaddress = "${nft.address}"
    //   `
    // let data = JSON.stringify(config)
    // fs.writeFileSync('config.js', JSON.parse(data))

}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });

    // npx hardhat verify--network rinkeby 0x52047146f396671D76fbFD8b9B911727Dd5548F5
    //npx hardhat verify --network rinkeby 0xdD52159912DdbE90FDEEA0974735f1B9eBb333B3