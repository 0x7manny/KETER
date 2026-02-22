<p align="center">
  <img src="https://img.shields.io/badge/KETER-Protocol-000000?style=for-the-badge&labelColor=000000" alt="Keter Protocol" />
</p>

<h1 align="center">
  <br>
  ⬡ K E T E R
  <br>
</h1>

<p align="center">
  <strong>Privacy-Preserving Compliance for Security Tokens</strong>
</p>

<p align="center">
  <em>Where Zero-Knowledge Meets Regulatory Compliance</em>
</p>

<p align="center">
  <a href="#architecture"><img src="https://img.shields.io/badge/ZK--Proofs-Noir-6E40C9?style=flat-square&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIGQ9Ik0xMiAyTDIgN2wxMCA1IDEwLTV6Ii8+PC9zdmc+" alt="Noir" /></a>
  <a href="#contracts"><img src="https://img.shields.io/badge/Network-Sepolia-3C3C3D?style=flat-square&logo=ethereum&logoColor=white" alt="Sepolia" /></a>
  <a href="#stack"><img src="https://img.shields.io/badge/Frontend-React-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" /></a>
  <a href="#stack"><img src="https://img.shields.io/badge/Proofs-NoirJS-000000?style=flat-square" alt="NoirJS" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="MIT" /></a>
</p>

<p align="center">
  <a href="#-the-problem">Problem</a> •
  <a href="#-how-it-works">How It Works</a> •
  <a href="#%EF%B8%8F-architecture">Architecture</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-deployed-contracts">Contracts</a> •
  <a href="#-team">Team</a>
</p>

---

<br>

## 🔮 The Problem

> **MiCA requires identity verification. GDPR forbids storing it on-chain. Blockchain demands transparency.**

Security tokens under **MiCA** (Markets in Crypto-Assets) regulation must comply with KYC/AML requirements. But storing personal identity data on a public blockchain **violates GDPR**. This creates an impossible trilemma:

```
        ┌─────────────────┐
        │   COMPLIANCE    │  ← MiCA requires investor verification
        │   (KYC/AML)     │
        └────────┬────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
    ▼            ▼            ▼
┌────────┐ ┌─────────┐ ┌──────────┐
│ PRIVACY│ │TRANSPAR- │ │ ON-CHAIN │
│ (GDPR) │ │  ENCY   │ │ IDENTITY │
└────────┘ └─────────┘ └──────────┘
    ✗            ✗            ✗
    
    Traditional approaches fail all three.
```

**Keter solves this.** Using zero-knowledge proofs, investors prove they meet compliance requirements **without revealing any personal data on-chain**.

<br>

## 🧬 How It Works

Keter uses **Noir circuits** compiled and proven directly in the browser via **NoirJS**. No backend. No trusted server. Pure client-side ZK.

