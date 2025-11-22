/**
 * PrevDL Ads - Privacy-Preserving Ad Targeting SDK
 * 
 * Main class for interacting with PREVDL ad targeting system
 * Uses Aztec Network for privacy-preserving ad matching
 */

import { PrevDLSDK } from '../sdk';
import type {
  UserProfile,
  Ad,
  MatchResult,
  PrevDLAdsConfig,
  PrevDLEnvironment,
} from '../types';

export class PrevDLAds {
  private sdk: PrevDLSDK;
  private clientId: string;
  private environment: PrevDLEnvironment;
  private initialized: boolean = false;

  constructor(config: PrevDLAdsConfig) {
    if (!config.clientId) {
      throw new Error('Client ID is required');
    }

    this.clientId = config.clientId;
    this.environment = config.environment || 'sandbox';

    // Map environment to SDK mode (production uses devnet)
    const sdkMode = this.environment === 'production' ? 'devnet' : this.environment as 'local' | 'sandbox' | 'devnet';

    // Initialize SDK with appropriate mode
    this.sdk = new PrevDLSDK({
      mode: sdkMode,
      aztecNodeUrl: config.aztecNodeUrl,
      adTargetingAddress: config.adTargetingAddress,
      adAuctionAddress: config.adAuctionAddress,
    });
  }

  /**
   * Initialize the SDK connection to Aztec
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // SDK auto-initializes on first use, just mark as ready
      this.initialized = true;
      console.log(`✅ PrevDL Ads SDK initialized in ${this.environment} mode`);
    } catch (error: any) {
      console.error('❌ Failed to initialize PrevDL Ads SDK:', error.message);
      throw error;
    }
  }

  /**
   * Get targeted ads for a user profile
   * Privacy-preserving: user data never leaves the device
   * 
   * @param userProfile - User's private profile data
   * @returns Array of matching ads
   */
  async getTargetedAds(userProfile: UserProfile): Promise<Ad[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const matchedAds = await this.sdk.getMatchingAds(userProfile);
      return matchedAds;
    } catch (error: any) {
      console.error('❌ Error getting targeted ads:', error.message);
      throw error;
    }
  }

  /**
   * Check if a specific ad matches the user profile
   * 
   * @param userProfile - User's private profile data
   * @param adId - Ad ID to check
   * @returns Match result with details
   */
  async checkAdMatch(userProfile: UserProfile, adId: string): Promise<MatchResult> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      return await this.sdk.checkAdMatch(userProfile, adId);
    } catch (error: any) {
      console.error('❌ Error checking ad match:', error.message);
      throw error;
    }
  }

  /**
   * Get all available ads (public data)
   * 
   * @returns Array of all active ads
   */
  async getAllAds(): Promise<Ad[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      return await this.sdk.getAllAds();
    } catch (error: any) {
      console.error('❌ Error getting all ads:', error.message);
      throw error;
    }
  }

  /**
   * Get campaign statistics for an ad
   * 
   * @param adId - Ad ID
   * @returns Campaign statistics
   */
  async getCampaignStats(adId: string): Promise<{
    impressions: number;
    clicks: number;
    matches: number;
    matchRate: number;
    ctr: number;
  }> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      return await this.sdk.getCampaignStats(adId);
    } catch (error: any) {
      console.error('❌ Error getting campaign stats:', error.message);
      throw error;
    }
  }

  /**
   * Get client ID
   */
  getClientId(): string {
    return this.clientId;
  }

  /**
   * Get current environment
   */
  getEnvironment(): PrevDLEnvironment {
    return this.environment;
  }

  /**
   * Check if SDK is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

