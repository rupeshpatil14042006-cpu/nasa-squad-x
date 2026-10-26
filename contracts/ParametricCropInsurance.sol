// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ParametricCropInsurance
 * @notice Decentralized Parametric Climate Insurance with Oracle Payout Triggers.
 * Automatically disburses emergency relief to farmers when NASA observations
 * exceed extreme drought, rain deficit, or heat stress thresholds.
 */
contract ParametricCropInsurance {
    address public immutable insurerAdmin;
    address public oracleSigner;

    struct Policy {
        string fieldId;
        address payable beneficiary;
        uint256 coverageAmountWei;
        uint256 premiumPaidWei;
        uint256 expiryTimestamp;
        bool active;
        bool claimed;
    }

    mapping(bytes32 => Policy) public policies;
    uint256 public totalEscrowBalance;

    event PolicyCreated(bytes32 indexed policyId, string fieldId, address indexed beneficiary, uint256 coverage);
    event PayoutTriggered(bytes32 indexed policyId, address indexed recipient, uint256 payoutAmount, string reason);
    event EscrowFunded(address indexed funder, uint256 amount);
    event OracleUpdated(address indexed newOracle);

    modifier onlyAdmin() {
        require(msg.sender == insurerAdmin, "Only admin");
        _;
    }

    modifier onlyOracle() {
        require(msg.sender == oracleSigner || msg.sender == insurerAdmin, "Only authorized NASA oracle");
        _;
    }

    constructor(address _oracleSigner) payable {
        insurerAdmin = msg.sender;
        oracleSigner = _oracleSigner;
        totalEscrowBalance = msg.value;
    }

    receive() external payable {
        totalEscrowBalance += msg.value;
        emit EscrowFunded(msg.sender, msg.value);
    }

    function setOracle(address _newOracle) external onlyAdmin {
        oracleSigner = _newOracle;
        emit OracleUpdated(_newOracle);
    }

    function createPolicy(
        string memory _fieldId,
        uint256 _durationDays,
        uint256 _coverageAmountWei
    ) external payable returns (bytes32) {
        require(msg.value > 0, "Premium payment required");
        require(address(this).balance >= totalEscrowBalance + msg.value, "Escrow invariant check");

        bytes32 policyId = keccak256(abi.encodePacked(_fieldId, msg.sender, block.timestamp));
        policies[policyId] = Policy({
            fieldId: _fieldId,
            beneficiary: payable(msg.sender),
            coverageAmountWei: _coverageAmountWei,
            premiumPaidWei: msg.value,
            expiryTimestamp: block.timestamp + (_durationDays * 1 days),
            active: true,
            claimed: false
        });

        totalEscrowBalance += msg.value;
        emit PolicyCreated(policyId, _fieldId, msg.sender, _coverageAmountWei);
        return policyId;
    }

    /**
     * @notice Executed by NASA Satellite Oracle when parametric climate conditions are breached.
     * @param _policyId Policy identifier
     * @param _drySpellDays Consecutive days without rain
     * @param _rainDeficitPct Percentage deficit vs historical average
     * @param _oracleReason Description of satellite trigger
     */
    function triggerParametricPayout(
        bytes32 _policyId,
        uint256 _drySpellDays,
        uint256 _rainDeficitPct,
        string calldata _oracleReason
    ) external onlyOracle {
        Policy storage policy = policies[_policyId];
        require(policy.active, "Policy is not active");
        require(!policy.claimed, "Policy already claimed");
        require(block.timestamp <= policy.expiryTimestamp, "Policy expired");

        // Parametric Threshold Check: dry spell > 14 days OR rain deficit > 40%
        require(_drySpellDays > 14 || _rainDeficitPct > 40, "Parametric threshold not met");

        policy.claimed = true;
        policy.active = false;

        uint256 payout = policy.coverageAmountWei;
        require(address(this).balance >= payout, "Insufficient pool liquidity");

        totalEscrowBalance -= payout;
        (bool success, ) = policy.beneficiary.call{value: payout}("");
        require(success, "Transfer failed");

        emit PayoutTriggered(_policyId, policy.beneficiary, payout, _oracleReason);
    }
}