```
┌──────────────────────────────────────────────────────────┐
│                      INVESTOR BROWSER                     │
│                                                          │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────┐ │
│  │  KYC Data    │───▶│  Noir Circuit │───▶│  ZK Proof   │ │
│  │  (private)   │    │  (NoirJS)    │    │  (public)   │ │
│  └─────────────┘    └──────────────┘    └──────┬──────┘ │
│                                                 │        │
└─────────────────────────────────────────────────┼────────┘
                                                  │
                                                  ▼
┌──────────────────────────────────────────────────────────┐
│                    ETHEREUM (SEPOLIA)                     │
│                                                          │
│  ┌────────────────┐  ┌───────────────┐  ┌─────────────┐ │
│  │ UltraVerifier  │  │   Registry    │  │ KeterToken  │ │
│  │ (verify proof) │──│ (store root)  │──│ (ERC-20 ST) │ │
│  └────────────────┘  └───────────────┘  └─────────────┘ │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### The Flow

1. **Investor inputs** KYC data (name, age, address, investor type, etc.) in the browser
2. **Noir circuit** hashes the data into a Poseidon Merkle leaf and generates a **ZK proof** of compliance
3. **Proof is submitted** on-chain to the `UltraVerifier` contract
4. **Registry validates** the Merkle root and registers the investor's wallet
5. **KeterToken** (security token) checks the Registry before allowing transfers

> 🔒 **Zero personal data touches the blockchain. Ever.**

<br>

## ⚙️ Architecture

```
keter/
├── circuits/                  # Noir ZK circuits
│   ├── src/
│   │   └── main.nr           # Compliance proof circuit
│   ├── Nargo.toml             # Noir project config
│   └── Prover.toml            # Prover inputs
│
├── contracts/                 # Solidity smart contracts
│   ├── KeterToken.sol         # ERC-20 security token
│   ├── Registry.sol           # Compliance registry
│   └── UltraVerifier.sol      # Auto-generated Noir verifier
│
├── frontend/                  # React frontend (client-side proving)
│   ├── src/
│   │   ├── components/        # UI components
│   │   ├── hooks/             # NoirJS proof generation hooks
│   │   ├── circuits/          # Compiled circuit artifacts
│   │   ├── utils/             # Helpers & contract ABIs
│   │   └── App.tsx            # Main application
│   ├── package.json
│   └── vite.config.ts
│
├── .env.example               # Environment template
└── README.md
```

<br>

## 🛠 Stack

| Layer | Technology | Purpose |
|:------|:-----------|:--------|
| **ZK Circuits** | ![Noir](https://img.shields.io/badge/Noir-1.0_beta-6E40C9?style=flat-square) | Compliance proof generation |
| **Proof Engine** | ![NoirJS](https://img.shields.io/badge/NoirJS-Browser-000000?style=flat-square) | Client-side proof compilation & proving |
| **Smart Contracts** | ![Solidity](https://img.shields.io/badge/Solidity-0.8.x-363636?style=flat-square&logo=solidity) | On-chain verification & token logic |
| **Frontend** | ![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white) | User interface |
| **Styling** | ![TailwindCSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white) | UI framework |
| **Build** | ![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white) | Bundler |
| **Wallet** | ![Ethers](https://img.shields.io/badge/Ethers.js-6-2535A0?style=flat-square&logo=ethereum&logoColor=white) | Wallet connection & tx signing |
| **Network** | ![Sepolia](https://img.shields.io/badge/Sepolia-Testnet-3C3C3D?style=flat-square&logo=ethereum&logoColor=white) | Deployment network |
| **Hash** | ![Poseidon](https://img.shields.io/badge/Poseidon-BN254-purple?style=flat-square) | ZK-friendly hashing (Merkle tree) |

<br>

## 📜 Deployed Contracts

> **Network:** Ethereum Sepolia Testnet

| Contract | Address | Role |
|:---------|:--------|:-----|
| **Registry** | [`0x4FF9F411b531a14Cd91e6ce0418A3C500E1951F9`](https://sepolia.etherscan.io/address/0x4FF9F411b531a14Cd91e6ce0418A3C500E1951F9) | Stores Merkle roots & compliance status |
| **UltraVerifier** | [`0xEC3DE79cF2Dd56a5Ae637E03390e52b557C65f93`](https://sepolia.etherscan.io/address/0xEC3DE79cF2Dd56a5Ae637E03390e52b557C65f93) | Verifies Noir ZK proofs on-chain |
| **KeterToken** | [`0x270463352d42B4B891E0605CAC0f5B9Dd5437cF7`](https://sepolia.etherscan.io/address/0x270463352d42B4B891E0605CAC0f5B9Dd5437cF7) | ERC-20 security token with compliance gates |

<br>

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [Nargo](https://noir-lang.org/docs/getting_started/quick_start) >= 1.0.0-beta
- A browser wallet (MetaMask) connected to Sepolia

### 1. Clone & Install

```bash
git clone https://github.com/your-org/keter.git
cd keter
```

### 2. Setup Environment

```bash
cp .env.example .env
```

### 3. Compile Circuits

```bash
cd circuits
nargo compile
cd ..
```

### 4. Launch Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` and connect your wallet.

<br>

## 🔑 Environment Variables

