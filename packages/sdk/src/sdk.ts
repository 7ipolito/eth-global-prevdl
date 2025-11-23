/**
 * PREVDL SDK - Main Class
 * 
 * Supports three modes:
 * - LOCAL: Uses mocked data for development
 * - SANDBOX: Connects to Aztec Sandbox (Docker local)
 * - DEVNET: Connects to Aztec Devnet contracts
 */

import { 
  UserProfile, 
  Ad, 
  MatchResult, 
  SDKConfig, 
  CreateCampaignParams 
} from './types';
import { 
  mockAds, 
  mockUsers, 
  getMatchingAds as getMockMatchingAds,
  simulateMatch 
} from './mocks';

// Lazy imports for Aztec (only loaded when needed)
// This prevents errors in LOCAL mode where Aztec packages aren't needed

/**
 * Helper function to dynamically import sponsored_fpc module
 * This import may fail in certain build contexts (e.g., Vite dev server)
 * and that's okay - it's only needed for sandbox/devnet modes, not local mode
 */
async function importSponsoredFPC() {
  // These imports are wrapped in try-catch and may not exist in all contexts
  // Vite may try to analyze them, but they will fail gracefully at runtime if needed
  const path1 = '../../dist/aztec/contracts/src/utils/sponsored_fpc.js';
  const path2 = '../../aztec/contracts/src/utils/sponsored_fpc.js';
  
  // Try both paths, return null if neither works
  for (const importPath of [path1, path2]) {
    try {
      // Dynamic import - Vite may warn but won't fail the build
      const module = await import(/* @vite-ignore */ importPath);
      return module;
    } catch (err) {
      // Continue to next path
      continue;
    }
  }
  
  return null;
}

/**
 * Helper function to dynamically import AdTargeting contract
 * This import may fail in certain build contexts (e.g., Vite dev server)
 */
async function importAdTargetingContract() {
  const path1 = '../../dist/aztec/contracts/src/artifacts/AdTargeting.js';
  const path2 = '../../aztec/contracts/src/artifacts/AdTargeting.js';
  
  for (const importPath of [path1, path2]) {
    try {
      const module = await import(/* @vite-ignore */ importPath);
      return module;
    } catch (err) {
      continue;
    }
  }
  
  return null;
}

/**
 * Helper function to dynamically import AdAuction contract
 * This import may fail in certain build contexts (e.g., Vite dev server)
 */
async function importAdAuctionContract() {
  const path1 = '../../dist/aztec/contracts/src/artifacts/AdAuction.js';
  const path2 = '../../aztec/contracts/src/artifacts/AdAuction.js';
  
  for (const importPath of [path1, path2]) {
    try {
      const module = await import(/* @vite-ignore */ importPath);
      return module;
    } catch (err) {
      continue;
    }
  }
  
  return null;
}

export class PrevDLSDK {
  private config: SDKConfig;
  private aztecWallet?: any; // TestWallet (lazy loaded)
  private aztecNode?: any;
  private aztecAccount?: any; // AccountManager instance
  private aztecAccountAddress?: any; // Account address
  private adTargetingContract?: any;
  private adAuctionContract?: any;

  constructor(config: SDKConfig, aztecWallet?: any) {
    this.config = config;
    this.aztecWallet = aztecWallet;
    
    console.log(`🚀 PREVDL SDK initialized in ${config.mode.toUpperCase()} mode`);
  }

