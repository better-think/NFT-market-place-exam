// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/Counters.sol";
// import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./GCoin.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "hardhat/console.sol";

contract NFTMarket is ReentrancyGuardUpgradeable {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;

    address payable owner;
    uint256 listingPrice;
    mapping(uint256 => string) reverseTokenURI;

    // uint256 public totalVolume;

    // constructor() {
    //     owner = payable(msg.sender);
    // }

    function initialize(IERC20 _marketToken) public initializer {
        owner = payable(msg.sender);
        listingPrice = 1 * 10**18;
        totalVolume = 0;
        marketToken = IERC20(
            address(0xf740E266a17918c20cE2dd40eEfad2B2f8Dacb45)
        );

        marketWallet = payable(msg.sender);
    }

    struct MarketItem {
        uint256 itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    mapping(uint256 => MarketItem) private idToMarketItem;

    event MarketItemCreated(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    event MarketItemSaled(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 totalVolume
    );

    /* Returns the listing price of the contract */
    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    /* Places an item for sale on the marketplace */
    function createMarketItem(
        address nftContract,
        uint256 tokenId,
        uint256 price,
        string memory tokenURI
    ) public nonReentrant {
        require(price > 0, "Price must be at least 1 wei");
        // require(
        //     msg.value == listingPrice,
        //     "Price must be equal to listing price"
        // );

        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        idToMarketItem[itemId] = MarketItem(
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender),
            payable(address(0)),
            price,
            false
        );

        IERC721(nftContract).safeTransferFrom(
            msg.sender,
            address(this),
            tokenId
        );
        uint256 allowance = marketToken.allowance(
            address(msg.sender),
            address(this)
        );
        require(allowance >= listingPrice, "Check the token allowance");
        // transfer listing fee from  creator to market place
        marketToken.transferFrom(msg.sender, marketWallet, listingPrice);

        reverseTokenURI[tokenId] = tokenURI;

        // finish and emit event
        emit MarketItemCreated(
            itemId,
            nftContract,
            tokenId,
            msg.sender,
            address(0),
            price,
            false
        );
    }

    modifier isItemForSale(uint256 itemId) {
        require(idToMarketItem[itemId].sold == false, "Item is not for sale");
        _;
    }

    // modifier isItemExist(uint256 itemId) {
    //     require(
    //         itemId < idToMarketItem.size && idToMarketItem[itemId] == itemId,
    //         "Item not existed"
    //     );
    //     _;
    // }

    /* Creates the sale of a marketplace item */
    /* Transfers ownership of the item, as well as funds between parties */
    function createMarketSale(
        address nftContract,
        uint256 itemId,
        uint256 itemPrice
    ) public nonReentrant isItemForSale(itemId) {
        uint256 price = idToMarketItem[itemId].price;
        uint256 tokenId = idToMarketItem[itemId].tokenId;
        require(
            itemPrice == price,
            "Please submit the asking price in order to complete the purchase"
        );
        // require(price < 0, Strings.toString(token.balanceOf(msg.sender)));
        require(
            marketToken.balanceOf(msg.sender) > price,
            "check buyer balance"
        );
        uint256 allowance = marketToken.allowance(
            address(msg.sender),
            address(this)
        );
        require(allowance >= price, "Check the token allowance");
        // transfer token to seller
        require(
            marketToken.transferFrom(
                msg.sender,
                idToMarketItem[itemId].seller,
                price
            ) == true,
            "Could not send tokens to the market"
        );

        IERC721(nftContract).safeTransferFrom(
            address(this),
            msg.sender,
            tokenId
        );
        idToMarketItem[itemId].owner = payable(msg.sender);
        idToMarketItem[itemId].sold = true;
        _itemsSold.increment();
        totalVolume += price;
        payable(owner).transfer(listingPrice);

        // pay for seller
        // require(
        //     token.transferFrom(address(this), owner, listingPrice) == true,
        //     "Could not send tokens to owner"
        // );

        emit MarketItemSaled(
            itemId,
            nftContract,
            tokenId,
            address(this),
            msg.sender,
            totalVolume
        );
    }

    /* Returns all unsold market items */
    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint256 itemCount = _itemIds.current();
        uint256 unsoldItemCount = _itemIds.current() - _itemsSold.current();
        uint256 currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](unsoldItemCount);
        for (uint256 i = 0; i < itemCount; i++) {
            if (idToMarketItem[i + 1].owner == address(0)) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    /* Returns onlyl items that a user has purchased */
    function fetchMyNFTs() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _itemIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    /* Returns only items a user has created */
    function fetchItemsCreated() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _itemIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    // for test only to get back token fee for testor
    function withdrawMarketToken() public {
        // uint256 currentBalance = owner.balance;
        // owner.transferFrom(owner, msg.sender, currentBalance*0.9);
    }

    function releaseItemDetail(address nftContract, uint256 tokenId) public {
        IERC721(nftContract).setUri(tokenId, reverseTokenURI[tokenId]);
        delete reverseTokenURI[tokenId];
    }

    uint256 public totalVolume;
    IERC20 public marketToken;
    address public marketWallet;
}
