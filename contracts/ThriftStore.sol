// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;
import "hardhat/console.sol";

contract ThriftStore {
    
    // counter to generate item ID
    uint private idCounter = 0;

    // User struct that contains user ID, password and their address
    struct User {
        string userId;
        bytes32 passwordHash;
        address userAccountAddress;
    }

    enum SoldStatus { POSTED, SOLD, REMOVED }
    enum RefundStatus { NONE, REQUESTED, DENIED }

    // ItemInfo struct stores information of items posted by the sellers
    struct ItemInfo {
        //string contactUserName;
        uint64 itemPrice;
        //string imageBase64;
        string itemName;
        uint256 itemId;
        string itemDescription;
        SoldStatus soldStatus;
        uint256 time;
        RefundStatus refundStatus;
        string orderPickupAddress;
    }

    // Stores information of all transactions made
    struct TransactionInfo {
        address buyer;
        uint256 time;
        uint256 itemID;
        uint64 itemPrice;
    }

    // Map the itemId to the owner/seller
    mapping(uint256 => address) public sellers;

    mapping(address => User) public users;

    // Map itemId to its info
    mapping(uint256 => ItemInfo) public items;

    // Map item id to its Transaction info
    mapping(uint256 => TransactionInfo)public transactions;

    // Map user to the items sold
    mapping(address => uint256[]) public itemsPosted;

    // Map user to items bought
    mapping(address => uint256[]) public itemsBought;
    
    // User address to username
    mapping(address => bytes32) public activeUsers; // NOT SURE if we are gonna keep this

    // Modifier to check a valid item
    modifier validItem(uint256 id) {
        require(items[id].soldStatus == SoldStatus.POSTED, "The item does not exist or has been sold");
        _;
    }
    
    // Modifier to check a validAd
    modifier validAd( string memory itemName, string memory itemDescription, uint64 itemPrice, string memory senderAddress) {
        require(bytes(itemName).length > 0, "You must add a name");
        require(bytes(itemDescription).length > 0,"You must add a description");
        require(bytes(senderAddress).length > 0, "You must add your address");
        require(itemPrice > 0, "You must set a price");
        _;
    }

    // Function to send ethers between users
    function sendEther(address payable _addr, uint64 _amount) public payable {
        require(msg.value >= _amount, "Insufficient Ether");

        (bool success, ) = _addr.call{value: _amount}("");
        require(success, "Ether transfer failed");
    }

    // Function to buy an item that has been posted in the marketplace
    function buyItem(uint256 id) public payable validItem(id) {
        
        // Condition to make sure buyer has enough ether
        uint64 price = items[id].itemPrice;
        require(msg.value >= price, "You don't have enough ether");

        sendEther(payable(sellers[id]), price);

        uint256 executionTime = block.timestamp;

        // Saving the information in transactions
        transactions[id] = TransactionInfo(msg.sender, executionTime, id, price);
        
        // Updating the status of the ad
        items[id].soldStatus = SoldStatus.SOLD;
        itemsBought[msg.sender].push(id);
    }

    // Function to post an ad on the marketplace
    function postAd(string memory itemName, string memory itemDescription, uint64 itemPrice, string memory senderAddress) public 
        validAd (itemName, itemDescription, itemPrice, senderAddress) {

        uint256 executionTime = block.timestamp;

        // Updating the counter to generate the new itemId
        idCounter = idCounter + 1;

        sellers[idCounter] = msg.sender;

        items[idCounter] = ItemInfo(
            itemPrice,
            itemName,
            idCounter,
            itemDescription,
            SoldStatus.POSTED,
            executionTime,
            RefundStatus.NONE,
            senderAddress
        );

       itemsPosted[msg.sender].push(idCounter);
    }

    // Function to remove an ad posted by the seller
    function removeAd(uint256 id) public {
        require(sellers[id] == msg.sender, "Only the seller can remove the ad");
        require(items[id].soldStatus == SoldStatus.POSTED, "This item has already been sold or removed");
        
        items[id].soldStatus = SoldStatus.REMOVED;
        delete sellers[id];
    }

    //Function to update an ad
    function updateAd(uint256 id, string memory itemName, string memory itemDescription, uint64 itemPrice, string memory senderAddress) public 
        validAd(itemName, itemDescription, itemPrice, senderAddress) {
        
        // Checking that the user posts all the required information
        require(id>0, "ID does not exist");
        require(sellers[id] == msg.sender, "Only the seller can update the ad");
        
        ItemInfo memory oldItem = getItem(id);

        items[id] =  ItemInfo(
            itemPrice,
            itemName,
            id,
            itemDescription,
            oldItem.soldStatus,
            oldItem.time,
            oldItem.refundStatus,
            senderAddress
        );
    }

    // Function to allow buyer to request a refund
    function requestRefund(uint256 id) public {
        require(items[id].soldStatus == SoldStatus.SOLD, "The item has not been sold yet");
        require(transactions[id].buyer == msg.sender, "Only the buyer can request a refund");

        // Update the refund status
        items[id].refundStatus = RefundStatus.REQUESTED;
    }

    // Function to allow the seller to accept or reject the refund
    function respondToRefundRequest(uint256 id, bool refund) public {
        require(items[id].soldStatus == SoldStatus.SOLD, "The item has not been sold yet");
        require(items[id].refundStatus == RefundStatus.REQUESTED, "The buyer did not request a refund");
        require(sellers[id] == msg.sender, "Only the seller can approve a refund");

        if (refund) {
            sendEther(payable(transactions[id].buyer), items[id].itemPrice);

            // Update status of the item
            items[id].refundStatus = RefundStatus.NONE;
            items[id].soldStatus = SoldStatus.POSTED;
            
            removeItemFromArray(itemsBought[transactions[id].buyer],id);
            delete transactions[id]; 
        } else items[id].refundStatus = RefundStatus.DENIED;
    }

    // Getter for Item item
    function getItem(uint itemId) public  view  returns (ItemInfo memory) {
        return items[itemId];
    }
    
    // Getter for the idCounter
    function getCounter() public view returns (uint) {
        return idCounter;
    }

    // Getter for  all Items posted by user
    function getAllItemIdsPostedByUser() public view returns (uint256[] memory) {
        return itemsPosted[msg.sender];
    }
     function getItemsMapping(uint256 id) public view returns (ItemInfo memory) {
        return items[id];
    }

    //Getter for  all Items bought by user
    function getAllItemIdsBoughtByUser() public view returns (uint256[] memory) {
        return itemsBought[msg.sender];
    }
    
    // Helper function to remove an item from an array
    function removeItemFromArray(uint[] memory array, uint256 item) public {
        for (uint i = 0; i < array.length; i++) {
            if (array[i] == item) {
                array[i] = array[array.length - 1];
               delete array[array.length-1];
                break;
            }
        }
    }

}