const hre = require("hardhat");
const { getImplementationAddress } = require("@openzeppelin/upgrades-core");
// npx hardhat run scripts/verify.js --network rinkeby
async function main() {

    // await hre.run("verify:verify", { address: '0x0B58F6B6Ad4083F5D0552DB4924fe1d15fE1A6d0' });
    // await hre.run("verify:verify", { address: '0x93C0fF85C5036D761bdD9B72585B6B0688ca48f8' });


    await hre.run("verify:verify", { address: '0x84c90C95978453FFd9EC9699D1d7F04Fb83128e4' });
    // await hre.run("verify:verify", { address: '0x93C0fF85C5036D761bdD9B72585B6B0688ca48f8' });

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });