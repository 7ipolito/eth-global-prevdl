import { Logger, createLogger } from "@aztec/aztec.js/log";
import { SponsoredFeePaymentMethod } from "@aztec/aztec.js/fee/testing";
import { Fr } from "@aztec/aztec.js/fields";
import { AztecAddress } from "@aztec/stdlib/aztec-address";
import { setupWallet } from "../src/utils/setup_wallet.js";
import { getSponsoredFPCInstance } from "../src/utils/sponsored_fpc.js";
import { SponsoredFPCContract } from "@aztec/noir-contracts.js/SponsoredFPC";
import { deploySchnorrAccount } from "../src/utils/deploy_account.js";
import { getTimeouts } from "../config/config.js";
import fs from 'fs';
import path from 'path';

async function main() {
    const logger = createLogger('aztec:prevdl-deploy');
    logger.info(`🚀 Deploying PREVDL contracts to Aztec...`);
    logger.info(`📋 Using Sponsored FPC for fee payment (FREE in sandbox)`);
    logger.info('');

    const timeouts = getTimeouts();

    // Setup wallet
    logger.info('📡 Setting up wallet...');
    const wallet = await setupWallet();
    logger.info(`✅ Wallet set up`);

    // Setup sponsored FPC (FREE method for sandbox)
    // According to docs: https://docs.aztec.network/developers/docs/guides/js_apps/how_to_pay_fees
    logger.info('💰 Setting up Sponsored FPC (free fee payment)...');
    const sponsoredFPC = await getSponsoredFPCInstance();
    logger.info(`📍 Sponsored FPC address: ${sponsoredFPC.address}`);
    
    logger.info('📝 Registering Sponsored FPC contract with wallet...');
    await wallet.registerContract({ 
        instance: sponsoredFPC, 
        artifact: SponsoredFPCContract.artifact 
    });
    
    const paymentMethod = new SponsoredFeePaymentMethod(sponsoredFPC.address);
    logger.info(`✅ Sponsored FPC configured (fees will be FREE)`);
    logger.info('');

    // Deploy account using Sponsored FPC
    logger.info('👤 Deploying admin account with Sponsored FPC...');
    const accountManager = await deploySchnorrAccount(wallet);
    const adminAddress = accountManager.address;
    logger.info(`✅ Admin account deployed: ${adminAddress}`);
    logger.info('');

    // Try to import contract artifacts
    // These should be generated after running yarn codegen
    let AdTargetingContract: any;
    let AdAuctionContract: any;

    logger.info('📦 Loading contract artifacts...');
    
    // Check if artifacts exist before trying to import
    const artifactsDir = path.resolve(process.cwd(), 'src/artifacts');
    const targetingArtifactPath = path.join(artifactsDir, 'AdTargeting.ts');
    const auctionArtifactPath = path.join(artifactsDir, 'AdAuction.ts');
    
    if (!fs.existsSync(targetingArtifactPath)) {
        logger.error('❌ AdTargeting artifact not found!');
        logger.error(`   Expected: ${targetingArtifactPath}`);
        logger.error('');
        logger.error('   SOLUTION:');
        logger.error('   1. Make sure contracts are compiled:');
        logger.error('      cd packages/aztec/contracts');
        logger.error('      yarn compile');
        logger.error('');
        logger.error('   2. Generate TypeScript artifacts:');
        logger.error('      yarn codegen');
        logger.error('');
        logger.error('   3. Verify artifacts exist:');
        logger.error('      ls -la src/artifacts/');
        logger.error('');
        logger.error('   NOTE: AdTargeting and AdAuction contracts need to be compiled.');
        logger.error('   Currently only PrivateVoting is being compiled.');
        logger.error('   See COMPILE_CONTRACTS.md for more details.');
        process.exit(1);
    }
    
    if (!fs.existsSync(auctionArtifactPath)) {
        logger.error('❌ AdAuction artifact not found!');
        logger.error(`   Expected: ${auctionArtifactPath}`);
        logger.error('');
        logger.error('   SOLUTION:');
        logger.error('   1. Make sure contracts are compiled:');
        logger.error('      cd packages/aztec/contracts');
        logger.error('      yarn compile');
        logger.error('');
        logger.error('   2. Generate TypeScript artifacts:');
        logger.error('      yarn codegen');
        logger.error('');
        logger.error('   3. Verify artifacts exist:');
        logger.error('      ls -la src/artifacts/');
        logger.error('');
        logger.error('   NOTE: AdTargeting and AdAuction contracts need to be compiled.');
        logger.error('   Currently only PrivateVoting is being compiled.');
        logger.error('   See COMPILE_CONTRACTS.md for more details.');
        process.exit(1);
    }
    
    try {
        const targetingModule = await import('../src/artifacts/AdTargeting.js');
        AdTargetingContract = targetingModule.AdTargetingContract;
        if (!AdTargetingContract) {
            throw new Error('AdTargetingContract not found in module exports');
        }
        logger.info('✅ AdTargeting artifact loaded');
    } catch (error: any) {
        logger.error('❌ Could not import AdTargetingContract');
        logger.error(`   Error: ${error?.message || String(error)}`);
        logger.error('');
        logger.error('   Make sure to run: yarn compile && yarn codegen');
        throw error;
    }

    try {
        const auctionModule = await import('../src/artifacts/AdAuction.js');
        AdAuctionContract = auctionModule.AdAuctionContract;
        if (!AdAuctionContract) {
            throw new Error('AdAuctionContract not found in module exports');
        }
        logger.info('✅ AdAuction artifact loaded');
    } catch (error: any) {
        logger.error('❌ Could not import AdAuctionContract');
        logger.error(`   Error: ${error?.message || String(error)}`);
        logger.error('');
        logger.error('   Make sure to run: yarn compile && yarn codegen');
        throw error;
    }
    logger.info('');

    // Deploy AdTargeting with Sponsored FPC (FREE)
    logger.info('🎯 Deploying AdTargeting contract...');
    logger.info('   Using Sponsored FPC for fees (FREE in sandbox)');
    
    const adTargetingTx = AdTargetingContract.deploy(wallet, adminAddress).send({
        from: adminAddress,
        fee: { paymentMethod } // Sponsored FPC - no fee juice needed!
    });
    
    logger.info('⏳ Waiting for deployment transaction...');
    const adTargeting = await adTargetingTx.deployed({ 
        timeout: timeouts.deployTimeout 
    });
    logger.info(`✅ AdTargeting deployed: ${adTargeting.address}`);
    logger.info('');

    // Deploy AdAuction with Sponsored FPC (FREE)
    logger.info('💰 Deploying AdAuction contract...');
    logger.info('   Using Sponsored FPC for fees (FREE in sandbox)');
    
    // USDC placeholder (will be set via bridge later)
    const usdcAddress = AztecAddress.ZERO;
    const treasuryAddress = adminAddress; // Admin is treasury for now
    const platformFee = 100n; // 10% fee (100 = 10%)

    const adAuctionTx = AdAuctionContract.deploy(
        wallet, 
        adminAddress,
        usdcAddress,
        treasuryAddress,
        platformFee
    ).send({
        from: adminAddress,
        fee: { paymentMethod } // Sponsored FPC - no fee juice needed!
    });
    
    logger.info('⏳ Waiting for deployment transaction...');
    const adAuction = await adAuctionTx.deployed({ 
        timeout: timeouts.deployTimeout 
    });
    logger.info(`✅ AdAuction deployed: ${adAuction.address}`);
    logger.info('');

    // Test contracts
    logger.info('🧪 Testing contracts...');
    try {
        const testAdId = Fr.fromString("1");
        const [impressions, matches, rejections] = await adTargeting.methods
            .get_ad_stats(testAdId)
            .simulate();
        logger.info(`✅ AdTargeting working! Stats: ${impressions} impressions, ${matches} matches`);
    } catch (error: any) {
        logger.warn(`⚠️  Could not test AdTargeting: ${error?.message || String(error)}`);
        logger.warn('   This is OK - contract is deployed, just testing failed');
    }

    // Save deployment info
    const deployedContracts = {
        network: process.env.AZTEC_ENV || 'sandbox',
        timestamp: new Date().toISOString(),
        contracts: {
            adTargeting: adTargeting.address.toString(),
            adAuction: adAuction.address.toString(),
            admin: adminAddress.toString(),
            sponsoredFPC: sponsoredFPC.address.toString()
        }
    };

    // Save to file
    const configDir = path.resolve(process.cwd(), 'config');
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
    }
    
    const deployedPath = path.join(configDir, 'deployed.json');
    fs.writeFileSync(deployedPath, JSON.stringify(deployedContracts, null, 2));

    logger.info('📝 Deployment Summary:');
    logger.info(JSON.stringify(deployedContracts, null, 2));
    logger.info(`💾 Saved to: ${deployedPath}`);
    logger.info('');
    logger.info('🎉 All contracts deployed successfully!');
    logger.info('');
    logger.info('📋 Next steps:');
    logger.info('1. Set environment variables:');
    logger.info(`   export AD_TARGETING_ADDRESS=${adTargeting.address}`);
    logger.info(`   export AD_AUCTION_ADDRESS=${adAuction.address}`);
    logger.info('');
    logger.info('2. Test with SDK:');
    logger.info('   cd ../../sdk');
    logger.info('   export PREVDL_MODE=sandbox');
    logger.info('   bun run example:sandbox');
}

main().catch((error: any) => {
    const logger = createLogger('aztec:prevdl-deploy');
    const errorMessage = error?.message || String(error) || 'Unknown error';
    const errorStack = error?.stack || '';
    logger.error(`❌ Deployment failed: ${errorMessage}`);
    if (errorStack) {
        logger.error(`📋 Error details: ${errorStack}`);
    }
    if (error?.cause) {
        logger.error(`📋 Cause: ${error.cause}`);
    }
    process.exit(1);
});

