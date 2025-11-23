import { OasisAdapter } from './OasisAdapter';
import { getMatchingAds, simulateMatch, mockAds } from '../mocks';
import type {
  UserProfile,
  Ad,
  MatchResult,
  PrevDLAdsConfig,
  PrevDLEnvironment,
  OasisSapphireConfig,
} from '../types';

export class PrevDLAds {
  public oasisAdapter?: OasisAdapter;
  private clientId: string;
  private environment: PrevDLEnvironment;
  private initialized: boolean = false;
  private useOasis: boolean = false;

  constructor(config: PrevDLAdsConfig) {
    if (!config.clientId) {
      throw new Error('Client ID is required');
    }

    this.clientId = config.clientId;
    this.environment = config.environment || 'sandbox';

    if (config.environment === 'local') {
      this.useOasis = false;
    } else if (config.oasis) {
      this.useOasis = true;
      this.oasisAdapter = new OasisAdapter({
        contractAddress: config.oasis.contractAddress,
        rpcUrl: config.oasis.rpcUrl,
        privateKey: config.oasis.privateKey,
        wallet: config.oasis.wallet,
        requireEncryption: config.oasis.requireEncryption ?? true,
      });
    } else {
      this.useOasis = false;
    }
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      if (this.useOasis && this.oasisAdapter) {
        await this.oasisAdapter.initialize();
      }
      
      this.initialized = true;
    } catch (error: any) {
      throw error;
    }
  }

  async setUserProfile(userProfile: UserProfile, userAddress?: string): Promise<string | void> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.useOasis && this.oasisAdapter) {
      if (!userAddress) {
        throw new Error('userAddress is required when using Oasis Sapphire');
      }
      
      return await this.oasisAdapter.setUserProfile(userProfile, userAddress);
    } else {
      return;
    }
  }

  private calculateSpecificityScore(campaign: any): number {
    let specificity = 0;
    
    const targeting = campaign.targeting || {
      targetAgeMin: campaign.targetAgeMin || 0,
      targetAgeMax: campaign.targetAgeMax || 0,
      targetLocation: campaign.targetLocation || 0,
      targetProfession: campaign.targetProfession || 0,
      targetInterest: campaign.targetInterest || 0,
      targetGender: campaign.targetGender || 0,
    };

    const ageMin = Number(targeting.targetAgeMin) || 0;
    const ageMax = Number(targeting.targetAgeMax) || 0;
    const location = Number(targeting.targetLocation) || 0;
    const profession = Number(targeting.targetProfession) || 0;
    const interest = Number(targeting.targetInterest) || 0;
    const gender = Number(targeting.targetGender) || 0;

    if (ageMin !== 0 || ageMax !== 0) {
      const ageRange = ageMax - ageMin;
      if (ageRange === 0) {
        specificity += 15;
      } else if (ageRange <= 5) {
        specificity += 10;
      } else if (ageRange <= 10) {
        specificity += 5;
      } else {
        specificity += 2;
      }
    }

    if (location !== 0) {
      specificity += 5;
    }

    if (profession !== 0) {
      specificity += 5;
    }

    if (interest !== 0) {
      specificity += 5;
    }

    if (gender !== 0) {
      specificity += 2;
    }

    return specificity;
  }

  async getTargetedAds(userProfile?: UserProfile, userAddress?: string): Promise<Ad[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      if (this.useOasis && this.oasisAdapter) {
        if (!userAddress) {
          throw new Error('userAddress is required when using Oasis Sapphire');
        }
        
        const matchingAds = await this.oasisAdapter.getMatchingAds(userAddress);
        
        const adsWithDetails = await Promise.all(
          matchingAds.map(async (ad: any) => {
            try {
              const campaignId = ad.id.toString();
              const campaign = await this.oasisAdapter!.getCampaign(parseInt(campaignId));
              
              if (userProfile) {
                try {
                  const matchResult = await this.checkAdMatch(userProfile, campaignId, userAddress);
                  if (!matchResult.isMatch) {
                    return null;
                  }
                } catch (matchError: any) {
                }
              }
              
              const specificityScore = this.calculateSpecificityScore(campaign);
              
              const targeting = campaign.targeting || {
                targetAgeMin: campaign.targetAgeMin || 0,
                targetAgeMax: campaign.targetAgeMax || 0,
                targetLocation: campaign.targetLocation || 0,
                targetProfession: campaign.targetProfession || 0,
                targetInterest: campaign.targetInterest || 0,
                targetGender: campaign.targetGender || 0,
              };

              return {
                id: campaignId,
                title: '',
                description: '',
                ctaUrl: ad.ctaUrl,
                targetAgeMin: Number(targeting.targetAgeMin) || 0,
                targetAgeMax: Number(targeting.targetAgeMax) || 0,
                targetLocation: Number(targeting.targetLocation) || 0,
                targetProfession: Number(targeting.targetProfession) || 0,
                targetInterest: Number(targeting.targetInterest) || 0,
                targetGender: Number(targeting.targetGender) || 0,
                bidPerImpression: ad.bidPerImpression,
                bidPerClick: ad.bidPerClick,
                impressions: ad.impressions,
                clicks: ad.clicks,
                matches: ad.matches,
                rankingScore: ad.rankingScore,
                specificityScore,
              };
            } catch (error: any) {
              return null;
            }
          })
        );

        const validAds = adsWithDetails.filter((ad: any): ad is NonNullable<typeof ad> => ad !== null);
        
        validAds.sort((a: any, b: any) => {
          return b.specificityScore - a.specificityScore;
        });

        return validAds.map((ad: any) => {
          const { specificityScore, ...adWithoutScore } = ad;
          return adWithoutScore;
        });
      } else if (userProfile) {
        return getMatchingAds(userProfile);
      } else {
        throw new Error('userProfile is required in local mode, or userAddress is required in Oasis mode');
      }
    } catch (error: any) {
      throw error;
    }
  }

  async checkAdMatch(userProfile: UserProfile, adId: string, userAddress?: string): Promise<MatchResult> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      if (this.useOasis && this.oasisAdapter) {
        if (!userAddress) {
          throw new Error('userAddress is required when using Oasis Sapphire');
        }
        const campaignId = parseInt(adId);
        const result = await this.oasisAdapter.checkAdMatch(campaignId, userAddress);
        return {
          adId,
          isMatch: result.isMatch,
          matchDetails: {
            ageMatch: result.ageMatch,
            locationMatch: result.locationMatch,
            professionMatch: result.professionMatch,
            interestMatch: result.interestMatch,
            genderMatch: result.genderMatch,
          },
        };
      } else {
        const ad = mockAds.find(a => a.id === adId);
        if (!ad) {
          throw new Error(`Ad with id ${adId} not found`);
        }
        return simulateMatch(userProfile, ad);
      }
    } catch (error: any) {
      throw error;
    }
  }

  async getAllAds(): Promise<Ad[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      if (this.useOasis && this.oasisAdapter) {
        const campaignIds = await this.oasisAdapter.getActiveCampaigns();
        const campaigns = await Promise.all(
          campaignIds.map(id => this.getCampaign(id.toString()))
        );
        return campaigns;
      } else {
        return mockAds;
      }
    } catch (error: any) {
      throw error;
    }
  }

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
      if (this.useOasis && this.oasisAdapter) {
        const campaignId = parseInt(adId);
        return await this.oasisAdapter.getCampaignStats(campaignId);
      } else {
        const ad = mockAds.find(a => a.id === adId);
        if (!ad) {
          throw new Error(`Ad with id ${adId} not found`);
        }
        return {
          impressions: ad.impressions,
          clicks: ad.clicks,
          matches: ad.matches,
          matchRate: ad.matches > 0 ? (ad.matches / ad.impressions) * 100 : 0,
          ctr: ad.impressions > 0 ? (ad.clicks / ad.impressions) * 100 : 0,
        };
      }
    } catch (error: any) {
      throw error;
    }
  }

  getClientId(): string {
    return this.clientId;
  }

  getEnvironment(): PrevDLEnvironment {
    return this.environment;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async testEncryptionLocally(
    userProfile: UserProfile,
    userAddress: string
  ): Promise<{
    validation: {
      isValid: boolean;
      errors: string[];
    };
    encryption: {
      success: boolean;
      encryptedData?: string;
      nonce?: string;
      size?: number;
    };
    ready: boolean;
    report: string;
  }> {
    if (!this.useOasis || !this.oasisAdapter) {
      throw new Error('testEncryptionLocally is only available when using Oasis Sapphire');
    }

    return await this.oasisAdapter.testEncryptionLocally(userProfile, userAddress);
  }

  async prepareDataForSending(
    userProfile: UserProfile,
    userAddress: string
  ): Promise<{
    ready: boolean;
    encryptedData?: string;
    nonce?: string;
    validation: string[];
    errors: string[];
    warnings: string[];
  }> {
    if (!this.useOasis || !this.oasisAdapter) {
      throw new Error('prepareDataForSending is only available when using Oasis Sapphire');
    }

    return await this.oasisAdapter.prepareDataForSending(userProfile, userAddress);
  }

  async getCampaign(campaignId: string): Promise<Ad> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      if (this.useOasis && this.oasisAdapter) {
        const campaignIdNum = parseInt(campaignId);
        const campaign = await this.oasisAdapter.getCampaign(campaignIdNum);
        
        return {
          id: campaign.id,
          title: '',
          description: '',
          ctaUrl: campaign.ctaUrl,
          targetAgeMin: campaign.targeting.targetAgeMin,
          targetAgeMax: campaign.targeting.targetAgeMax,
          targetLocation: campaign.targeting.targetLocation as any,
          targetProfession: campaign.targeting.targetProfession as any,
          targetInterest: campaign.targeting.targetInterest as any,
          targetGender: campaign.targeting.targetGender as any,
          bidPerImpression: parseFloat(campaign.bidPerImpression),
          bidPerClick: parseFloat(campaign.bidPerClick),
          impressions: campaign.impressions,
          clicks: campaign.clicks,
          matches: campaign.matches,
          rankingScore: 0,
        };
      } else {
        throw new Error('getCampaign is only available when using Oasis Sapphire');
      }
    } catch (error: any) {
      throw error;
    }
  }

  async getActiveCampaigns(): Promise<string[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      if (this.useOasis && this.oasisAdapter) {
        const campaignIds = await this.oasisAdapter.getActiveCampaigns();
        return campaignIds.map((id: number) => id.toString());
      } else {
        throw new Error('getActiveCampaigns is only available when using Oasis Sapphire');
      }
    } catch (error: any) {
      throw error;
    }
  }

  async getTotalCampaigns(): Promise<number> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      if (this.useOasis && this.oasisAdapter) {
        return await this.oasisAdapter.getTotalCampaigns();
      } else {
        throw new Error('getTotalCampaigns is only available when using Oasis Sapphire');
      }
    } catch (error: any) {
      throw error;
    }
  }

  async getAllCampaigns(): Promise<string[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      if (this.useOasis && this.oasisAdapter) {
        const campaignIds = await this.oasisAdapter.getAllCampaigns();
        return campaignIds.map((id: number) => id.toString());
      } else {
        throw new Error('getAllCampaigns is only available when using Oasis Sapphire');
      }
    } catch (error: any) {
      throw error;
    }
  }

  async getUserProfile(userAddress: string): Promise<UserProfile> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      if (this.useOasis && this.oasisAdapter) {
        return await this.oasisAdapter.getUserProfile(userAddress);
      } else {
        throw new Error('getUserProfile is only available when using Oasis Sapphire');
      }
    } catch (error: any) {
      throw error;
    }
  }

  async hasProfile(userAddress: string): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      if (this.useOasis && this.oasisAdapter) {
        return await this.oasisAdapter.hasProfile(userAddress);
      } else {
        return false;
      }
    } catch (error: any) {
      return false;
    }
  }
}

