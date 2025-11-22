# PREVDL SDK - Usage Guide

Privacy-Preserving Ad Targeting SDK using Aztec Network

## Installation

```bash
npm install @prevdl/sdk
# or
yarn add @prevdl/sdk
# or
bun add @prevdl/sdk
```

## Quick Start

### React Components (Easiest)

```tsx
import { PrevDLProvider, Ads } from '@prevdl/sdk/components';
import { Location, Profession, Interest } from '@prevdl/sdk';

function App() {
  const userProfile = {
    age: 28,
    location: Location.SAO_PAULO,
    profession: Profession.SOFTWARE_ENGINEER,
    interests: [Interest.TECH, Interest.CRYPTO],
  };

  return (
    <PrevDLProvider
      config={{
        clientId: 'your-client-id',
        environment: 'sandbox',
      }}
    >
      <Ads userProfile={userProfile} maxAds={3} />
    </PrevDLProvider>
  );
}
```

### Core SDK (TypeScript/JavaScript)

```typescript
import { PrevDLAds } from '@prevdl/sdk/core';
import { Location, Profession, Interest } from '@prevdl/sdk';

const prevdlAds = new PrevDLAds({
  clientId: 'your-client-id',
  environment: 'sandbox',
});

await prevdlAds.initialize();

const userProfile = {
  age: 28,
  location: Location.SAO_PAULO,
  profession: Profession.SOFTWARE_ENGINEER,
  interests: [Interest.TECH, Interest.CRYPTO],
};

// Get targeted ads
const ads = await prevdlAds.getTargetedAds(userProfile);
console.log('Matched ads:', ads);
```

## API Reference

### PrevDLAds Class

#### Constructor

```typescript
new PrevDLAds(config: PrevDLAdsConfig)
```

**Config Options:**
- `clientId` (required): Your client ID
- `environment`: 'local' | 'sandbox' | 'devnet' | 'production'
- `aztecNodeUrl`: Custom Aztec node URL
- `adTargetingAddress`: Custom AdTargeting contract address
- `adAuctionAddress`: Custom AdAuction contract address

#### Methods

##### `initialize()`
Initialize the SDK and connect to Aztec

```typescript
await prevdlAds.initialize();
```

##### `getTargetedAds(userProfile)`
Get ads that match the user profile

```typescript
const ads = await prevdlAds.getTargetedAds({
  age: 28,
  location: Location.SAO_PAULO,
  profession: Profession.SOFTWARE_ENGINEER,
  interests: [Interest.TECH, Interest.CRYPTO],
});
```

##### `checkAdMatch(userProfile, adId)`
Check if a specific ad matches the user

```typescript
const result = await prevdlAds.checkAdMatch(userProfile, '1');
console.log(result.isMatch); // true or false
```

##### `getAllAds()`
Get all available ads (public data)

```typescript
const allAds = await prevdlAds.getAllAds();
```

##### `getCampaignStats(adId)`
Get statistics for a campaign

```typescript
const stats = await prevdlAds.getCampaignStats('1');
console.log(stats); // { impressions, clicks, matches, matchRate, ctr }
```

### React Components

#### `<PrevDLProvider>`

Wrap your app with this provider to use the SDK

```tsx
<PrevDLProvider config={{ clientId: 'your-id', environment: 'sandbox' }}>
  {children}
</PrevDLProvider>
```

#### `<Ads>`

Display targeted ads

```tsx
<Ads
  userProfile={userProfile}
  maxAds={3}
  className="my-ads"
  onAdClick={(ad) => console.log('Clicked:', ad)}
  onAdImpression={(ad) => console.log('Impression:', ad)}
  renderAd={(ad) => <CustomAdComponent ad={ad} />}
  devHighlights={true}
/>
```

**Props:**
- `userProfile` (required): User's profile data
- `maxAds`: Maximum number of ads to display (default: 3)
- `className`: CSS class name
- `onAdClick`: Callback when ad is clicked
- `onAdImpression`: Callback when ad is viewed
- `renderAd`: Custom render function
- `devHighlights`: Show dev highlights (default: false)

#### Hooks

##### `usePrevDLAds()`
Get the PrevDLAds instance

```tsx
const prevdlAds = usePrevDLAds();
const ads = await prevdlAds?.getTargetedAds(userProfile);
```

##### `usePrevDLContext()`
Get the full context

```tsx
const { prevdlAds, isInitialized, error } = usePrevDLContext();
```

## User Profile

```typescript
interface UserProfile {
  age: number;
  location: Location;
  profession: Profession;
  interests: Interest[]; // Max 3
  gender?: Gender;
}
```

### Enums

**Location:**
- `SAO_PAULO`, `RIO_DE_JANEIRO`, `BRASILIA`, `BELO_HORIZONTE`, `PORTO_ALEGRE`, etc.

**Profession:**
- `SOFTWARE_ENGINEER`, `DESIGNER`, `PRODUCT_MANAGER`, `MARKETING`, `SALES`, etc.

**Interest:**
- `TECH`, `CRYPTO`, `GAMING`, `SPORTS`, `FASHION`, `TRAVEL`, `FOOD`, `MUSIC`, `ART`, `BUSINESS`

**Gender:**
- `ANY`, `MALE`, `FEMALE`, `OTHER`

## Building the SDK

```bash
# Install dependencies
bun install

# Build the SDK
bun run build

# This will generate the dist/ folder with:
# - dist/index.js (main entry)
# - dist/components/index.js (React components)
# - dist/core/PrevDLAds.js (Core SDK)
# - All TypeScript declarations (.d.ts files)
```

## Development

```bash
# Watch mode
bun run dev

# Run examples
bun run example:sandbox

# Format code
bun run format

# Lint
bun run lint
```

## Privacy Guarantees

✅ **User data never leaves the device**
- Age, location, profession, interests stay private
- Only match result (yes/no) is revealed

✅ **Zero-knowledge proofs**
- Aztec Network ensures privacy
- Advertisers can't see user data

✅ **Transparent targeting**
- Users see why they got an ad
- No hidden tracking

## Examples

See `examples/` folder for complete examples:
- `react-example.tsx` - React component usage
- `sandbox-example.ts` - Sandbox testing
- `local-example.ts` - Local development

## License

MIT