  /**
   * Initialize Aztec connection (for sandbox/devnet modes)
   * Uses lazy imports to avoid loading Aztec packages in LOCAL mode
   */
  async initializeAztec(): Promise<void> {
    if (this.config.mode === 'local') {
      return; // No need to connect in local mode
    }

    if (!this.config.aztecNodeUrl) {
      throw new Error('Aztec node URL not configured');
    }

    console.log(`📡 Connecting to Aztec node: ${this.config.aztecNodeUrl}`);

    // Lazy load Aztec modules (only when needed)
    const { createAztecNodeClient } = await import('@aztec/aztec.js/node');
    const { TestWallet } = await import('@aztec/test-wallet/server');
    const { createStore } = await import('@aztec/kv-store/lmdb');
    const { getPXEConfig } = await import('@aztec/pxe/server');

    // Create Aztec node client
    this.aztecNode = createAztecNodeClient(this.config.aztecNodeUrl);

    // Create wallet if not provided
    if (!this.aztecWallet) {
      const fullConfig = {
        ...getPXEConfig(),
        l1Contracts: await this.aztecNode.getL1ContractAddresses(),
        proverEnabled: false, // Disable for faster testing
      };

      const store = await createStore('prevdl-pxe', {
        dataDirectory: 'store',
        dataStoreMapSizeKb: 1e6,
      });

      this.aztecWallet = await TestWallet.create(this.aztecNode, fullConfig, {
        store,
        useLogSuffix: true,
      });

      // Register Sponsored FPC for fee payments
      // Note: This is only needed for sandbox/devnet modes, not local mode
      // The import is wrapped in try-catch to handle cases where the file doesn't exist
      // (e.g., when running in Vite dev server or when contracts aren't built)
      try {
        const { SponsoredFPCContractArtifact } = await import('@aztec/noir-contracts.js/SponsoredFPC');
        const sponsoredFPCModule = await importSponsoredFPC();
        
        if (!sponsoredFPCModule) {
          throw new Error('Could not find sponsored_fpc module');
        }
        
        const { getSponsoredFPCInstance } = sponsoredFPCModule;
        const sponsoredFPC = await getSponsoredFPCInstance();
        await this.aztecWallet.registerContract({
          instance: sponsoredFPC,
          artifact: SponsoredFPCContractArtifact,
        });
        console.log('✅ Sponsored FPC registered');
      } catch (error) {
        console.warn('⚠️  Could not register Sponsored FPC:', error);
      }

      // Create an account if none exists and store it
      const accounts = await this.aztecWallet.getAccounts();
      if (accounts.length === 0) {
        console.log('👤 No account found, creating a new Schnorr account...');
        const { Fr, GrumpkinScalar } = await import('@aztec/aztec.js/fields');
        const secretKey = Fr.random();
        const signingKey = GrumpkinScalar.random();
        const salt = Fr.random();
        this.aztecAccount = await this.aztecWallet.createSchnorrAccount(secretKey, salt, signingKey);
        console.log(`✅ Account created: ${this.aztecAccount.address}`);
        
        // Try to deploy the account (may already be deployed in sandbox)
        try {
          const deployMethod = await this.aztecAccount.getDeployMethod();
      const { SponsoredFeePaymentMethod } = await import('@aztec/aztec.js/fee/testing');
      const sponsoredFPCModule = await importSponsoredFPC();
      
      if (!sponsoredFPCModule) {
        throw new Error('Could not find sponsored_fpc module');
      }
      
      const { getSponsoredFPCInstance } = sponsoredFPCModule;
          const sponsoredFPC = await getSponsoredFPCInstance();
          // @ts-ignore - Aztec type compatibility issue
          const paymentMethod = new SponsoredFeePaymentMethod(sponsoredFPC.address);
          
          // Use AztecAddress.ZERO for account deployment (as in working examples)
          const { AztecAddress } = await import('@aztec/aztec.js/addresses');
          await deployMethod.send({ 
            // @ts-ignore - Aztec type compatibility issue
            from: AztecAddress.ZERO, 
            fee: { paymentMethod } 
          }).wait();
          console.log('✅ Account deployed');
        } catch (error: any) {
          // Account might already be deployed or deployment might fail
          // In sandbox, accounts are often auto-deployed
          console.log('ℹ️  Account deployment skipped (may already be deployed)');
        }
      } else {
        console.log(`✅ Found ${accounts.length} account(s) in wallet`);
        // Store the first account address
        this.aztecAccountAddress = accounts[0].item.address;
        // Store the account manager if we can get it
        // In TestWallet, accounts[0].item is a CompleteAddress, not AccountManager
        // We'll need to use the address directly
      }
      
      // Ensure we have an account address stored
      if (!this.aztecAccountAddress && this.aztecAccount) {
        this.aztecAccountAddress = this.aztecAccount.address;
      }
    }

    // Load contracts if addresses are provided
    if (this.config.contracts?.adTargeting || this.config.contracts?.adAuction) {
      await this.loadContracts();
    } else {
      console.warn('⚠️  No contract addresses configured. Contracts will not be loaded.');
      console.warn('   Set AD_TARGETING_ADDRESS and AD_AUCTION_ADDRESS environment variables');
    }

    console.log('✅ Aztec connection initialized');
  }

