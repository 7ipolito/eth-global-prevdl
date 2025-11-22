# ETH LATAM ADSZK

A Turborepo monorepo for ETH LATAM ADSZK project.

## Project Structure

```
eth-latam-adszk/
├── apps/
│   └── client-example/          # Next.js app with Tailwind CSS v4 & shadcn/ui
├── packages/
│   ├── contracts/               # Smart contracts package
│   └── sdk/                     # TypeScript SDK package
└── turbo.json                   # Turborepo configuration
```

## Tech Stack

### Apps
- **client-example**: Next.js 15 + React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui

### Packages
- **contracts**: FHEVM smart contracts with Hardhat (Zama template)
- **sdk**: TypeScript SDK

### Tooling
- **Bun**: Package manager and runtime
- **Turborepo**: Monorepo management
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Type safety

## Getting Started

### Prerequisites
- Node.js >= 20.18.0 (see `.nvmrc`)
- Bun >= 1.1.38

### Installation

```bash
bun install
```

### Environment Variables

**Client App (apps/client-example):**

Copy the example environment file:
```bash
cd apps/client-example
cp .env.example .env.local
```

Update `.env.local` with your Privy credentials:
```
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
NEXT_PUBLIC_PRIVY_CLIENT_ID=your_privy_client_id
```

### Development

Run all apps in development mode:
```bash
bun dev
```

Run specific app:
```bash
cd apps/client-example
bun dev
```

### Building

Build all apps and packages:
```bash
bun build
```

### Linting

Lint all apps and packages:
```bash
bun lint
```

### Formatting

Format all code:
```bash
bun format
```

## Adding shadcn/ui Components

To add shadcn/ui components to the client-example app:

```bash
cd apps/client-example
bunx shadcn@latest add button
```

## Smart Contracts (FHEVM)

The contracts package uses Zama's FHEVM (Fully Homomorphic Encryption Virtual Machine) for privacy-preserving smart contracts.

### Compile Contracts
```bash
cd packages/contracts
bun run compile
```

### Test Contracts
```bash
cd packages/contracts
bun run test
```

### Deploy to Localhost
```bash
# Start local FHEVM node
cd packages/contracts
bun run chain

# In another terminal, deploy
cd packages/contracts
bun run deploy:localhost
```

### Example Contract

The template includes `FHECounter.sol` - a simple encrypted counter demonstrating:
- Encrypted state variables (`euint32`)
- Encrypted arithmetic operations (`FHE.add`, `FHE.sub`)
- Access control for encrypted data

### Hardhat Environment Variables

Set up your Hardhat environment:
```bash
cd packages/contracts
npx hardhat vars set MNEMONIC
npx hardhat vars set INFURA_API_KEY
npx hardhat vars set ETHERSCAN_API_KEY  # Optional
```

## Workspace Structure

This monorepo uses Bun workspaces. Each app and package can be referenced by other workspaces:

```json
{
  "dependencies": {
    "@eth-latam-adszk/contracts": "workspace:*",
    "@eth-latam-adszk/sdk": "workspace:*"
  }
}
```