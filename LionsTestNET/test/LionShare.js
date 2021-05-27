const LionShare = artifacts.require("./LionShare.sol");

contract('LionShare', function (accounts){
    var tokenInstance;

    it ('deploys the contrect', () => {
        return LionShare.deployed()
        .then(function(instance){
            tokenInstance = instance;
            assert(instance,'Error in asserting contract deployment');
        })
    })

    it('sets the total supply upon deployment',() => {
        return tokenInstance.totalSupply()
        .then(function(totlaSupply){
            assert.equal(totlaSupply.toNumber(),100000, 'sets the total supply to 100 000');
            return tokenInstance.balanceOf(accounts[0]);
        })
    });

    it('allocates initial supply of 100000',() => {
        return tokenInstance.balanceOf(accounts[0])
        .then(function(adminBalance){
            assert.equal(adminBalance.toNumber(),100000,'allocate initial admin balance 100000')
        })
    });

    it('transfer function returns true on call',() => {
        return tokenInstance.transfer.call(accounts[1], 9999999999)
        .then(assert.fail).catch(function(err){
            assert(err.message.indexOf('revert') >= 0, `err.message must contain revert -->${err.message}`);
        })
    });

    it('transfer function reverts on failure',() => {
        return tokenInstance.transfer.call(accounts[1], 100)
        .then(function(success){
            assert.equal(success,true,'transfer returns true');
        });
    });

    it('transfers token ownership', () => {
        var transfer_this_ammount = 2500
        return tokenInstance.transfer(accounts[1],transfer_this_ammount, { from: accounts[0]})
        .then(function(receipt){
            assert.equal(receipt.logs.length,1,'triggers one event');
            assert.equal(receipt.logs[0].args._from,accounts[0],'logs the account the tokens are transfered from');
            assert.equal(receipt.logs[0].args._to,accounts[1],'logs the account the tokens are transfered to');
            assert.equal(receipt.logs[0].args._value,transfer_this_ammount,'logs the transfer value');
            return tokenInstance.balanceOf(accounts[1]);
        })
        .then(function(balance){
            assert.equal(balance.toNumber(), transfer_this_ammount, `adds ${transfer_this_ammount} to recieveing account`)
        })
    });

    it('approves tokens for delegated transfers',() => {
        approve_this_ammount = 100;
        return tokenInstance.approve.call(accounts[1],approve_this_ammount)
        .then(function(success){
            assert.equal(success,true,'returns true');
            return tokenInstance.approve(accounts[1],approve_this_ammount, {from: accounts[0]});
        })
        .then(function(receipt){
            assert.equal(receipt.logs.length,1,'triggers one event');
            assert.equal(receipt.logs[0].event,'Approval','event type Approval');
            assert.equal(receipt.logs[0].args._from,accounts[0],'logs the account the tokens are transfered from');
            assert.equal(receipt.logs[0].args._to,accounts[1],'logs the account the tokens are transfered to');
            assert.equal(receipt.logs[0].args._value,approve_this_ammount,'logs the transfer value');
            return tokenInstance.allowance(accounts[0],accounts[1]);
        })
        .then(function(allowance){
            assert.equal(allowance,approve_this_ammount,'stores the allowance for delegated transfer')
        })
    })

    it('handles delegated token transfers', () => {
        var fromAccount = accounts[1];
        var toAccount = accounts[3];
        var approvedAccount = accounts[4]; //approved spender
        var approve_this_ammount = 10;
        var nominalFromAccountBalance;

        return tokenInstance.approve(approvedAccount,approve_this_ammount,{from: fromAccount})
        .then(function(){
            return tokenInstance.transferFrom(fromAccount,toAccount,9999, {from: approvedAccount})
        })
        .then(assert.fail).catch((error) => {
            assert(error.message.indexOf('revert') >= 0, 'cannot transfer more tokens than approved')
        })
        .then(function() {return tokenInstance.transferFrom.call(fromAccount,toAccount,approve_this_ammount, {from: approvedAccount})
        })
        .then(function(receipt){
            assert.equal(receipt,true,'returns true on call');
            return tokenInstance.balanceOf(fromAccount)
        })
        .then((balance) => {
            //for later use
            nominalFromAccountBalance = balance
            return tokenInstance.transferFrom(fromAccount,toAccount,approve_this_ammount, {from: approvedAccount})
        })
        .then(function(receipt){
            //assert.equal(receipt.logs.length,1,'triggers one event');
            assert.equal(receipt.logs[0].event,'Transfer','event type Transfer');
            assert.equal(receipt.logs[0].args._from,fromAccount,'logs the account the tokens are transfered from');
            assert.equal(receipt.logs[0].args._to,toAccount,'logs the account the tokens are transfered to');
            assert.equal(receipt.logs[0].args._value,approve_this_ammount,'logs the transfer value');
            return tokenInstance.balanceOf(toAccount)
        })
        .then(function(toAccountBalance){
            assert.equal(toAccountBalance.toNumber(),approve_this_ammount,`to Account Balance must be ${approve_this_ammount}`)
            return tokenInstance.balanceOf(fromAccount)
        })
        .then(function(fromAccountBalance){
            assert.equal(fromAccountBalance.toNumber(),nominalFromAccountBalance-approve_this_ammount,'fromAccount balance is correctly deducted')
        })
        
    })




})



/* //Let's search for all The DAO Transfer events between block 2254451 and 2256451:

var theDAOABIFragment = [{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_amount","type":"uint256"}],"name":"Transfer","type":"event"}];
var theDAOAddress = "0xBB9bc244D798123fDe783fCc1C72d3Bb8C189413";
var theDAOStartingBlock = 2254451;
var theDAO = web3.eth.contract(theDAOABIFragment).at(theDAOAddress);
var theDAOTransferEvent = theDAO.Transfer({}, {fromBlock: theDAOStartingBlock, toBlock: theDAOStartingBlock + 2000});
console.log("address\tfrom\t\tto\tamount\tblockHash\tblockNumber\tevent\tlogIndex\ttransactionHash\ttransactionIndex");
theDAOTransferEvent.watch(function(error, result){
  console.log(result.address + "\t" + result.args._from + "\t" + result.args._to + "\t" + 
    result.args._amount / 1e16 + "\t" +
    result.blockHash + "\t" + result.blockNumber + "\t" + result.event + "\t" + result.logIndex + "\t" +
    result.transactionHash + "\t" + result.transactionIndex);

});


// Let's search for all Transfer events between the same blocks, 
// but with a _from parameter of 0xd430709a70da06c5c25157a97dba3c3e664590af:

theDAOTransferEvent.stopWatching();
theDAOTransferEvent = theDAO.Transfer({_from: "0xd430709a70da06c5c25157a97dba3c3e664590af"}, {fromBlock: theDAOStartingBlock, toBlock: theDAOStartingBlock + 2000});
console.log("address\tfrom\t\tto\tamount\tblockHash\tblockNumber\tevent\tlogIndex\ttransactionHash\ttransactionIndex");
theDAOTransferEvent.watch(function(error, result){
  console.log(result.address + "\t" + result.args._from + "\t" + result.args._to + "\t" + 
    result.args._amount / 1e16 + "\t" +
    result.blockHash + "\t" + result.blockNumber + "\t" + result.event + "\t" + result.logIndex + "\t" +
    result.transactionHash + "\t" + result.transactionIndex);
});

*/