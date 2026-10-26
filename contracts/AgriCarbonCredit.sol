// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AgriCarbonCredit
 * @notice ERC-20 compliant Satellite-Verified Carbon Offset Token (AGRI-CARBON).
 * Minted exclusively through Satellite MRV (Measurement, Reporting, and Verification).
 */
contract AgriCarbonCredit {
    string public name = "AgriSmart Carbon Credit";
    string public symbol = "AGRI-CARBON";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    address public immutable authority;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    struct CarbonOffsetBatch {
        string fieldId;
        uint256 ndviScoreScaled; // e.g. 7000 = 0.70
        uint256 metricTonsCO2e;
        uint256 timestamp;
        string verificationEvidenceUrl;
    }

    CarbonOffsetBatch[] public offsetBatches;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event CarbonCreditsMinted(address indexed beneficiary, uint256 amount, string fieldId, uint256 ndviScore);
    event CarbonCreditsRetired(address indexed burner, uint256 amount, string reason);

    modifier onlyAuthority() {
        require(msg.sender == authority, "Only MRV Satellite Authority");
        _;
    }

    constructor() {
        authority = msg.sender;
    }

    function transfer(address _to, uint256 _value) public returns (bool) {
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
        require(balanceOf[_from] >= _value, "Insufficient balance");
        require(allowance[_from][msg.sender] >= _value, "Allowance exceeded");
        balanceOf[_from] -= _value;
        allowance[_from][msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(_from, _to, _value);
        return true;
    }

    /**
     * @notice Mints carbon credits to farmer following satellite MRV verification.
     */
    function mintSatelliteVerifiedCredits(
        address _farmer,
        uint256 _amountTokens,
        string memory _fieldId,
        uint256 _ndviScoreScaled,
        string memory _evidenceUrl
    ) external onlyAuthority {
        require(_ndviScoreScaled >= 6500, "NDVI below regenerative 0.65 threshold");

        totalSupply += _amountTokens;
        balanceOf[_farmer] += _amountTokens;

        offsetBatches.push(CarbonOffsetBatch({
            fieldId: _fieldId,
            ndviScoreScaled: _ndviScoreScaled,
            metricTonsCO2e: _amountTokens / 1e18,
            timestamp: block.timestamp,
            verificationEvidenceUrl: _evidenceUrl
        }));

        emit CarbonCreditsMinted(_farmer, _amountTokens, _fieldId, _ndviScoreScaled);
        emit Transfer(address(0), _farmer, _amountTokens);
    }

    /**
     * @notice Burn credits to offset organizational carbon footprint.
     */
    function retireCredits(uint256 _amountTokens, string memory _reason) external {
        require(balanceOf[msg.sender] >= _amountTokens, "Insufficient credits to retire");
        balanceOf[msg.sender] -= _amountTokens;
        totalSupply -= _amountTokens;
        emit CarbonCreditsRetired(msg.sender, _amountTokens, _reason);
        emit Transfer(msg.sender, address(0), _amountTokens);
    }
}
