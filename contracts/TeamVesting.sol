pragma solidity ^0.8.11;
pragma abicoder v2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./Token.sol";

struct Vestor {
    //Vestor address
    address beneficiary;
    // Amount to be vested.
    uint256 vestingAmount;
    // Vesting duration, after cliff.
    uint256 duration;
    // Amount already claimed by beneficiary.
    uint256 claimedAmount;
    // Time at which beneficiary last claimed.
    uint256 lastClaimedTime;
    // Initial amount to be claimed, included in vestingAmount.
    uint256 initialAmount;
    // Whether the initialAmount value was claimed.
    bool initialClaimed;
    // Time at which vesting begins.
    uint256 claimStartTime;
    // Employee left the company.
    bool terminated;
}

contract TeamVesting is Ownable {
    using SafeERC20 for ERC20;

    address public immutable self;
    address public immutable RITE;
    uint256 public startDate;

    constructor(address _RITE, uint256 _startDate) {
        self = address(this);
        RITE = _RITE;
        startDate = _startDate;
    }

    // Employee List
    mapping(address => Vestor) public vestors;

    function setTeamVesting(Vestor[] memory _vestors) public onlyOwner {
        require(_vestors.length > 0, "No employees to set");

        for (uint256 i = 0; i < _vestors.length; i++) {
            address beneficiary = _vestors[i].beneficiary;
            require(
                beneficiary != owner() && beneficiary != self,
                "Beneficiary is not allowed to be owner or self"
            );

            require(
                !_vestors[i].terminated,
                "Beneficiary is already terminated"
            );
            require(
                _vestors[i].vestingAmount > 0,
                "Beneficiary has no vesting amount"
            );
            require(_vestors[i].duration > 0, "beneficiary has no duration");
            //cliff period 6 months
            require(
                _vestors[i].claimStartTime > 0,
                "Beneficiary has no claimStartTime"
            );
            require(
                _vestors[i].claimedAmount == 0,
                "Claimed amount is not valid"
            );
            require(
                _vestors[i].lastClaimedTime == 0,
                "Last claimed time is not valid"
            );
            require(
                _vestors[i].initialAmount > 0,
                "Initial amount is not valid"
            );
            require(
                _vestors[i].initialClaimed == false,
                "Initial claimed can not be true"
            );

            vestors[beneficiary] = Vestor(
                beneficiary,
                _vestors[i].vestingAmount,
                _vestors[i].duration,
                _vestors[i].claimedAmount,
                _vestors[i].lastClaimedTime,
                _vestors[i].initialAmount,
                _vestors[i].initialClaimed,
                _vestors[i].claimStartTime,
                _vestors[i].terminated
            );
        }
    }

    function claim() public {
        require(
            startDate != 0 && block.timestamp > startDate,
            "Vesting period has not started"
        );
        require(
            vestors[msg.sender].terminated == false,
            "Beneficiary is terminated"
        );
        require(
            block.timestamp > vestors[msg.sender].claimStartTime,
            "Claiming period has not started"
        );
        require(
            vestors[msg.sender].claimedAmount <
                vestors[msg.sender].vestingAmount,
            "You have already claimed your vesting amount"
        );

        uint256 amountToClaim = 0;

        uint256 lastClaimedTime = vestors[msg.sender].lastClaimedTime;

        if (
            vestors[msg.sender].initialClaimed == false &&
            vestors[msg.sender].initialAmount > 0
        ) {
            amountToClaim += vestors[msg.sender].initialAmount;
            vestors[msg.sender].initialClaimed = true;
        }

        if (lastClaimedTime == 0)
            lastClaimedTime = vestors[msg.sender].claimStartTime;

        amountToClaim +=
            ((block.timestamp - lastClaimedTime) *
                (vestors[msg.sender].vestingAmount -
                    vestors[msg.sender].initialAmount)) /
            vestors[msg.sender].duration;

        // In case the last claim amount is greater than the remaining amount
        if (
            amountToClaim >
            vestors[msg.sender].vestingAmount -
                vestors[msg.sender].claimedAmount
        )
            amountToClaim =
                vestors[msg.sender].vestingAmount -
                vestors[msg.sender].claimedAmount;

        vestors[msg.sender].claimedAmount += amountToClaim;
        vestors[msg.sender].lastClaimedTime = block.timestamp;
        ERC20(RITE).safeTransfer(msg.sender, amountToClaim);

        emit Claimed(msg.sender, amountToClaim);
    }

    function getEmployeeVesting(address beneficiary)
        public
        view
        returns (Vestor memory)
    {
        return vestors[beneficiary];
    }

    function terminateNow(address beneficiary) public onlyOwner {
        require(
            vestors[beneficiary].terminated == false,
            "Beneficiary is already terminated"
        );
        vestors[beneficiary].terminated = true;

        emit Terminated(beneficiary);
    }

    function setStartDate(uint256 _startDate) public onlyOwner {
        require(_startDate > block.timestamp, "Start date is in the past");
        startDate = _startDate;
    }

    event Terminated(address indexed beneficiary);
    event Claimed(address indexed beneficiary, uint256 amount);
}