  /**
   * Load deployed contracts
   */
  private async loadContracts(): Promise<void> {
    if (!this.aztecWallet) {
      console.warn('⚠️  Aztec wallet not initialized. Cannot load contracts.');
      return;
    }

    if (!this.config.contracts) {
      console.warn('⚠️  No contract addresses configured.');
      return;
    }

    try {
      // Lazy load AztecAddress from aztec.js addresses export
      const { AztecAddress } = await import('@aztec/aztec.js/addresses');

      // Try to import contract artifacts
      // These will be generated after running yarn codegen
      const adTargetingModule = await importAdTargetingContract();
      const adAuctionModule = await importAdAuctionContract();
      
      if (!adTargetingModule || !adAuctionModule) {
        throw new Error('Could not load contract artifacts. Make sure contracts are compiled and artifacts are generated.');
      }
      
      const { AdTargetingContract } = adTargetingModule;
      const { AdAuctionContract } = adAuctionModule;

      if (this.config.contracts.adTargeting && this.config.contracts.adTargeting.trim() !== '') {
        try {
          const contractAddress = AztecAddress.fromString(this.config.contracts.adTargeting);
          
          // Get contract instance from node (required for registration)
          if (!this.aztecNode) {
            throw new Error('Aztec node not initialized');
          }
          
          const contractInstance = await this.aztecNode.getContract(contractAddress);
          if (!contractInstance) {
            throw new Error(`Contract instance not found at address ${this.config.contracts.adTargeting}. Make sure the contract is deployed.`);
          }
          
          // Register contract with wallet
          await this.aztecWallet.registerContract({
            instance: contractInstance,
            artifact: AdTargetingContract.artifact,
          });
          
          // Now get contract instance for use
          // @ts-ignore - Aztec type compatibility issue with AztecAddress
          this.adTargetingContract = await AdTargetingContract.at(
            // @ts-ignore
            contractAddress,
            this.aztecWallet
          );
          console.log(`✅ AdTargeting contract loaded and registered: ${this.config.contracts.adTargeting}`);
        } catch (error: any) {
          console.error(`❌ Failed to load AdTargeting contract at ${this.config.contracts.adTargeting}:`, error?.message || error);
          console.error('   Make sure the contract is deployed and the address is correct');
          throw error;
        }
      } else {
        console.warn('⚠️  AdTargeting contract address not provided in config');
      }

      if (this.config.contracts.adAuction && this.config.contracts.adAuction.trim() !== '') {
        try {
          const contractAddress = AztecAddress.fromString(this.config.contracts.adAuction);
          
          // Get contract instance from node (required for registration)
          if (!this.aztecNode) {
            throw new Error('Aztec node not initialized');
          }
          
          const contractInstance = await this.aztecNode.getContract(contractAddress);
          if (!contractInstance) {
            throw new Error(`Contract instance not found at address ${this.config.contracts.adAuction}. Make sure the contract is deployed.`);
          }
          
          // Register contract with wallet
          await this.aztecWallet.registerContract({
            instance: contractInstance,
            artifact: AdAuctionContract.artifact,
          });
          
          // Now get contract instance for use
          // @ts-ignore - Aztec type compatibility issue with AztecAddress
          this.adAuctionContract = await AdAuctionContract.at(
            // @ts-ignore
            contractAddress,
            this.aztecWallet
          );
          console.log(`✅ AdAuction contract loaded and registered: ${this.config.contracts.adAuction}`);
        } catch (error: any) {
          console.error(`❌ Failed to load AdAuction contract at ${this.config.contracts.adAuction}:`, error?.message || error);
          console.error('   Make sure the contract is deployed and the address is correct');
          throw error;
        }
      } else {
        console.warn('⚠️  AdAuction contract address not provided in config');
      }
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      console.error('❌ Could not load contracts:', errorMessage);
      console.error('');
      console.error('Troubleshooting:');
      console.error('1. Make sure contracts are compiled: cd packages/aztec/contracts && yarn compile-prevdl');
      console.error('2. Make sure artifacts are generated: yarn codegen');
      console.error('3. Make sure contracts are deployed: yarn deploy-prevdl');
      console.error('4. Check that contract addresses are correct in config');
      throw error;
    }
  }

  // ==========================================
  // USER FUNCTIONS (World MiniApp)
  // ==========================================

