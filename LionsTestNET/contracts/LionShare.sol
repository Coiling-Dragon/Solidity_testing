// SPDX-License-Identifier: MIT

pragma solidity >=0.5.0 <0.9.0;

contract LionShare{
    string public name = "LionShare";
    uint256 private _totalSupply;
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    event Approval(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );
    
    //constructor
    constructor(uint256 _initialSupply) {
        _totalSupply = _initialSupply;

        //allocate initial supply;
        _balances[msg.sender] = _initialSupply;
        
    }
    
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    function _transfer(address sender, address recipient, uint256 amount) internal virtual {
        //require(sender != address(0), "ERC20: transfer from the zero address");
        //require(recipient != address(0), "ERC20: transfer to the zero address");

        uint256 senderBalance = _balances[sender];
        require(senderBalance >= amount, "ERC20: transfer amount exceeds balance");
        unchecked {
            _balances[sender] = senderBalance - amount;
        }
        _balances[recipient] += amount;

        emit Transfer(sender, recipient, amount);
    }

    //Transfer fn
    function transfer(address _to, uint256 _value) public virtual returns (bool){
        _transfer(msg.sender, _to, _value);
        return true;
    }

    // Delegate transfer 3 functions (approve, allowance, send - transferFrom)
    function allowance(address owner, address spender) public view virtual returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) public virtual returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
        
    }

    function _approve(address owner, address spender, uint256 amount) internal virtual {
        //require(owner != address(0), "ERC20: approve from the zero address");
        //require(spender != address(0), "ERC20: approve to the zero address");
        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function transferFrom(address _from, address _to, uint _value) public virtual returns (bool){
        // Require _from has enough tokens
        // Require allowence is big enough
        // Change the balance
        // Transver event
        // retunr bool
        uint256 currentAllowance = _allowances[_from][msg.sender];
        require(currentAllowance >= _value,"ERC20: transfer amount exceeds allowance");
        _transfer(_from, _to, _value);
        unchecked {
            _approve(_from, msg.sender, currentAllowance - _value);
        }
        return true;
    }

}