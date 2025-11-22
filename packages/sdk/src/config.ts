/**
 * SDK Configuration
 */

import { SDKConfig } from './types';

export const LOCAL_CONFIG: SDKConfig = {
  mode: 'local',
  // Local mode uses mocks, no need for actual contracts
};

// Load deployed addresses synchronously (at module load time)
let loadedAdTargeting = '';
let loadedAdAuction = '';

try {
  const fs = require('fs');
  const path = require('path');
  
  // Try multiple possible paths to find deployed.json
  const cwd = process.cwd();
  const possiblePaths = [
    // From SDK directory (packages/sdk) - go up one level then to aztec
    path.resolve(cwd, '../aztec/contracts/config/deployed.json'),
    // From project root (if running from root)
    path.resolve(cwd, 'packages/aztec/contracts/config/deployed.json'),
  ];
  
  for (const deployedPath of possiblePaths) {
    if (fs.existsSync(deployedPath)) {
      const deployed = JSON.parse(fs.readFileSync(deployedPath, 'utf-8'));
      loadedAdTargeting = deployed.contracts?.adTargeting || '';
      loadedAdAuction = deployed.contracts?.adAuction || '';
      if (loadedAdTargeting || loadedAdAuction) {
        // Log will appear when module is loaded
        process.nextTick(() => {
          console.log(`📋 Loaded contract addresses from deployed.json`);
          console.log(`   AdTargeting: ${loadedAdTargeting.substring(0, 20)}...`);
          console.log(`   AdAuction: ${loadedAdAuction.substring(0, 20)}...`);
        });
        break;
      }
    }
  }
} catch (error) {
  // Silently fail - will use env vars or empty string
}

export const SANDBOX_CONFIG: SDKConfig = {
  mode: 'sandbox', // Sandbox is local development environment
  aztecNodeUrl: process.env.AZTEC_NODE_URL || 'http://localhost:8080',
  contracts: {
    // These will be filled after deployment to sandbox
    // Priority: env vars > deployed.json > empty string
    adTargeting: process.env.AD_TARGETING_ADDRESS || loadedAdTargeting || '',
    adAuction: process.env.AD_AUCTION_ADDRESS || loadedAdAuction || ''
  }
};

/**
 * Helper function to load deployed addresses from deployed.json
 * Uses require() for synchronous file reading at module load time
 */
function loadDeployedAddress(contractName: 'adTargeting' | 'adAuction'): string {
  try {
    // Use require for synchronous access (works in ES modules too)
    const fs = require('fs');
    const path = require('path');
    
    // Try multiple possible paths
    const possiblePaths = [
      path.resolve(process.cwd(), 'packages/aztec/contracts/config/deployed.json'),
      path.resolve(__dirname, '../../aztec/contracts/config/deployed.json'),
      path.resolve(process.cwd(), '../aztec/contracts/config/deployed.json'),
    ];
    
    for (const deployedPath of possiblePaths) {
      if (fs.existsSync(deployedPath)) {
        const deployed = JSON.parse(fs.readFileSync(deployedPath, 'utf-8'));
        const address = deployed.contracts?.[contractName];
        if (address) {
          return address;
        }
      }
    }
  } catch (error) {
    // Silently fail - will use env vars or empty string
  }
  return '';
}

export const DEVNET_CONFIG: SDKConfig = {
  mode: 'devnet',
  aztecNodeUrl: process.env.AZTEC_NODE_URL || 'https://devnet.aztec-labs.com/',
  contracts: {
    // These will be filled after deployment
    adTargeting: process.env.AD_TARGETING_ADDRESS || '',
    adAuction: process.env.AD_AUCTION_ADDRESS || ''
  }
};

/**
 * Get config based on environment
 */
export function getConfig(): SDKConfig {
  const mode = process.env.PREVDL_MODE || 'local';
  
  if (mode === 'sandbox') {
    return SANDBOX_CONFIG;
  }
  
  if (mode === 'devnet') {
    return DEVNET_CONFIG;
  }
  
  return LOCAL_CONFIG;
}

