# PREVDL SDK

Privacy-Preserving Data Leak Prevention SDK for ad targeting with Aztec Network.

## 🎯 Features

- **Privacy-First**: User data never leaves device, only ZK proofs
- **Private Matching**: Ad compatibility checked without revealing personal data
- **Local Mode**: Development with mocked data (no blockchain needed)
- **Devnet Mode**: Connect to Aztec Devnet contracts
- **TypeScript**: Full type safety

## 📦 Installation

```bash
cd packages/sdk
yarn install
```

## 🚀 Quick Start

### Local Mode (Mocked Data)

```typescript
import { PrevDLSDK, LOCAL_CONFIG, UserProfile, Location, Profession, Interest } from '@prevdl/sdk';

// Initialize SDK in local mode
const sdk = new PrevDLSDK(LOCAL_CONFIG);

// Create user profile (PRIVATE DATA)
const userProfile: UserProfile = {
  age: 28,
  location: Location.SAO_PAULO,
  profession: Profession.SOFTWARE_ENGINEER,
  interests: [Interest.TECH, Interest.CRYPTO, Interest.TRAVEL]
};

// Get matching ads (private matching)
const matchingAds = await sdk.getMatchingAds(userProfile);

console.log(`Found ${matchingAds.length} matching ads`);
```

### Run Examples

```bash
# Local mode (with mocks)
yarn example:local

# Devnet mode (requires deployed contracts)
yarn example:devnet
```

## 📚 Documentation

### SDK Modes

#### LOCAL Mode
- Uses mocked data
- No blockchain connection needed
- Perfect for development and testing
- Fast iteration

#### DEVNET Mode
- Connects to Aztec Devnet
- Real ZK proofs
- Real privacy guarantees
- Requires deployed contracts

### User Profile Structure

```typescript
interface UserProfile {
  age: number;                // User's age (private)
  location: Location;         // Location enum (private)
  profession: Profession;     // Profession enum (private)
  interests: Interest[];      // Up to 3 interests (private)
  gender?: Gender;            // Optional gender (private)
}
```

### Available Filters

**Location:**
- SAO_PAULO, RIO_DE_JANEIRO, BRASILIA, BELO_HORIZONTE, etc.
- ANY (matches all locations)

**Profession:**
- SOFTWARE_ENGINEER, DESIGNER, PRODUCT_MANAGER, MARKETING, etc.
- ANY (matches all professions)

**Interest:**
- TECH, CRYPTO, GAMING, SPORTS, FASHION, TRAVEL, FOOD, MUSIC, ART, BUSINESS

**Gender:**
- MALE, FEMALE, OTHER, ANY (optional filter)

### SDK Methods

#### User Functions (World MiniApp)

```typescript
// Get ads that match user profile
const ads = await sdk.getMatchingAds(userProfile);

// Check specific ad match with details
const matchResult = await sdk.checkAdMatch(userProfile, adId);

// Record ad impression
await sdk.recordImpression(adId, userProfile);

// Record ad click
await sdk.recordClick(adId);
```

#### Admin Functions (Next.js Dashboard)

```typescript
// Get all active ads
const allAds = await sdk.getAllAds();

// Get campaign statistics
const stats = await sdk.getCampaignStats(adId);
// Returns: { impressions, clicks, matches, matchRate, ctr }

// Create new campaign
const campaignId = await sdk.createCampaign({
  title: 'My Campaign',
  description: 'Campaign description',
  ctaUrl: 'https://example.com',
  targetAgeMin: 25,
  targetAgeMax: 35,
  targetLocation: Location.SAO_PAULO,
  targetProfession: Profession.SOFTWARE_ENGINEER,
  targetInterest: Interest.TECH,
  budgetUSDC: 1000,
  bidPerImpression: 0.02,
  bidPerClick: 0.30
});
```

## 🧪 Mocked Data

The SDK includes 6 mocked ads and 5 user profiles for testing:

### Mock Ads
1. **Blockchain Course** - Targets devs interested in crypto
2. **Design Bootcamp** - Targets designers in Rio
3. **Startup Weekend** - Targets entrepreneurs in SP
4. **Gaming Tournament** - Targets students interested in gaming
5. **Remote Jobs** - Targets devs (any location)
6. **Fashion Week** - Targets fashion enthusiasts in Rio

