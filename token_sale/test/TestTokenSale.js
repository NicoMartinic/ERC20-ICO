const TestTokenSale = artifacts.require("TestTokenSale");
const TestToken = artifacts.require("TestToken");

contract('TestToken', function(accounts) { 
    var tokenInstance;
    var buyer = accounts[1];
    var tokenPrice = 1000000000000000; // in wei
    var numberOfTokens;
    var admin = accounts[0];
    var tokensAvailable = 75000;

    it('initializes the contract with the correct values', function() {
        return TestTokenSale.deployed().then(function(instance) {
            tokenSaleInstance = instance;
            return tokenSaleInstance.address;
        }).then(function(address) {
            assert.notEqual(address, 0x0, 'has contract address');
            return tokenSaleInstance.tokenContract();
        }).then(function(address) {
            assert.notEqual(address, 0x0, 'has a token contract address');
            return tokenSaleInstance.tokenPrice();
        }).then(function(price) {
            assert.equal(price, tokenPrice, 'token price is correct');
        });
    });

    it('facilitates token buying', function() {
        return TestToken.deployed().then(function(instance) { 
            // Grab token instance first
            tokenInstance = instance;
            return  TestTokenSale.deployed();
        }).then(function(instance) {
            // Then grab token sale instance
            tokenSaleInstance = instance;
            // Give 75% of all token to the sale contract
            return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, { from : admin});
        }).then(function(receipt) {
            numberOfTokens = 10;
            return tokenSaleInstance.buyTokens(numberOfTokens, { from : buyer, value : numberOfTokens * tokenPrice });
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Sell" event');
            assert.equal(receipt.logs[0].args._buyer, buyer, 'logs the account that purchased the tokens');
            assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'logs the number of tokens purchased');
            return tokenSaleInstance.tokensSold();
        }).then(function(amount) {
            assert.equal(amount, numberOfTokens, 'increments the number of tokens sold');
            return tokenInstance.balanceOf(buyer);
        }).then(function(balance) {
            assert.equal(balance, tokensAvailable - numberOfTokens);
            return tokenInstance.balanceOf(tokenSaleInstance.address);
        }).then(function(balance) {
            assert.equal(balance, tokensAvailable - numberOfTokens);
            // Try to buy tokens different from the ether value
            return tokenSaleInstance.buyTokens(numberOfTokens, { from : buyer, value : 1 });
        }).then(assert.fail).catch(function(error) {
            assert(error.message, 'msg.value must equal to the wei');
            return tokenSaleInstance.buyTokens(800000, { from : buyer, value : 1 });
        }).then(assert.fail).catch(function(error) {
            assert(error.message, 'can not purchase more tokens than available');
        })
    })

    it('ends token sale', function() {
        return TestToken.deployed().then(function(instance) {
         // Grab token instance first
         tokenInstance = instance;
         return  TestTokenSale.deployed();
        }).then(function(instance) {
            // Then grab token sale instance
            tokenSaleInstance = instance;
            // Try to end sale from another account than the admin
            return tokenSaleInstance.endSale({from :buyer});
        }).then(assert.fail).catch(function(error) {
            assert(error.message, 'must be admin to end sale');
            // End sale as admin
            return tokenSaleInstance.endSale( { from : admin });
        }).then(function(receipt) {
            return tokenInstance.balanceOf(admin);
        }).then(function(balance) {
            assert.equal(balance, 999990, 'returns all unsold dapp tokens to admin');
            // Check that the contract has no balance
            return balance = web3.eth.getBalance(tokenSaleInstance.address);
        }).then(function(balance) {
          assert.equal(balance, 0);
        });
    });
});