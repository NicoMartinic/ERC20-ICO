// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

contract TestToken {

    // Variables
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    string public name = 'Test Token';
    string public symbol = 'TT';
    string public standard = 'Test Token v1.0';
    mapping(address => mapping(address => uint256)) public allowance;

    //Constructor
    constructor (uint256 _initialSupply) {
        totalSupply = _initialSupply;
        // Allocate initial supply
        balanceOf[msg.sender] = _initialSupply;
    }

    // Transfer
    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    function transfer(address _to, uint256 _value) public returns (bool success) {
        // Exception if account doesn't have enough
        require(balanceOf[msg.sender]  >= _value);
        // Transfer the balance
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        // Transfer event
        emit Transfer(msg.sender, _to, _value);
        // Return boolean
        return true;
    }

    // Approval
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    function approve(address _spender, uint256 _value) public returns (bool success) {
        // Allowance
        allowance[msg.sender][_spender] = _value;
        // Approval event
        emit Approval(msg.sender, _spender, _value);
        // Return boolean
        return true;
    }

    // TransferFrom
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        // Require _from has enough tokens
        require(_value <= balanceOf[_from]);
        // Require allowance is big enough
        require(_value <= allowance[_from][msg.sender]);
        // Change the balance
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        // Update the allowance
        allowance[_from][msg.sender] -= _value;
        // Transfer event
        emit Transfer(_from, _to, _value);
        // Return boolean
        return true;
    }

}