```bash
# .env.example

# ── Network ──────────────────────────────────────
VITE_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
VITE_CHAIN_ID=11155111

# ── Contracts ────────────────────────────────────
VITE_REGISTRY_ADDRESS=0x4FF9F411b531a14Cd91e6ce0418A3C500E1951F9
VITE_VERIFIER_ADDRESS=0xEC3DE79cF2Dd56a5Ae637E03390e52b557C65f93
VITE_TOKEN_ADDRESS=0x270463352d42B4B891E0605CAC0f5B9Dd5437cF7

# ── Circuit ──────────────────────────────────────
VITE_CIRCUIT_PATH=./circuits/target/keter.json
```

<br>

## 🔐 ZK Circuit

The Noir circuit verifies that an investor:

- **Is of legal age** (≥ 18) without revealing their actual age
- **Resides in an authorized jurisdiction** without revealing their country
- **Is an accredited investor type** without revealing their classification
- **Owns the wallet** submitting the proof

All private inputs are hashed with **Poseidon** into a Merkle tree, and the circuit proves membership against a known root — without exposing any leaf data.

```
┌─────────────────────────────────────────────────┐
│              NOIR CIRCUIT: main()                │
│                                                  │
│  Private Inputs:                                 │
│  ├── name: Field                                 │
│  ├── surname: Field                              │
│  ├── age: Field                                  │
│  ├── address: Field                              │
│  ├── wallet: Field                               │
│  ├── country_code: Field                         │
│  ├── investor_type: Field                        │
│  ├── salt: Field                                 │
│  └── merkle_path: [Field; DEPTH]                 │
│                                                  │
│  Public Inputs:                                  │
│  ├── merkle_root: Field                          │
│  └── min_age: Field                              │
│                                                  │
│  Constraints:                                    │
│  ├── assert(age >= min_age)                      │
│  ├── assert(country ∈ authorized_set)            │
│  ├── assert(investor_type ∈ valid_types)         │
│  └── assert(merkle_verify(leaf, path, root))     │
│                                                  │
└─────────────────────────────────────────────────┘
```

<br>

## 🤖 AI-Powered KYC Module

> ⚠️ **Status: Not Implemented Yet**

A planned module leveraging AI for automated KYC document verification. The AI model will:

- Extract identity fields from uploaded documents (passport, ID)
- Validate document authenticity
- Feed verified data directly into the Noir circuit for proof generation

All processing will remain **client-side** to maintain the zero-trust architecture.

<br>

## 🏛 Regulatory Context

| Regulation | Requirement | Keter Solution |
|:-----------|:------------|:---------------|
| **MiCA** | KYC/AML for crypto-asset transfers | ZK proof of identity compliance |
| **GDPR Art. 17** | Right to erasure of personal data | No personal data stored on-chain |
| **GDPR Art. 25** | Data protection by design | Privacy-first ZK architecture |
| **MiFID II** | Investor categorization | ZK proof of investor type |

<br>

## 👥 Team

<table>
  <tr>
    <td align="center" width="200">
      <strong>0x7manny</strong><br>
      <sub>Smart Contract Engineer</sub><br>
      <img src="https://img.shields.io/badge/Solidity-EVM-363636?style=flat-square&logo=solidity" />
    </td>
    <td align="center" width="200">
      <strong>0x11semprez</strong><br>
      <sub>ZK Engineer</sub><br>
      <img src="https://img.shields.io/badge/Noir-Circuits-6E40C9?style=flat-square" />
    </td>
    <td align="center" width="200">
      <strong>Kamil</strong><br>
      <sub>AI / KYC Module</sub><br>
      <img src="https://img.shields.io/badge/AI-KYC-FF6F00?style=flat-square" />
    </td>
    <td align="center" width="200">
      <strong>keuchnotkush</strong><br>
      <sub>Security</sub><br>
      <img src="https://img.shields.io/badge/Security-Audit-DC143C?style=flat-square" />
    </td>
  </tr>
</table>

<br>

## 🏆 Hackathon

<p align="center">
  <img src="https://img.shields.io/badge/Hackin'dau_2026-Paris_Dauphine-003366?style=for-the-badge" alt="Hackindau" />
  <br>
  <em>Built in 48 hours — February 20-22, 2026</em>
</p>

<br>

---

<p align="center">
  <sub>Built with obsession for privacy and compliance.</sub><br>
  <sub>Keter Protocol — Because privacy is not a feature, it's a right.</sub>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/⬡-KETER-000000?style=flat-square" />
</p>
