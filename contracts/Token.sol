// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma abicoder v2;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is IERC20, ERC20 {
    using SafeMath for uint256;

    address public immutable owner;
    uint8 private immutable _decimals;

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_
    ) ERC20(name_, symbol_) {
        owner = msg.sender;
        _decimals = decimals_;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Access Denied");
        _;
    }
    
    function mint(address account, uint256 amount)
        external
        onlyOwner
    {
        _mint(account, amount);
    }

    function burn(address account, uint256 amount)
        external
        onlyOwner
    {
        _burn(account, amount);
    }
    
    function decimals() public view override returns (uint8) {
        return _decimals;
    }
}
