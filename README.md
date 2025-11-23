# PrevDL - Privacy-Preserving Ad Targeting Platform

**PrevDL** (Privacy-Preserving Data Leak Prevention) is a revolutionary ad targeting platform that enables personalized advertising without compromising user privacy. Built on **Oasis Sapphire's Trusted Execution Environment (TEE)**, PrevDL ensures that sensitive user data never leaves the secure enclave, making it the first truly privacy-compliant ad targeting solution.

## 🎯 The Problem We Solve

Traditional ad targeting platforms face three critical challenges:

1. **User Privacy Concerns**: Users are increasingly aware that their personal data is being collected, stored, and analyzed by third parties without their control.

2. **Regulatory Compliance**: Regulations like GDPR (Europe) and LGPD (Brazil) require strict data protection measures, making traditional ad targeting legally risky and expensive to implement.

3. **Data Leakage**: Even with encryption in transit and at rest, data processing on regular servers exposes sensitive information to potential breaches, insider threats, and unauthorized access.

**PrevDL solves all three problems simultaneously** by leveraging Trusted Execution Environments (TEE) to process user data in a secure, isolated environment where data cannot be accessed, even by the platform operators.

## 🔐 How It Works: Trusted Execution Environment (TEE)

### The Secure Enclave Architecture

PrevDL runs on **Oasis Sapphire's ROFL (Runtime Off-chain Logic)** infrastructure, which executes code inside a **Trusted Execution Environment (TEE)**. Unlike traditional servers where data can be accessed by administrators or compromised through attacks, TEEs provide:

- **Hardware-Level Isolation**: Data is processed in a secure enclave that is cryptographically isolated from the host system
- **Zero-Knowledge Processing**: Matching logic executes without exposing user profiles or campaign targeting criteria
- **Confidential Computing**: All conditional operations (age matching, location matching, etc.) happen inside the TEE, ensuring no data leakage

### The Privacy-Preserving Matching Process

```
1. User Profile (Encrypted) → TEE
   ├─ Age: 30
   ├─ Location: BRASILIA
   ├─ Profession: SOFTWARE_ENGINEER
   └─ Interests: TECH, TRAVEL, SPORTS

2. Campaign Targeting (Encrypted) → TEE
   ├─ Target Age: 25-35
   ├─ Target Location: BRASILIA
   ├─ Target Profession: SOFTWARE_ENGINEER
   └─ Target Interest: TECH

3. Matching Logic (Inside TEE) → ✅ MATCH
   └─ All comparisons happen in encrypted form
   └─ Only the result (match/no match) is revealed
   └─ User data NEVER leaves the secure enclave
```

### Why TEE is Essential

Traditional ad targeting platforms process data on regular servers where:
- ❌ System administrators can access user data
- ❌ Data is vulnerable to breaches and attacks
- ❌ Compliance requires expensive audits and certifications
- ❌ Users have no guarantee their data won't be misused

With PrevDL's TEE-based architecture:
- ✅ **No one can access user data** - not even platform operators
- ✅ **Hardware-level security** - cryptographic isolation from the host
- ✅ **GDPR/LGPD compliant by design** - data is processed in a secure enclave
- ✅ **Zero data leakage** - matching happens without exposing sensitive information

## 🚀 Key Features

### Privacy-First Architecture
- **Encrypted User Profiles**: User data is encrypted before transmission and remains encrypted during processing
- **Private Matching**: Ad compatibility is checked without revealing personal information
- **Confidential Analytics**: Only aggregated statistics are public; individual user data stays private

### Regulatory Compliance
- **GDPR Compliant**: Data processing in TEE ensures compliance with European data protection regulations
- **LGPD Compliant**: Meets Brazilian data protection law requirements
- **Zero-Knowledge Processing**: Platform operators cannot access user data, even if required by law

### Advanced Capabilities
- **AI Agent Integration**: Intelligent agents can verify exclusive offers for users without accessing their private data, enabling personalized experiences while maintaining privacy
- **Real-Time Matching**: Fast, efficient matching without compromising security
- **Campaign Management**: Full-featured dashboard for advertisers to create and manage targeted campaigns

## 🏗️ Project Structure

```
eth-global-prevdl/
├── packages/
│   ├── oasis/              # Oasis Sapphire smart contracts
│   │   ├── src/
│   │   │   ├── PrevDLAds.sol    # Main contract with TEE-based matching
│   │   │   ├── Types.sol         # Type definitions and enums
│   │   │   └── ISapphire.sol    # Sapphire TEE interface
│   │   └── test/                # Foundry tests
│   │
│   └── sdk/                 # TypeScript SDK
│       ├── src/
│       │   ├── core/            # Core SDK logic
│       │   │   ├── PrevDLAds.ts      # Main SDK class
│       │   │   └── OasisAdapter.ts   # Oasis Sapphire integration
│       │   ├── components/        # React components
│       │   │   └── Ads.tsx           # Ad display component
│       │   └── types/            # TypeScript type definitions
│       └── examples/             # Example applications
│
└── README.md
```

## 🛠️ Tech Stack

### Smart Contracts
- **Solidity 0.8.24**: Smart contract language
- **Oasis Sapphire**: Confidential blockchain with TEE support
- **Foundry**: Development framework for testing and deployment

### SDK & Frontend
- **TypeScript**: Type-safe SDK and React components
- **React**: UI components for ad display
- **Ethers.js**: Blockchain interaction
- **Web Crypto API**: Client-side encryption

## 📦 Installation

### Prerequisites
- Node.js >= 20.18.0
- Bun >= 1.1.38 (or npm/yarn)

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd eth-global-prevdl

