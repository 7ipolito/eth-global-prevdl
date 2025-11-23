/**
 * PrevDL Ads - Privacy-Preserving Ad Targeting SDK
 * 
 * Main class for interacting with PREVDL ad targeting system
 * Uses Oasis Sapphire for production or local mocks for development
 * 
 * 🔐 SECURITY: When using Oasis Sapphire, all data is encrypted before sending
 */

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

    // Debug: log da configuração recebida
    console.log('🔧 PrevDLAds Config:', {
      clientId: config.clientId,
      environment: config.environment,
      hasOasis: !!config.oasis,
      oasisContract: config.oasis?.contractAddress,
      oasisRpc: config.oasis?.rpcUrl,
      hasWallet: !!config.oasis?.wallet,
    });

    // 🔄 LÓGICA BASEADA NO ENVIRONMENT
    // Se environment === 'local' → usar dados mockados (sem blockchain)
    // Se environment !== 'local' → usar Oasis Sapphire (se config.oasis fornecido)
    
    if (config.environment === 'local') {
      // Ambiente local = dados mockados (sem blockchain)
      this.useOasis = false;
      console.log('✅ Using local mock data (no blockchain)');
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
      console.log(`   Contract: ${config.oasis.contractAddress}`);
      console.log(`   RPC: ${config.oasis.rpcUrl}`);
    } else {
      // Se não é local e não tem Oasis config, usar modo local como fallback
      console.warn('⚠️  Oasis config not provided. Falling back to local mode (mock data).');
      console.warn('   To use Oasis Sapphire, provide config.oasis with contractAddress, rpcUrl, and wallet.');
      this.useOasis = false;
      console.log('✅ Using local mock data (no blockchain) as fallback');
    }
  }

  /**
   * Initialize the SDK connection
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      if (this.useOasis && this.oasisAdapter) {
        // Inicializar o OasisAdapter (carrega ethers dinamicamente)
        await this.oasisAdapter.initialize();
        
        // Verificar se criptografia está habilitada
        if (this.oasisAdapter.isEncryptionRequired()) {
          console.log('🔐 Encryption is MANDATORY - all data will be encrypted');
        }
        
        console.log('✅ Oasis adapter initialized');
      } else {
        // Modo local - sem inicialização necessária
        console.log(`✅ PrevDL Ads SDK initialized in local mode (mock data)`);
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
    } else {
      // Modo local - não requer envio ao blockchain
      console.log('ℹ️  Local mode: user profile stored locally (not sent to blockchain)');
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
  /**
   * Calcula a especificidade de uma campanha (quanto mais específica, maior o score)
   * Campanhas mais específicas devem aparecer primeiro
   */
  private calculateSpecificityScore(campaign: any): number {
    let specificity = 0;
    
    // Verificar se tem propriedades de Campaign (do adapter) ou Ad (convertido)
    const targeting = campaign.targeting || {
      targetAgeMin: campaign.targetAgeMin || 0,
      targetAgeMax: campaign.targetAgeMax || 0,
      targetLocation: campaign.targetLocation || 0,
      targetProfession: campaign.targetProfession || 0,
      targetInterest: campaign.targetInterest || 0,
      targetGender: campaign.targetGender || 0,
    };

    // Converter para números para garantir comparação correta
    const ageMin = Number(targeting.targetAgeMin) || 0;
    const ageMax = Number(targeting.targetAgeMax) || 0;
    const location = Number(targeting.targetLocation) || 0;
    const profession = Number(targeting.targetProfession) || 0;
    const interest = Number(targeting.targetInterest) || 0;
    const gender = Number(targeting.targetGender) || 0;

    // Idade específica (não é 0-0 ou faixa muito ampla)
    if (ageMin !== 0 || ageMax !== 0) {
      const ageRange = ageMax - ageMin;
      if (ageRange === 0) {
        specificity += 15; // Idade exata (ex: 35-35) - MUITO específico
      } else if (ageRange <= 5) {
        specificity += 10; // Faixa muito específica (ex: 30-35)
      } else if (ageRange <= 10) {
        specificity += 5; // Faixa específica (ex: 25-35)
      } else {
        specificity += 2; // Faixa ampla mas ainda específica
      }
    }

    // Localização específica (não é ANY = 0)
    if (location !== 0) {
      specificity += 5;
    }

    // Profissão específica (não é ANY = 0)
    if (profession !== 0) {
      specificity += 5;
    }

    // Interesse específico (não é NONE = 0)
    if (interest !== 0) {
      specificity += 5;
    }

    // Gênero específico (não é ANY = 0)
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
        
        // NOTA: Não tentamos buscar o perfil do usuário aqui porque:
        // 1. O contrato getMatchingAds() já usa o perfil correto baseado em msg.sender
        // 2. O contrato só permite que o próprio usuário veja seu perfil (msg.sender == user)
        // 3. Não precisamos comparar perfis - o contrato já faz o matching usando o perfil armazenado
        // 4. O userProfile fornecido é apenas para referência/debug, mas o contrato usa o perfil on-chain
        
        // Obtém ads matching do contrato Oasis
        // NOTA: getMatchingAds retorna apenas campanhas ativas que fazem match
        const matchingAds = await this.oasisAdapter.getMatchingAds(userAddress);
        
        // Buscar detalhes completos de cada campanha para calcular especificidade
        // E validar matching novamente para garantir que está correto
        const adsWithDetails = await Promise.all(
          matchingAds.map(async (ad: any) => {
            try {
              // Buscar detalhes completos da campanha
              const campaignId = ad.id.toString();
              const campaign = await this.oasisAdapter!.getCampaign(parseInt(campaignId));
              
              // NOTA: Não filtramos por status - todas as campanhas retornadas por getMatchingAds
              // já são ativas. Se precisar incluir campanhas inativas, use getAllCampaigns() diretamente
              
              // VALIDAÇÃO ADICIONAL: Verificar matching novamente para garantir
              if (userProfile) {
                try {
                  const matchResult = await this.checkAdMatch(userProfile, campaignId, userAddress);
                  if (!matchResult.isMatch) {
                    console.warn(`⚠️  Campanha ${campaignId} não faz match com o perfil do usuário. Detalhes:`, {
                      ageMatch: matchResult.matchDetails?.ageMatch,
                      locationMatch: matchResult.matchDetails?.locationMatch,
                      professionMatch: matchResult.matchDetails?.professionMatch,
                      interestMatch: matchResult.matchDetails?.interestMatch,
                      genderMatch: matchResult.matchDetails?.genderMatch,
                    });
                    return null; // Retornar null para filtrar campanhas que não fazem match
                  }
                } catch (matchError: any) {
                  console.warn(`⚠️  Erro ao verificar match da campanha ${campaignId}:`, matchError.message);
                  // Continuar mesmo se falhar a verificação
                }
              }
              
              // Calcular especificidade
              const specificityScore = this.calculateSpecificityScore(campaign);
              
              // Extrair targeting (pode estar em campaign.targeting ou diretamente em campaign)
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
                title: '', // Não disponível no contrato
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
                specificityScore, // Score de especificidade
              };
            } catch (error: any) {
              console.warn(`⚠️  Erro ao buscar detalhes da campanha ${ad.id}:`, error.message);
              return null; // Retornar null para filtrar campanhas com erro
            }
          })
        );

        // Filtrar campanhas nulas (inativas, sem match, ou com erro)
        const validAds = adsWithDetails.filter((ad: any): ad is NonNullable<typeof ad> => ad !== null);
        
        if (validAds.length !== matchingAds.length) {
          const filteredCount = matchingAds.length - validAds.length;
          console.log(`🔍 Filtradas ${filteredCount} campanha(s) que não fazem match ou estão inativas`);
        }

        // Ordenar APENAS por especificidade (mais específica primeiro)
        // Bid e CTR NÃO são considerados - apenas a especificidade do targeting
        validAds.sort((a: any, b: any) => {
          return b.specificityScore - a.specificityScore;
        });

        console.log(`📊 Ads válidos ordenados APENAS por especificidade (bid e CTR não são considerados):`);
        validAds.forEach((ad: any, index: number) => {
          console.log(`   ${index + 1}. Campanha ID ${ad.id} - Especificidade: ${ad.specificityScore} pontos`);
          console.log(`      - Targeting: Idade ${ad.targetAgeMin}-${ad.targetAgeMax}, Loc: ${ad.targetLocation}, Prof: ${ad.targetProfession}, Int: ${ad.targetInterest}`);
        });

        // Remover specificityScore antes de retornar (não faz parte da interface Ad)
        return validAds.map((ad: any) => {
          const { specificityScore, ...adWithoutScore } = ad;
          return adWithoutScore;
        });
      } else if (userProfile) {
        // Modo local - usar mocks
        console.log('ℹ️  Local mode: using mock data for matching');
        return getMatchingAds(userProfile);
      } else {
        throw new Error('userProfile is required in local mode, or userAddress is required in Oasis mode');
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
      } else {
        // Modo local - usar mocks
        const ad = mockAds.find(a => a.id === adId);
        if (!ad) {
          throw new Error(`Ad with id ${adId} not found`);
        }
        return simulateMatch(userProfile, ad);
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
      if (this.useOasis && this.oasisAdapter) {
        // Para Oasis, precisamos buscar campanhas ativas e converter
        const campaignIds = await this.oasisAdapter.getActiveCampaigns();
        const campaigns = await Promise.all(
          campaignIds.map(id => this.getCampaign(id.toString()))
        );
        return campaigns;
      } else {
        // Modo local - retornar todos os mocks
        return mockAds;
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
      } else {
        // Modo local - retornar stats mockados
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
   * Obtém IDs de todas as campanhas (ativas e inativas)
   * 
   * @returns Array de IDs de todas as campanhas
   */
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
      console.error('❌ Error getting all campaigns:', error.message);
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
   * @returns true se o usuário tem perfil, false caso contrário
   */
  async hasProfile(userAddress: string): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      if (this.useOasis && this.oasisAdapter) {
        return await this.oasisAdapter.hasProfile(userAddress);
      } else {
        // Modo local - sempre retorna false (perfis não são armazenados on-chain)
        return false;
      }
    } catch (error: any) {
      // Se houver erro, assume que não tem perfil para permitir criação
      console.warn('⚠️  Error checking if user has profile:', error.message);
      return false;
    }
  }
}

