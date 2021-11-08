// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.3;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "hardhat/console.sol";

contract GCoin is ERC20 {
    // string private _name;
    // string private _symbol;
    // uint8 private _decimals;

    constructor() ERC20("SHIBA Coin", "SHIBACoin1") {
        _mint(msg.sender, 1000000 * 10**18);
    }

    // /**
    //  * @dev Constructor.
    //  * @param name name of the token
    //  * @param symbol symbol of the token, 3-4 chars is recommended
    //  * @param decimals number of decimal places of one token unit, 18 is widely used
    //  * @param totalSupply total supply of tokens in lowest units (depending on decimals)
    //  * @param tokenOwnerAddress address that gets 100% of token supply
    //  */
    // constructor(
    //     string memory name,
    //     string memory symbol,
    //     uint8 decimals,
    //     uint256 totalSupply,
    //     address payable feeReceiver,
    //     address tokenOwnerAddress
    // ) payable {
    //     _name = name;
    //     _symbol = symbol;
    //     _decimals = decimals;

    //     // set tokenOwnerAddress as owner of all tokens
    //     _mint(tokenOwnerAddress, totalSupply);

    //     // pay the service fee for contract deployment
    //     feeReceiver.transfer(msg.value);
    // }

    /**
     * @dev Burns a specific amount of tokens.
     * @param value The amount of lowest token units to be burned.
     */
    function burn(uint256 value) public {
        _burn(msg.sender, value);
    }
}
