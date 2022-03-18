const TestToken = artifacts.require("TestToken");
const TestTokenSale = artifacts.require("TestTokenSale");

module.exports = function (deployer) {
  deployer.deploy(TestToken, 1000000).then(function() {
    // Token Price = 0.001 ETH
    var tokenPrice = 1000000000000000; // in wei
    return deployer.deploy(TestTokenSale, TestToken.address, tokenPrice);
  });
};
