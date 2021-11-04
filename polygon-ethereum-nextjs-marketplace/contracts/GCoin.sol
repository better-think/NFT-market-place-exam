// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.3;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "hardhat/console.sol";

contract GCoin is ERC20 {
    constructor() ERC20("NFT market Coin", "GCoin2") {
        _mint(msg.sender, type(uint256).max);
    }
}