# Install dependencies
bun install

# Set up environment variables
cd packages/sdk
cp .env.example .env
```

Update `.env` with your Oasis Sapphire configuration:
```env
PRIVATE_KEY=your_private_key
VITE_PRIVATE_KEY=your_private_key
```

## 🚀 Quick Start

### 1. Deploy Smart Contracts

```bash
cd packages/oasis
make deploy-testnet
```

### 2. Initialize SDK

```typescript
import { PrevDLAds } from '@prevdl/sdk';
import { ethers } from 'ethers';

const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const sdk = new PrevDLAds({
  clientId: 'my-app',
  environment: 'sandbox',
  oasis: {
    contractAddress: '0x...',
    rpcUrl: 'https://testnet.sapphire.oasis.io',
    wallet: wallet,
    requireEncryption: true,
  },
});

await sdk.initialize();
```

### 3. Create User Profile

```typescript
const userProfile = {
  age: 30,
  location: Location.BRASILIA,
  profession: Profession.SOFTWARE_ENGINEER,
  interests: [Interest.TECH, Interest.TRAVEL, Interest.SPORTS],
  gender: Gender.ANY,
};

await sdk.setUserProfile(userProfile, userAddress);
```

### 4. Get Targeted Ads

```typescript
const ads = await sdk.getTargetedAds(userProfile, userAddress);
```

### 5. Display Ads in React

```tsx
import { Ads } from '@prevdl/sdk/components';

<Ads
  userProfile={userProfile}
  maxAds={3}
  onAdClick={(ad) => console.log('Ad clicked:', ad.id)}
  onAdImpression={(ad) => console.log('Ad viewed:', ad.id)}
/>
```

## 🧪 Testing

### Run Smart Contract Tests

```bash
cd packages/oasis
forge test
```

### Run SDK Tests

```bash
cd packages/sdk
bun test
```

### Test the React Example

```bash
cd packages/sdk/examples/react-app-example
bun dev
```

## 📊 How Matching Works (Technical Deep Dive)

### The TEE Matching Process

1. **User Profile Encryption**: User data is encrypted using AES-256-GCM with a key derived from the user's wallet address
2. **Encrypted Transmission**: Encrypted profile is sent to the Oasis Sapphire contract
3. **TEE Processing**: Inside the TEE:
   - User profile is decrypted (only inside the secure enclave)
   - Campaign targeting criteria are loaded
   - Matching logic executes:
     - Age range check: `userAge >= targetAgeMin && userAge <= targetAgeMax`
     - Location match: `userLocation == targetLocation || targetLocation == ANY`
     - Profession match: `userProfession == targetProfession || targetProfession == ANY`
     - Interest match: `userInterests.contains(targetInterest) || targetInterest == NONE`
     - Gender match: `userGender == targetGender || targetGender == ANY`
   - Only the boolean result (match/no match) is returned
4. **Result**: User receives matching ads without exposing their profile

### Security Guarantees

- ✅ **User profiles are never exposed** - only match results are revealed
- ✅ **Campaign targeting is private** - advertisers can't see other campaigns' criteria
- ✅ **Matching logic is confidential** - executed inside TEE, not on regular servers
- ✅ **No data leakage** - even platform operators cannot access user data

## 🔒 Privacy & Compliance

### GDPR Compliance

PrevDL is GDPR-compliant by design:
- **Data Minimization**: Only necessary data is collected
- **Purpose Limitation**: Data is used only for ad matching
- **Storage Limitation**: Data is encrypted and stored securely
- **Confidentiality**: Data processing happens in TEE, ensuring confidentiality
- **User Rights**: Users can update or delete their profiles at any time

### LGPD Compliance

PrevDL meets Brazilian LGPD requirements:
- **Anonymization**: User data is encrypted and processed in TEE
- **Consent**: Users explicitly consent to data processing
- **Transparency**: Clear information about data usage
- **Security**: Hardware-level protection through TEE

## 🤖 AI Agent Integration

PrevDL enables AI agents to provide personalized experiences without accessing private data. Agents can:
- Verify exclusive offers for specific user segments
- Recommend relevant campaigns based on aggregated patterns
- Optimize campaign targeting using privacy-preserving analytics

All agent interactions happen through the TEE, ensuring that user data remains confidential while still enabling intelligent personalization.

## 📈 Use Cases

- **E-commerce**: Target users based on location, age, and interests without collecting personal data
- **SaaS Platforms**: Show relevant product updates to specific user segments
- **Content Platforms**: Display personalized content recommendations
- **Financial Services**: Target financial products to qualified users while maintaining privacy

## 🛣️ Roadmap

- [ ] Multi-chain support
- [ ] Advanced analytics dashboard
- [ ] AI-powered campaign optimization
- [ ] Mobile SDK
- [ ] Integration with major ad networks

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests.

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- **Contract Address (Oasis Sapphire Testnet)**: https://explorer.oasis.io/testnet/sapphire/address/0x8a7d416E2fb2EEdC3a547Cadb3F21dD0dcFF19e0
- **Demo Video**: [Link to demo video]
- **Live Demo**: [Link to live application]
- **Documentation**: [Link to full documentation]
- **Oasis Sapphire**: https://docs.oasis.io/dapp/sapphire/

## 🙏 Acknowledgments

Built for ETH Global LATAM using Oasis Sapphire's ROFL infrastructure and Trusted Execution Environment technology.

---

**PrevDL**: Privacy-Preserving Ad Targeting. No Data Leaks. Full Compliance. 🛡️
