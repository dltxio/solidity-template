pragma solidity ^0.8.11;
pragma abicoder v2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./Token.sol";

struct Vesting {
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
    uint256 initialAmount; // still waiting for requirement to be finalized
    // Whether the initialAmount value was claimed.
    bool initialClaimed;
    // Time at which vesting begins.
    uint256 claimStartTime;
}

// Client's requirement not yet finalized, still waiting.
contract SaleVesting is Ownable {
    using SafeERC20 for ERC20;

    address public immutable self;
    address public immutable RITE;
    uint256 public TGEDate;

    constructor(address _RITE, uint256 _TGEDate) {
        self = address(this);
        RITE = _RITE;
        TGEDate = _TGEDate;
    }

    mapping(address => Vesting) private vestings;

    //Set user's vesting struct
    function setVesting(Vesting[] memory _vestings) public onlyOwner {
        require(_vestings.length > 0, "No vesting list provided");
        require(
            block.timestamp < TGEDate,
            "TGE already finished, no more vesting"
        );

        for (uint256 i = 0; i < _vestings.length; i++) {
            address beneficiary = _vestings[i].beneficiary;
            require(
                beneficiary != owner() && beneficiary != address(0),
                "Beneficiary address is not valid"
            );
            require(
                _vestings[i].vestingAmount > 0,
                "Vesting amount is not valid"
            );
            require(_vestings[i].duration > 0, "Duration is not valid");
            require(
                _vestings[i].claimedAmount == 0,
                "Claimed amount is not valid"
            );
            require(
                _vestings[i].lastClaimedTime == 0,
                "Last claimed time is not valid"
            );
            require(
                _vestings[i].initialAmount > 0,
                "TGE initial release amount is not valid"
            );
            require(
                _vestings[i].initialClaimed == false,
                "Initial claimed is not valid"
            );
            require(
                _vestings[i].claimStartTime >= TGEDate,
                "Claim start time is not valid"
            );

            vestings[beneficiary] = Vesting(
                beneficiary,
                _vestings[i].vestingAmount,
                _vestings[i].duration,
                _vestings[i].claimedAmount,
                _vestings[i].lastClaimedTime,
                _vestings[i].initialAmount,
                _vestings[i].initialClaimed,
                _vestings[i].claimStartTime
            );

            emit Vested(beneficiary, _vestings[i].vestingAmount);
        }
    }

    function claim() public {
        require(
            TGEDate > 0 && block.timestamp >= TGEDate,
            "Claim is not allowed before TGE start"
        );
        require(
            vestings[msg.sender].claimedAmount <
                vestings[msg.sender].vestingAmount,
            "You have already claimed your vesting amount"
        );

        uint256 amountToClaim = 0;

        // if initial claim is not done, claim initial amount + linear amount
        if (
            vestings[msg.sender].initialClaimed == false &&
            vestings[msg.sender].initialAmount > 0
        ) {
            amountToClaim += vestings[msg.sender].initialAmount;
            vestings[msg.sender].initialClaimed = true;
        }

        // Check that block is after the cliff period.
        if (block.timestamp >= vestings[msg.sender].claimStartTime) {
            uint256 lastClaimedTime = vestings[msg.sender].lastClaimedTime;
            if (lastClaimedTime == 0)
                lastClaimedTime = vestings[msg.sender].claimStartTime;

            amountToClaim +=
                ((block.timestamp - lastClaimedTime) *
                    (vestings[msg.sender].vestingAmount -
                        vestings[msg.sender].initialAmount)) /
                vestings[msg.sender].duration;

            // In case the last claim amount is greater than the remaining amount
            if (
                amountToClaim >
                vestings[msg.sender].vestingAmount -
                    vestings[msg.sender].claimedAmount
            )
                amountToClaim =
                    vestings[msg.sender].vestingAmount -
                    vestings[msg.sender].claimedAmount;
        }

        vestings[msg.sender].lastClaimedTime = block.timestamp;
        vestings[msg.sender].claimedAmount += amountToClaim;
        ERC20(RITE).safeTransfer(msg.sender, amountToClaim);

        emit Claimed(msg.sender, amountToClaim);
    }

    function getUserVesting() public view returns (Vesting memory) {
        return vestings[msg.sender];
    }

    function setTgeDate(uint256 _date) public onlyOwner {
        require(_date > block.timestamp, "TGE date is not valid");
        TGEDate = _date;
    }

    event Claimed(address indexed beneficiary, uint256 amount);
    event Vested(address indexed beneficiary, uint256 amount);
}