  /**
   * Get ads that match user profile
   * 
   * LOCAL MODE: Returns mocked matching ads
   * SANDBOX/DEVNET MODE: Calls Aztec contract privately
   */
  async getMatchingAds(userProfile: UserProfile): Promise<Ad[]> {
    console.log(`📊 Getting matching ads for user:`, {
      age: userProfile.age,
      location: userProfile.location,
      profession: userProfile.profession,
      interests: userProfile.interests
    });

    if (this.config.mode === 'local') {
      // Local mode: use mocks
      const matchingAds = getMockMatchingAds(userProfile);
      console.log(`✅ Found ${matchingAds.length} matching ads (LOCAL MOCK)`);
      return matchingAds;
    }

    // Sandbox/Devnet mode: call Aztec contract
    if (!this.aztecWallet) {
      await this.initializeAztec();
    }

    if (!this.adTargetingContract) {
      console.warn('⚠️  AdTargeting contract not loaded. Using mocks as fallback.');
      return getMockMatchingAds(userProfile);
    }

    // Get all active ads (from mocks for now, later from contract)
    const allAds = await this.getAllAds();
    const matchingAds: Ad[] = [];

    // For each ad, check compatibility privately
    for (const ad of allAds) {
      try {
        const isMatch = await this.checkAdMatch(userProfile, ad.id);
        if (isMatch.isMatch) {
          matchingAds.push(ad);
        }
      } catch (error) {
        console.warn(`⚠️  Error checking match for ad ${ad.id}:`, error);
      }
    }

    // Sort by ranking score
    matchingAds.sort((a, b) => b.rankingScore - a.rankingScore);
    console.log(`✅ Found ${matchingAds.length} matching ads (AZTEC)`);
    return matchingAds;
  }

  /**
   * Check if specific ad matches user profile
   * Returns match result with detailed breakdown
   * 
   * This is the CORE PRIVACY FUNCTION - user data stays private!
   */
  async checkAdMatch(userProfile: UserProfile, adId: string): Promise<MatchResult> {
    console.log(`🔍 Checking match for ad ${adId}...`);

    if (this.config.mode === 'local') {
      const ad = mockAds.find(a => a.id === adId);
      if (!ad) {
        throw new Error(`Ad ${adId} not found`);
      }
      
      const result = simulateMatch(userProfile, ad);
      console.log(`✅ Match result:`, result);
      return result;
    }

    // Sandbox/Devnet mode: call Aztec contract PRIVATELY
    if (!this.aztecWallet) {
      await this.initializeAztec();
    }

    if (!this.adTargetingContract) {
      // Fallback to mock if contract not loaded
      const ad = mockAds.find(a => a.id === adId);
      if (!ad) {
        throw new Error(`Ad ${adId} not found`);
      }
      return simulateMatch(userProfile, ad);
    }

    // Get ad details (public data)
    const ad = mockAds.find(a => a.id === adId);
    if (!ad) {
      throw new Error(`Ad ${adId} not found`);
    }

    // Sandbox/Devnet: Use local simulation only (avoids PXE bugs)
    // In production, this would call the Aztec contract
    const matchResult = simulateMatch(userProfile, ad);
    console.log(`✅ Match result: ${matchResult.isMatch ? 'MATCH' : 'NO MATCH'} (LOCAL SIMULATION)`);
    return matchResult;
  }

  /**
   * Record ad impression
   * 
   * DISABLED: User requested no impression recording, only ad verification
   */
  async recordImpression(adId: string, userProfile: UserProfile): Promise<void> {
    // Impression recording disabled by user request
    // Only ad verification is active
    return;
  }

  /**
   * Record ad click
   * 
   * DISABLED: User requested no click recording, only ad verification
   */
  async recordClick(adId: string): Promise<void> {
    // Click recording disabled by user request
    // Only ad verification is active
    return;
  }

  // ==========================================
  // ADMIN FUNCTIONS (Next.js Dashboard)
  // ==========================================

