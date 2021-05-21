const LionShare = artifacts.require("./LionShare.sol");

contract('LionShare', function (accounts){
    it('sets the total supply upon deployment',function(){

        return LionShare.deployed()
        .then(function(instance){

            tokenInstance = instance;
            return tokenInstance.totalSupply();

        })
        .then(function(totlaSupply){
            assert.equal(totlaSupply.toNumber(), 100000, 'sets the total supply to 100 000');
        });

    });
})