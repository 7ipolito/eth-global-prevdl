/**
 * PREVDL SDK - Privacy-Preserving Data Leak Prevention
 * Ad targeting with privacy using Aztec Network
 */

export const SDK_VERSION = '1.0.0';

// Main SDK class
export { PrevDLSDK } from './sdk';

// Core class (simplified API)
export { PrevDLAds } from './core/PrevDLAds';

// React Components
export * from './components';

// Types
export * from './types';

// Mocks (for development)
export * from './mocks';

// Config
export { getConfig, LOCAL_CONFIG, SANDBOX_CONFIG, DEVNET_CONFIG } from './config';
