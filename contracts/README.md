# AgriSmart Smart Contracts (Web3 & Ethereum EVM)

This directory contains production-ready Solidity smart contracts designed for **NASA Space Apps Challenge** & precision agriculture hackathons.

## 📜 Contract Manifest

| Contract | Purpose | Standard / Type | Key Triggers |
|---|---|---|---|
| `AgriSmartLedger.sol` | Decentralized Farm Provenance & Harvest Traceability | Proprietary Registry | Merkle batch commits, GPS & NDVI pinning |
| `ParametricCropInsurance.sol` | Decentralized Climate Disaster Protection | Escrow & Oracle Pool | NASA POWER dry spell (>14d) / rain deficit (>40%) |
| `AgriCarbonCredit.sol` | Regenerative Agriculture Carbon Credits | ERC-20 Standard (`AGRI-CARBON`) | Satellite MRV verification (NDVI ≥ 0.65) |

---

## 🛠️ Compilation & Local Deployment

### Using Foundry
```bash
forge build
forge test
```

### Using Hardhat
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat compile
npx hardhat test
```

### Using Remix IDE
1. Open [https://remix.ethereum.org](https://remix.ethereum.org).
2. Upload `AgriSmartLedger.sol`, `ParametricCropInsurance.sol`, and `AgriCarbonCredit.sol`.
3. Select Compiler `0.8.20`.
4. Deploy to Sepolia Testnet or local Remix VM.

---

## 🔒 Security Architecture
- **Reentrancy Protection**: Safe pattern state changes before external calls.
- **Access Control**: Role-based modifiers (`onlyOwner`, `onlyInspector`, `onlyOracle`).
- **Cryptographic Merkle Proofs**: On-chain root verification of off-chain NASA observations.
