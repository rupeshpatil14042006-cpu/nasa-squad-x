// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AgriSmartLedger
 * @notice Immutable farm registration, IoT sensor verification, and harvest provenance.
 * Built for NASA Space Apps & precision agronomy hackathons.
 */
contract AgriSmartLedger {
    address public immutable owner;

    struct HarvestCertification {
        bytes32 batchHash;
        string fieldId;
        string cropName;
        int256 lat;          // Scaled by 1e4
        int256 lon;          // Scaled by 1e4
        uint256 ndviScore;   // Scaled by 1e4 (e.g. 7400 = 0.74)
        uint256 yieldKg;
        uint256 timestamp;
        address farmer;
        address certifyingInspector;
        bool verified;
    }

    struct SensorTelemetry {
        uint256 timestamp;
        uint256 soilMoisturePct;
        uint256 soilPhScaled; // e.g. 650 = 6.5
        int256 temperatureC;
        bytes32 rawDataHash;
    }

    mapping(bytes32 => HarvestCertification) public certifications;
    mapping(string => SensorTelemetry[]) public fieldTelemetryLogs;
    mapping(address => bool) public authorizedInspectors;

    event HarvestBatchCertified(bytes32 indexed batchHash, string fieldId, string cropName, address indexed farmer);
    event TelemetryCommitted(string indexed fieldId, bytes32 rawDataHash, uint256 timestamp);
    event InspectorAuthorized(address indexed inspector);

    modifier onlyOwner() {
        require(msg.sender == owner, "Unauthorized: Only contract owner");
        _;
    }

    modifier onlyInspector() {
        require(authorizedInspectors[msg.sender] || msg.sender == owner, "Unauthorized: Must be certified inspector");
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedInspectors[msg.sender] = true;
    }

    function authorizeInspector(address _inspector) external onlyOwner {
        authorizedInspectors[_inspector] = true;
        emit InspectorAuthorized(_inspector);
    }

    /**
     * @notice Commits an immutable harvest provenance certification with satellite NDVI validation.
     */
    function certifyHarvest(
        string memory _fieldId,
        string memory _cropName,
        int256 _lat,
        int256 _lon,
        uint256 _ndviScore,
        uint256 _yieldKg,
        address _farmer
    ) external onlyInspector returns (bytes32) {
        bytes32 batchHash = keccak256(
            abi.encodePacked(
                _fieldId,
                _cropName,
                _lat,
                _lon,
                _ndviScore,
                _yieldKg,
                block.timestamp,
                _farmer
            )
        );

        certifications[batchHash] = HarvestCertification({
            batchHash: batchHash,
            fieldId: _fieldId,
            cropName: _cropName,
            lat: _lat,
            lon: _lon,
            ndviScore: _ndviScore,
            yieldKg: _yieldKg,
            timestamp: block.timestamp,
            farmer: _farmer,
            certifyingInspector: msg.sender,
            verified: true
        });

        emit HarvestBatchCertified(batchHash, _fieldId, _cropName, _farmer);
        return batchHash;
    }

    /**
     * @notice Stores a cryptographically hashed sensor reading for tamper detection.
     */
    function recordTelemetry(
        string memory _fieldId,
        uint256 _soilMoisturePct,
        uint256 _soilPhScaled,
        int256 _temperatureC,
        bytes32 _rawDataHash
    ) external {
        fieldTelemetryLogs[_fieldId].push(SensorTelemetry({
            timestamp: block.timestamp,
            soilMoisturePct: _soilMoisturePct,
            soilPhScaled: _soilPhScaled,
            temperatureC: _temperatureC,
            rawDataHash: _rawDataHash
        }));

        emit TelemetryCommitted(_fieldId, _rawDataHash, block.timestamp);
    }

    function getTelemetryCount(string memory _fieldId) external view returns (uint256) {
        return fieldTelemetryLogs[_fieldId].length;
    }
}
