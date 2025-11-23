/**
 * PrevDL Ads - Privacy-Preserving Ad Targeting SDK
 * 
 * Main class for interacting with PREVDL ad targeting system
 * Supports both Aztec Network and Oasis Sapphire
 * 
 * 🔐 SECURITY: When using Oasis Sapphire, all data is encrypted before sending
 */

import { PrevDLSDK } from '../sdk';
import { OasisAdapter } from './OasisAdapter';
import type {
  UserProfile,
  Ad,
  MatchResult,
  PrevDLAdsConfig,
  PrevDLEnvironment,
  OasisSapphireConfig,
} from '../types';

export class PrevDLAds {
  private sdk?: PrevDLSDK;
  public oasisAdapter?: OasisAdapter; // Público para permitir testes
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

    // 🔄 LÓGICA BASEADA NO ENVIRONMENT
    // Se environment === 'local' → usar dados mockados (Aztec SDK)
    // Se environment !== 'local' → usar Oasis Sapphire (se config.oasis fornecido)
    
    if (config.environment === 'local') {
      // Ambiente local = dados mockados (Aztec SDK)
      const sdkMode = 'local';
      this.sdk = new PrevDLSDK({
        mode: sdkMode,
        aztecNodeUrl: config.aztecNodeUrl,
        adTargetingAddress: config.adTargetingAddress,
        adAuctionAddress: config.adAuctionAddress,
      });
      this.useOasis = false;
      console.log('✅ Using Aztec Network (local mode - mock data)');
    } else if (config.oasis) {
      // Ambiente dev/sandbox/production = Oasis Sapphire (se config fornecido)
      this.useOasis = true;
      this.oasisAdapter = new OasisAdapter({
        contractAddress: config.oasis.contractAddress,
        rpcUrl: config.oasis.rpcUrl,
        privateKey: config.oasis.privateKey,
        wallet: config.oasis.wallet,
        requireEncryption: config.oasis.requireEncryption ?? true, // Por padrão, força criptografia
      });
      console.log(`✅ Using Oasis Sapphire with mandatory encryption (${this.environment} mode)`);
    } else {
      // Fallback: se não é local e não tem Oasis config, usar Aztec
      const sdkMode = this.environment === 'production' ? 'devnet' : this.environment as 'local' | 'sandbox' | 'devnet';
      this.sdk = new PrevDLSDK({
        mode: sdkMode,
        aztecNodeUrl: config.aztecNodeUrl,
        adTargetingAddress: config.adTargetingAddress,
        adAuctionAddress: config.adAuctionAddress,
      });
      console.log(`✅ Using Aztec Network (${this.environment} mode)`);
      console.warn('⚠️  Oasis config not provided. For Oasis Sapphire, provide config.oasis');
    }
  }

  /**
   * Initialize the SDK connection
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      if (this.useOasis && this.oasisAdapter) {
        // Verificar se criptografia está habilitada
        if (this.oasisAdapter.isEncryptionRequired()) {
          console.log('🔐 Encryption is MANDATORY - all data will be encrypted');
        }
        const walletAddress = await this.oasisAdapter.getWalletAddress();
        console.log(`✅ Connected to Oasis Sapphire (Wallet: ${walletAddress})`);
      } else if (this.sdk) {
        // SDK auto-initializes on first use
        console.log(`✅ PrevDL Ads SDK initialized in ${this.environment} mode`);
      }
      
      this.initialized = true;
    } catch (error: any) {
      console.error('❌ Failed to initialize PrevDL Ads SDK:', error.message);
      throw error;
    }
  }

  /**
   * Define perfil de usuário (com criptografia obrigatória no Oasis)
   * 
   * ⚠️ SEGURANÇA: Quando usando Oasis, os dados são SEMPRE criptografados antes de enviar.
   * 
   * @param userProfile Perfil do usuário
   * @param userAddress Endereço da wallet do usuário (obrigatório para Oasis)
   * @returns Hash da transação ou void
   */
  async setUserProfile(userProfile: UserProfile, userAddress?: string): Promise<string | void> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.useOasis && this.oasisAdapter) {
      if (!userAddress) {
        throw new Error('userAddress is required when using Oasis Sapphire');
      }
      
      // Criptografia obrigatória - dados nunca são enviados em texto claro
      console.log('🔐 Encrypting user profile before sending to Oasis Sapphire...');
      return await this.oasisAdapter.setUserProfile(userProfile, userAddress);
    } else if (this.sdk) {
      // Modo Aztec (não requer endereço)
      console.warn('⚠️  Using Aztec mode - encryption handled by Aztec network');
      // Aztec SDK não tem método setUserProfile, apenas matching
      return;
    }
  }

  /**
   * Get targeted ads for a user profile
   * Privacy-preserving: user data never leaves the device
   * 
   * @param userProfile - User's private profile data (for Aztec mode)
   * @param userAddress - User's wallet address (for Oasis mode)
   * @returns Array of matching ads
   */
  async getTargetedAds(userProfile?: UserProfile, userAddress?: string): Promise<Ad[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      if (this.useOasis && this.oasisAdapter) {
        if (!userAddress) {
          throw new Error('userAddress is required when using Oasis Sapphire');
        }
        
        // Obtém ads matching do contrato Oasis
        const matchingAds = await this.oasisAdapter.getMatchingAds(userAddress);
        
        // Converter para formato Ad (valores já convertidos pelo OasisAdapter)
        return matchingAds.map((ad: any) => ({
          id: ad.id.toString(),
          title: '', // Não disponível no contrato
          description: '',
          ctaUrl: ad.ctaUrl,
          targetAgeMin: 0, // Não disponível no resultado
          targetAgeMax: 0,
          targetLocation: 0 as any, // Location.ANY
          targetProfession: 0 as any, // Profession.ANY
          targetInterest: 0 as any, // Interest.NONE
          bidPerImpression: ad.bidPerImpression, // Já convertido para número
          bidPerClick: ad.bidPerClick, // Já convertido para número
          impressions: ad.impressions, // Já convertido para número
          clicks: ad.clicks, // Já convertido para número
          matches: ad.matches, // Já convertido para número
          rankingScore: ad.rankingScore, // Já convertido para número
        }));
      } else if (this.sdk && userProfile) {
        return await this.sdk.getMatchingAds(userProfile);
      } else {
        throw new Error('Invalid configuration');
      }
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
      } else if (this.sdk) {
      return await this.sdk.checkAdMatch(userProfile, adId);
      } else {
        throw new Error('Invalid configuration');
      }
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
      if (this.sdk) {
      return await this.sdk.getAllAds();
      } else {
        throw new Error('SDK not initialized. Cannot get all ads.');
      }
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
      if (this.useOasis && this.oasisAdapter) {
        const campaignId = parseInt(adId);
        return await this.oasisAdapter.getCampaignStats(campaignId);
      } else if (this.sdk) {
      return await this.sdk.getCampaignStats(adId);
      } else {
        throw new Error('Invalid configuration: SDK not initialized');
      }
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

  /**
   * Testa criptografia LOCALMENTE antes de enviar para o contrato
   * 
   * Permite validar e testar a criptografia sem fazer chamadas reais ao contrato.
   * Útil para desenvolvimento e debugging.
   * 
   * @param userProfile Perfil para testar
   * @param userAddress Endereço da wallet
   * @returns Resultado do teste com detalhes
   */
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

  /**
   * Prepara dados para envio sem realmente enviar
   * 
   * Valida e criptografa dados, mas não faz chamada ao contrato.
   * 
   * @param userProfile Perfil para preparar
   * @param userAddress Endereço da wallet
   * @returns Dados preparados e status
   */
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

  /**
   * Obtém uma campanha específica do contrato
   * 
   * @param campaignId ID da campanha
   * @returns Dados completos da campanha
   */
  async getCampaign(campaignId: string): Promise<Ad> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      if (this.useOasis && this.oasisAdapter) {
        const campaignIdNum = parseInt(campaignId);
        const campaign = await this.oasisAdapter.getCampaign(campaignIdNum);
        
        // Converter para formato Ad
        return {
          id: campaign.id,
          title: '', // Não disponível no contrato (apenas hash)
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
          rankingScore: 0, // Calcular se necessário
        };
      } else {
        throw new Error('getCampaign is only available when using Oasis Sapphire');
      }
    } catch (error: any) {
      console.error('❌ Error getting campaign:', error.message);
      throw error;
    }
  }

  /**
   * Obtém IDs de todas as campanhas ativas
   * 
   * @returns Array de IDs de campanhas ativas
   */
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
      console.error('❌ Error getting active campaigns:', error.message);
      throw error;
    }
  }

  /**
   * Obtém o total de campanhas criadas
   * 
   * @returns Total de campanhas
   */
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
      console.error('❌ Error getting total campaigns:', error.message);
      throw error;
    }
  }

  /**
   * Obtém perfil do usuário (apenas o próprio usuário pode acessar)
   * 
   * ⚠️ SEGURANÇA: Dados são descriptografados no TEE antes de retornar
   * 
   * @param userAddress Endereço do usuário
   * @returns Perfil do usuário
   */
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
      console.error('❌ Error getting user profile:', error.message);
      throw error;
    }
  }

  /**
   * Verifica se um usuário tem perfil cadastrado
   * 
   * @param userAddress Endereço do usuário
   * @returns true se o usuário tem perfil
   */
  async hasProfile(userAddress: string): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      if (this.useOasis && this.oasisAdapter) {
        return await this.oasisAdapter.hasProfile(userAddress);
      } else {
        throw new Error('hasProfile is only available when using Oasis Sapphire');
      }
    } catch (error: any) {
      console.error('❌ Error checking if user has profile:', error.message);
      throw error;
    }
  }
}

