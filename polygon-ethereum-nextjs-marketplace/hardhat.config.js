require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
const fs = require('fs');
const privateKey = fs.readFileSync(".secret").toString().trim() || "5c3cde2b170e0211b2c6fee3a14dbe275d073259b79622e9e307023025be5e97";
// const infuraId = fs.readFileSync(".infuraid").toString().trim() || "";

module.exports = {
    defaultNetwork: "rinkeby",
    networks: {
        // hardhat: {
        //     chainId: 1337
        // },
        rinkeby: {
            chainId: 4,
            // npx hardhat run scripts/deploy.js --network rinkeby  
            url: "https://rinkeby.infura.io/v3/ca28dbffc5d14deca2170b6287d8a792", //Infura url with projectId
            accounts: [privateKey] // add the account that will deploy the contract (private key)
        },
        /*
        mumbai: {
          // Infura
          // url: `https://polygon-mumbai.infura.io/v3/${infuraId}`
          url: "https://rpc-mumbai.matic.today",
          accounts: [privateKey]
        },
        matic: {
          // Infura
          // url: `https://polygon-mainnet.infura.io/v3/${infuraId}`,
          url: "https://rpc-mainnet.maticvigil.com",
          accounts: [privateKey]
        }
        */
    },
    etherscan: {
        // Your API key for Etherscan
        // Obtain one at https://etherscan.io/
        //npx hardhat verify --network rinkeby 0x1aB03b45F411161764Eb32e861c052cF2918C90C "Constructor argument 1"
        //npx hardhat verify --network rinkeby 0xD70c756f6c88a099C2cD5b53C4e6fBA1F246C9E6 "0x1aB03b45F411161764Eb32e861c052cF2918C90C"
        apiKey: "MZFS91C7R2KUBTJURK69ZSFPC491Z6CVK7"
    },
    solidity: {
        version: "0.8.4",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    }
};

