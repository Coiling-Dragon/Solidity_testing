// SPDX-License-Identifier: MIT

pragma solidity >=0.5.0;

contract LionShare{
    uint256 private _totalSupply;
    
    //constructor
    constructor() public {
        _totalSupply = 100000;
    }
    
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }
}