### Mock Users
- `developer`: 28yo, SP, Software Engineer, Tech/Crypto
- `designer`: 26yo, RJ, Designer, Fashion/Art
- `student`: 22yo, Brasilia, Student, Tech/Gaming
- `entrepreneur`: 35yo, SP, Entrepreneur, Business/Tech
- `freelancer`: 30yo, Porto Alegre, Freelancer, Tech/Food

## 🔧 Development Workflow

### 1. Start with Local Mode

```bash
# Run local example
yarn example:local
```

This will:
- Initialize SDK with mocked data
- Show all available ads
- Test matching with different user profiles
- Simulate impressions and clicks
- Display campaign stats

### 2. Deploy to Devnet

```bash
# Deploy Aztec contracts
cd ../aztec/contracts
yarn compile
yarn codegen
yarn deploy-prevdl::devnet

# Note the contract addresses from output
```

### 3. Configure Devnet

```bash
# Set environment variables
export AD_TARGETING_ADDRESS=0x...
export AD_AUCTION_ADDRESS=0x...
export PREVDL_MODE=devnet
```

### 4. Test on Devnet

```bash
# Run devnet example
yarn example:devnet
```

## 🏗️ Integration Examples

### World MiniApp (User Side)

```typescript
import { PrevDLSDK, DEVNET_CONFIG } from '@prevdl/sdk';

// Initialize with Aztec wallet
const sdk = new PrevDLSDK(DEVNET_CONFIG, aztecWallet);

// User creates profile (stays private)
const userProfile = {
  age: await getUserAge(),
  location: await getUserLocation(),
  profession: await getUserProfession(),
  interests: await getUserInterests()
};

// Get matching ads (ZK proof on Aztec)
const matchingAds = await sdk.getMatchingAds(userProfile);

// Show ads to user
displayAds(matchingAds);
```

### Next.js Admin (Advertiser Side)

```typescript
import { PrevDLSDK, DEVNET_CONFIG } from '@prevdl/sdk';

// Initialize SDK
const sdk = new PrevDLSDK(DEVNET_CONFIG, aztecWallet);

// Create campaign
const campaignId = await sdk.createCampaign({
  title: formData.title,
  description: formData.description,
  ctaUrl: formData.ctaUrl,
  targetAgeMin: formData.ageMin,
  targetAgeMax: formData.ageMax,
  targetLocation: formData.location,
  targetProfession: formData.profession,
  targetInterest: formData.interest,
  budgetUSDC: formData.budget,
  bidPerImpression: formData.bidImpression,
  bidPerClick: formData.bidClick
});

// Monitor campaign
const stats = await sdk.getCampaignStats(campaignId);
console.log(`Match Rate: ${stats.matchRate}%`);
console.log(`CTR: ${stats.ctr}%`);
```

## 🎭 How Privacy Works

1. **User Profile**: Stored locally, never sent to blockchain
2. **Matching**: ZK proof generated on device
3. **Aztec Contract**: Verifies proof without seeing data
4. **Result**: Only match (yes/no) is public
5. **Advertiser**: Sees aggregated stats, not individual users

### What's Private:
- ✅ User age, location, profession, interests
- ✅ Individual clicks and impressions
- ✅ User identity

### What's Public:
- ❌ Match result (yes/no)
- ❌ Aggregated stats (total impressions, clicks)
- ❌ Campaign parameters (target audience)

## 📁 Project Structure

```
sdk/
├── src/
│   ├── index.ts           # Main exports
│   ├── sdk.ts             # SDK class
│   ├── types/
│   │   └── index.ts       # TypeScript types
│   ├── mocks/
│   │   └── index.ts       # Mocked data
│   └── config.ts          # Configuration
├── examples/
│   ├── local-example.ts   # Local mode example
│   └── devnet-example.ts  # Devnet mode example
├── package.json
└── README.md
```

## 🐛 Troubleshooting

### "Aztec wallet required"
- Make sure you're passing an Aztec wallet when initializing SDK in devnet mode
- For local mode, no wallet is needed

### "Ad not found"
- Check if ad ID exists in mocked data (local mode)
- Verify contract has active campaigns (devnet mode)

### "Devnet mode not implemented"
- Some devnet features are placeholders
- Deploy contracts first (see deployment section)
- Check contract addresses in config

## 🚀 Next Steps

1. ✅ SDK structure created
2. ✅ Mocked data for development
3. ✅ Local mode working
4. ⏳ Deploy Aztec contracts
5. ⏳ Implement devnet integration
6. ⏳ Add Polygon bridge
7. ⏳ Build frontend dashboards

## 📄 License

MIT

