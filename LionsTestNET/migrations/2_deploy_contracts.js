const LionShare = artifacts.require("./LionShare.sol");

module.exports = function (deployer) {
  deployer.deploy(LionShare,100000);
};
