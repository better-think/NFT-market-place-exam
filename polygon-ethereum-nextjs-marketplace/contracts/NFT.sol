// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/Counters.sol";
// import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
// import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";

import "hardhat/console.sol";

contract NFT is ERC721URIStorageUpgradeable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address contractAddress;

    // constructor(address marketplaceAddress) ERC721("Metaverse", "METT") {
    //     contractAddress = marketplaceAddress;
    // }

    function initialize(address marketplaceAddress) public initializer {
        __ERC721_init("Metaverse", "METT");
        contractAddress = marketplaceAddress;
    }

    function createToken(string memory tokenURI) public returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);
        setApprovalForAll(contractAddress, true);
        return newItemId;
    }

    function setUri(uint256 itemId, string memory tokenURI)
        external
        onlyMarketplace
    {
        _setTokenURI(itemId, tokenURI);
    }

    modifier onlyMarketplace() {
        require(msg.sender == contractAddress, "Item is not for sale");
        _;
    }
}