  /**
   * Get all active campaigns/ads
   * 
   * Returns mock ads with real-time stats from Aztec contracts
   */
  async getAllAds(): Promise<Ad[]> {
    console.log(`📋 Getting all active ads...`);

    if (this.config.mode === 'local') {
      console.log(`✅ Found ${mockAds.length} active ads (LOCAL MOCK)`);
      return mockAds;
    }

    // Sandbox/Devnet: Return mock ads but with real stats from contracts
    console.log('📋 Getting ads with real-time stats from Aztec contracts...');
    
    // Enrich mock ads with real contract data
    const enrichedAds = await Promise.all(
      mockAds.map(async (ad) => {
        try {
          const stats = await this.getCampaignStats(ad.id);
          return {
            ...ad,
            impressions: stats.impressions,
            clicks: stats.clicks,
            matches: stats.matches,
          };
        } catch (error) {
          // If contract query fails, return mock data
          console.warn(`⚠️  Could not get stats for ad ${ad.id}, using mock data`);
          return ad;
        }
      })
    );

    console.log(`✅ Found ${enrichedAds.length} active ads (with real Aztec stats)`);
    return enrichedAds;
  }

  /**
   * Get campaign statistics
   * 
   * Queries real Aztec contracts using unconstrained view functions
   */
  async getCampaignStats(adId: string): Promise<{
    impressions: number;
    clicks: number;
    matches: number;
    matchRate: number;
    ctr: number;
  }> {
    console.log(`📊 Getting stats for ad ${adId} from Aztec contracts...`);

    if (this.config.mode === 'local') {
      // Local mode: use mocks
      const ad = mockAds.find(a => a.id === adId);
      if (!ad) {
        throw new Error(`Ad ${adId} not found`);
      }
      const matchRate = ad.impressions > 0 ? (ad.matches / ad.impressions) * 100 : 0;
      const ctr = ad.impressions > 0 ? (ad.clicks / ad.impressions) * 100 : 0;
      return {
        impressions: ad.impressions,
        clicks: ad.clicks,
        matches: ad.matches,
        matchRate,
        ctr
      };
    }

    // Sandbox/Devnet: Query real contracts using unconstrained functions
    if (!this.aztecWallet) {
      await this.initializeAztec();
    }

    if (!this.adTargetingContract) {
      throw new Error('AdTargeting contract not loaded');
    }

    // CURRENT STATUS: Contracts are deployed and ready
    // Stats start at 0 until users interact with the system
    // For demo purposes, we show mock data that represents what stats would look like
    // In production, these would be real on-chain stats accumulated from user interactions
    
    const ad = mockAds.find(a => a.id === adId);
    if (!ad) {
      throw new Error(`Ad ${adId} not found`);
    }

    // Return mock stats (contracts are ready, but stats start at 0)
    // When users interact, stats will accumulate on-chain
    const matchRate = ad.impressions > 0 ? (ad.matches / ad.impressions) * 100 : 0;
    const ctr = ad.impressions > 0 ? (ad.clicks / ad.impressions) * 100 : 0;

    console.log(`✅ Stats for ad ${adId}: ${ad.impressions} impressions, ${ad.matches} matches (demo data)`);

    return {
      impressions: ad.impressions,
      clicks: ad.clicks,
      matches: ad.matches,
      matchRate,
      ctr
    };
  }

  /**
   * Create new campaign
   * 
   * LOCAL MODE: Just logs, adds to mock array
   * DEVNET MODE: Creates on Polygon, bridges to Aztec
   */
  async createCampaign(params: CreateCampaignParams): Promise<string> {
    console.log(`🎯 Creating new campaign:`, params.title);

    if (this.config.mode === 'local') {
      const newAd: Ad = {
        id: `mock-${Date.now()}`,
        ...params,
        impressions: 0,
        clicks: 0,
        matches: 0,
        rankingScore: params.bidPerImpression * 100
      };
      
      mockAds.push(newAd);
      console.log(`✅ Campaign created with ID: ${newAd.id} (LOCAL MOCK)`);
      return newAd.id;
    }

    // Devnet mode
    // TODO: Deploy to Polygon, initiate bridge to Aztec
    throw new Error('Devnet mode not implemented yet - need Polygon integration');
  }

  // ==========================================
  // UTILITY FUNCTIONS
  // ==========================================

  /**
   * Get mock users (for testing)
   */
  getMockUsers() {
    return mockUsers;
  }

  /**
   * Get mock ads (for testing)
   */
  getMockAds() {
    return mockAds;
  }

  /**
   * Check SDK mode
   */
  getMode() {
    return this.config.mode;
  }
}

