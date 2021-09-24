// SPDX-License-Identifier: MIT

pragma solidity >=0.5.0 <0.9.0;

import "./LionShare.sol";

contract LionShareSale {
    address payable admin;
    LionShare public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    event Sell(address _buyer, uint256 _amount);

    constructor(LionShare _tokenContract, uint256 _tokenPrice) {
        admin = payable(msg.sender);
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }

    function multiply(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x);
    }

    function buyTokens(uint256 _numberOfTokens) public payable {
        require(msg.value == multiply(_numberOfTokens, tokenPrice),"value of tokens not exact");
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens,"balanceOf less than tokens");
        require(tokenContract.transfer(msg.sender, _numberOfTokens),"transfer faild");

        tokensSold += _numberOfTokens;

        emit Sell(msg.sender, _numberOfTokens);
    }

    function endSale() public {
        require(msg.sender == admin);
        require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));
        //uint all_funds = address(this).balance;
        //admin.transfer(all_funds);
        //require(address(this).balance == 0);

        //Contracts can be deleted from the blockchain by calling selfdestruct.
        //selfdestruct sends all remaining Ether stored in the contract to an designated address.
        selfdestruct(admin);
    }
}
