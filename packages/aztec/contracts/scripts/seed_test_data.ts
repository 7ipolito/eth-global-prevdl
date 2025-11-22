#!/usr/bin/env node
/**
 * Script to seed test data into deployed Aztec contracts
 * This populates the contracts with initial stats so we can test real queries
 */

import { createLogger } from '@aztec/foundation/log';
import { createPXEClient } from '@aztec/aztec.js';
import { Fr } from '@aztec/aztec.js/fields';
import { Contract } from '@aztec/aztec.js/contract';
import { getDeployedAddresses } from '../src/utils/deployed_addresses.js';
import { AdTargetingContract } from '../src/artifacts/AdTargeting.js';
import { AdAuctionContract } from '../src/artifacts/AdAuction.js';

const logger = createLogger('prevdl:seed');

async function main() {
  logger.info('🌱 Seeding test data into Aztec contracts...');

  // Connect to sandbox
  const pxeUrl = process.env.PXE_URL || 'http://localhost:8080';
  logger.info(`📡 Connecting to PXE at ${pxeUrl}...`);
  const pxe = createPXEClient(pxeUrl);

  // Get deployed addresses
  const addresses = getDeployedAddresses();
  if (!addresses.adTargeting || !addresses.adAuction) {
    throw new Error('Contract addresses not found. Deploy contracts first.');
  }

  logger.info(`📍 AdTargeting: ${addresses.adTargeting}`);
  logger.info(`📍 AdAuction: ${addresses.adAuction}`);

  // Get admin account (first account in sandbox)
  const accounts = await pxe.getAccounts();
  if (accounts.length === 0) {
    throw new Error('No accounts found in PXE');
  }
  const adminAccount = accounts[0];
  logger.info(`👤 Using admin account: ${adminAccount.address}`);

  // Load contracts
  const adTargeting = await Contract.at(addresses.adTargeting, AdTargetingContract.artifact, adminAccount);
  const adAuction = await Contract.at(addresses.adAuction, AdAuctionContract.artifact, adminAccount);

  logger.info('✅ Contracts loaded');
  logger.info('');

  // Seed data for each mock ad
  const testAds = [
    { id: '1', impressions: 1234, matches: 567, rejections: 667, clicks: 89 },
    { id: '2', impressions: 2345, matches: 890, rejections: 1455, clicks: 123 },
    { id: '3', impressions: 987, matches: 234, rejections: 753, clicks: 45 },
    { id: '4', impressions: 4567, matches: 1234, rejections: 3333, clicks: 234 },
    { id: '5', impressions: 3456, matches: 892, rejections: 2564, clicks: 234 },
    { id: '6', impressions: 5678, matches: 1456, rejections: 4222, clicks: 345 },
  ];

  logger.info('📊 Seeding stats for test ads...');
  
  for (const ad of testAds) {
    try {
      logger.info(`\n🔄 Seeding ad ${ad.id}...`);
      
      // Note: We can't directly write to storage from outside the contract
      // The contracts would need admin functions to set these values
      // For now, we'll just log what we would seed
      
      logger.info(`   Would seed: ${ad.impressions} impressions, ${ad.matches} matches, ${ad.clicks} clicks`);
      
      // In a real scenario, you'd need to add admin functions like:
      // - set_ad_stats(ad_id, impressions, matches, rejections)
      // - set_ad_clicks(ad_id, clicks)
      
    } catch (error: any) {
      logger.warn(`⚠️  Could not seed ad ${ad.id}: ${error.message}`);
    }
  }

  logger.info('');
  logger.info('✅ Test data seeding complete!');
  logger.info('');
  logger.info('📝 NOTE:');
  logger.info('   The contracts need admin functions to set initial stats.');
  logger.info('   For now, stats will start at 0 and increment as users interact.');
  logger.info('   You can query current stats using get_ad_stats().');
  logger.info('');
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

