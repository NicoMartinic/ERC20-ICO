// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;
import "./TestToken.sol";

contract TestTokenSale { 

    // Variables
    address admin;
    TestToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    // Constructor
    constructor (TestToken _tokenContract, uint256 _tokenPrice) {
        // Asign admin
        admin = msg.sender;
        // Assign token contract
        tokenContract = _tokenContract;
        // Assign token price
        tokenPrice = _tokenPrice;
    }

    event Sell(address _buyer, uint256 _amount);

    // Multiply 
    function multiply(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y)/y == x);
    }

    // Buy tokens
    function buyTokens(uint256 _numberOfTokens) public payable {
        // Require that the value is equal to tokens
        require(msg.value == multiply(_numberOfTokens, tokenPrice));
        // Require that are enough token in the contract
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);
        // Require that a trasnfer is successful
        require(tokenContract.transfer(msg.sender, _numberOfTokens));
        // Keep track of tokens sold
        tokensSold += _numberOfTokens;
        // Trigger Sell Event
        emit Sell(msg.sender, _numberOfTokens);
    }

    // Ending token sale
    function endSale() public {
        // Only admin can use this function
        require(msg.sender == admin);
        // Transfer remaining tokens to admin
        require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));
        // Destroy contract
        selfdestruct(payable(admin));
    }
}