/**
 * Oasis Sapphire Adapter - Força Criptografia Obrigatória
 * 
 * Este adapter garante que TODOS os dados sejam criptografados
 * antes de serem enviados para o contrato Oasis Sapphire.
 * 
 * RISCOS DE ENVIAR DADOS SEM CRIPTOGRAFIA:
 * 1. Dados visíveis no mempool antes de serem processados
 * 2. Interceptação em trânsito (man-in-the-middle)
 * 3. Exposição em logs de RPC nodes
 * 4. Vazamento em caso de comprometimento do nó
 * 5. Não-compliance com LGPD/GDPR
 */

import type { UserProfile } from '../types';
import {
  encryptAndEncodeUserProfile,
  isEncryptionSupported,
} from '../utils/encryption';
import { createRequire } from 'module';

// Types for ethers (to avoid hard dependency)
type EthersProvider = any;
type EthersSigner = any;
type EthersContract = any;
type EthersWallet = any;

export interface OasisConfig {
  contractAddress: string;
  rpcUrl: string;
  privateKey?: string; // Para transações assinadas
  wallet?: EthersWallet | EthersSigner; // Wallet conectada
  requireEncryption?: boolean; // Força criptografia (default: true)
}

export class OasisAdapter {
  private contract: EthersContract;
  private provider: EthersProvider;
  private signer: EthersSigner;
  private config: OasisConfig;
  private encryptionRequired: boolean;
  private ethers: any;
  
  // Helper para converter valores do ethers (compatível com v5 e v6)
  private toNumber(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'bigint') return Number(value);
    if (value?.toNumber) return value.toNumber(); // ethers v5
    if (value?.toString) return Number(value.toString()); // ethers v6
    return Number(value);
  }

  // ABI do contrato PrevDLAds
  private static readonly CONTRACT_ABI = [
    // Função para criar perfil criptografado
    'function setUserProfileEncrypted(bytes calldata encryptedData, bytes32 nonce) external',
    // Função para criar perfil (DEPRECATED - apenas para compatibilidade)
    'function setUserProfile(uint8 age, uint8 location, uint8 profession, uint8[3] calldata interests, uint8 gender) external',
    // Função para obter perfil do usuário
    'function getUserProfile(address user) external view returns (tuple(uint8 age, uint8 location, uint8 profession, uint8[3] interests, uint8 gender))',
    // Função para verificar matching
    'function checkAdMatch(uint256 campaignId, address user) public view returns (tuple(bool isMatch, bool ageMatch, bool locationMatch, bool professionMatch, bool interestMatch, bool genderMatch))',
    // Função para obter ads matching
    'function getMatchingAds(address user) external view returns (tuple(uint256 id, bytes32 creativeHash, string ctaUrl, uint256 bidPerImpression, uint256 bidPerClick, uint256 impressions, uint256 clicks, uint256 matches, uint256 rankingScore)[])',
    // Função para obter campanha específica
    'function getCampaign(uint256 campaignId) external view returns (tuple(uint256 id, address advertiser, bytes32 creativeHash, string ctaUrl, tuple(uint8 targetAgeMin, uint8 targetAgeMax, uint8 targetLocation, uint8 targetProfession, uint8 targetInterest, uint8 targetGender) targeting, uint256 budgetUSDC, uint256 spentUSDC, uint256 dailyBudgetUSDC, uint256 bidPerImpression, uint256 bidPerClick, uint8 status, uint256 impressions, uint256 clicks, uint256 matches, uint256 createdAt, uint256 activatedAt))',
    // Função para obter campanhas ativas
    'function getActiveCampaigns() external view returns (uint256[])',
    // Função para obter total de campanhas
    'function getTotalCampaigns() external view returns (uint256)',
    // Função para verificar se usuário tem perfil
    'function hasProfile(address user) external view returns (bool)',
    // Função para registrar impressão
    'function recordImpression(uint256 campaignId) external',
    // Função para registrar click
    'function recordClick(uint256 campaignId) external',
    // Função para obter stats
    'function getCampaignStats(uint256 campaignId) external view returns (uint256 impressions, uint256 clicks, uint256 matches, uint256 matchRate, uint256 ctr)',
    // Função para criar campanha
    'function createCampaign(bytes32 creativeHash, string calldata ctaUrl, tuple(uint8 targetAgeMin, uint8 targetAgeMax, uint8 targetLocation, uint8 targetProfession, uint8 targetInterest, uint8 targetGender) calldata targeting, uint256 budgetUSDC, uint256 dailyBudgetUSDC, uint256 bidPerImpression, uint256 bidPerClick) external returns (uint256)',
    // Eventos
    'event CampaignCreated(uint256 indexed campaignId, address indexed advertiser, uint256 budgetUSDC, uint256 bidPerImpression, uint256 bidPerClick)',
  ];

  constructor(config: OasisConfig) {
    // Carregar ethers dinamicamente (compatível com ES modules)
    try {
      const require = createRequire(import.meta.url);
      this.ethers = require('ethers');
    } catch (error: any) {
      throw new Error(
        `ethers.js is required for Oasis adapter. Please install: bun add ethers (Error: ${error.message})`
      );
    }

    this.config = {
      requireEncryption: true, // Por padrão, força criptografia
      ...config,
    };

    // 🔐 SEGURANÇA: Criptografia é SEMPRE obrigatória
    // Não permitir desabilitar para garantir segurança total
    this.encryptionRequired = true; // FORÇADO - não pode ser desabilitado

    // Verificar se criptografia está disponível
    if (!isEncryptionSupported()) {
      throw new Error(
        '❌ Encryption is REQUIRED but Web Crypto API is not available. ' +
        'This browser/environment does not support encryption. ' +
        'Please use a modern browser with Web Crypto API support. ' +
        'Security: All data must be encrypted before sending to prevent mempool exposure.'
      );
    }

    // Avisar se tentaram desabilitar criptografia
    if (config.requireEncryption === false) {
      console.warn(
        '⚠️  WARNING: requireEncryption=false was ignored. ' +
        'Encryption is ALWAYS required for security. ' +
        'This ensures data is encrypted before sending and decrypted only in TEE.'
      );
    }

    // Inicializar provider (compatível com ethers v5 e v6)
    // ethers v6 não tem providers, usa JsonRpcProvider diretamente
    if (this.ethers.providers) {
      // ethers v5
      this.provider = new this.ethers.providers.JsonRpcProvider(config.rpcUrl);
    } else if (this.ethers.JsonRpcProvider) {
      // ethers v6
      this.provider = new this.ethers.JsonRpcProvider(config.rpcUrl);
    } else {
      throw new Error('Versão do ethers não suportada. Use ethers v5 ou v6');
    }

    // Inicializar signer
    if (config.wallet) {
      this.signer = config.wallet;
    } else if (config.privateKey) {
      this.signer = new this.ethers.Wallet(config.privateKey, this.provider);
    } else {
      throw new Error('Either wallet or privateKey must be provided');
    }

    // Inicializar contrato
    try {
      this.contract = new this.ethers.Contract(
        config.contractAddress,
        OasisAdapter.CONTRACT_ABI,
        this.signer
      );
      
      // Verificar se o contrato foi inicializado corretamente
      if (!this.contract) {
        throw new Error('Failed to initialize contract');
      }
      
      // Verificar se a função existe
      if (!this.contract.setUserProfileEncrypted) {
        throw new Error('setUserProfileEncrypted function not found in contract ABI');
      }
    } catch (error: any) {
      throw new Error(`Failed to initialize contract: ${error.message}`);
    }
  }

  /**
   * Define perfil de usuário com CRIPTOGRAFIA OBRIGATÓRIA
   * 
   * 🔐 SEGURANÇA GARANTIDA:
   * - Dados são SEMPRE criptografados antes de enviar (AES-256-GCM)
   * - Criptografia usa chave derivada da wallet do usuário
   * - Dados no mempool são apenas bytes criptografados (não revelam nada)
   * - Descriptografia ocorre SOMENTE no TEE (Trusted Execution Environment)
   * 
   * ⚠️  IMPORTANTE: Não há como enviar dados não criptografados.
   * O método não criptografado foi desabilitado no contrato por segurança.
   * 
   * @param userProfile Perfil do usuário (será criptografado automaticamente)
   * @param userAddress Endereço da wallet do usuário (para derivar chave de criptografia)
   * @returns Hash da transação
   * 
   * @throws Error se criptografia não estiver disponível ou falhar
   */
  async setUserProfile(
    userProfile: UserProfile,
    userAddress: string
  ): Promise<string> {
    // 🔐 Criptografia é SEMPRE obrigatória
    // Não há fallback para método não criptografado
    return this.setUserProfileEncrypted(userProfile, userAddress);
  }

  /**
   * Define perfil com criptografia (MÉTODO RECOMENDADO)
   * 
   * 🔐 SEGURANÇA:
   * - Dados são criptografados IMEDIATAMENTE ao receber
   * - Minimiza tempo que dados ficam em texto claro na memória
   * - Dados no mempool são apenas bytes criptografados
   * - Descriptografia ocorre SOMENTE no TEE (hardware seguro)
   * 
   * @param userProfile Perfil do usuário (será criptografado imediatamente)
   * @param userAddress Endereço da wallet
   * @returns Hash da transação
   */
  async setUserProfileEncrypted(
    userProfile: UserProfile,
    userAddress: string
  ): Promise<string> {
    // 🔐 CRIPTOGRAFIA IMEDIATA - Minimiza tempo em texto claro
    // Dados são criptografados assim que recebidos do frontend
    // Isso reduz o risco de interceptação no mesmo processo
    
    console.log('🔐 Encrypting user profile immediately (minimizing plaintext exposure)...');

    try {
      // 🔐 CRIPTOGRAFIA AES-256-GCM COMPLETA
      // 1. Codificar dados para ABI primeiro
      // 2. Criptografar com AES-256-GCM usando chave derivada da wallet
      // 3. Enviar dados criptografados para o contrato
      // 4. O contrato descriptografa no TEE antes de fazer abi.decode  
      
      console.log('   📝 Step 1: Encoding profile to ABI format...');
      
      // Garantir que interests tenha exatamente 3 elementos
      const interests: number[] = [...userProfile.interests];
      while (interests.length < 3) {
        interests.push(0); // Preencher com 0 (NONE)
      }
      
      // Codificar usando ethers (v5 ou v6)
      let encoded: string;
      if (this.ethers.AbiCoder) {
        // ethers v6
        const abiCoder = this.ethers.AbiCoder.defaultAbiCoder();
        encoded = abiCoder.encode(
          ['uint8', 'uint8', 'uint8', 'uint8[3]', 'uint8'],
          [
            userProfile.age,
            userProfile.location,
            userProfile.profession,
            interests.slice(0, 3),
            userProfile.gender || 0,
          ]
        );
      } else if (this.ethers.utils?.defaultAbiCoder) {
        // ethers v5
        encoded = this.ethers.utils.defaultAbiCoder.encode(
          ['uint8', 'uint8', 'uint8', 'uint8[3]', 'uint8'],
          [
            userProfile.age,
            userProfile.location,
            userProfile.profession,
            interests.slice(0, 3),
            userProfile.gender || 0,
          ]
        );
      } else {
        throw new Error('ABI encoder not available in ethers');
      }
      
      console.log('   ✅ ABI encoding complete');
      console.log('   🔐 Step 2: Encrypting with AES-256-GCM...');
      
      // 2. Criptografar com AES-256-GCM
      const { encryptAndEncodeUserProfile } = await import('../utils/encryption');
      const { encryptedData, nonce } = await encryptAndEncodeUserProfile(userProfile, userAddress);
      
      console.log('   ✅ AES-256-GCM encryption complete');
      console.log(`   📦 Encrypted size: ${(encryptedData.length - 2) / 2} bytes`);
      
      // encryptedData já está no formato correto (hex string com 0x)
      // nonce precisa ser bytes32 (32 bytes = 64 hex chars)

      // 3. Limpar referência ao perfil original (ajuda GC)
      // Nota: JavaScript não garante limpeza imediata, mas ajuda
      (userProfile as any) = null;

      console.log('   📤 Step 3: Preparing encrypted data for contract...');

      // Converter para formato correto (ethers v6)
      // encryptedData precisa ser bytes (string hex é aceita)
      // nonce precisa ser bytes32 (exatamente 32 bytes = 64 hex chars)
      let encryptedBytes: string = encryptedData.startsWith('0x') ? encryptedData : '0x' + encryptedData;
      
      // Garantir que nonce tem exatamente 32 bytes (64 hex chars)
      let nonceHexClean = nonce.startsWith('0x') ? nonce.slice(2) : nonce;
      if (nonceHexClean.length !== 64) {
        // Padding ou truncar para exatamente 32 bytes
        nonceHexClean = nonceHexClean.padEnd(64, '0').slice(0, 64);
      }
      const nonceBytes32 = '0x' + nonceHexClean;

      console.log(`   📦 Encrypted data length: ${(encryptedBytes.length - 2) / 2} bytes`);
      console.log(`   🔑 Nonce (bytes32): ${nonceBytes32.substring(0, 20)}... (${nonceHexClean.length / 2} bytes)`);
      console.log('   ✅ Data ready for contract (encrypted with AES-256-GCM)');
      console.log('   🔐 Contract will decrypt in TEE before processing');

      // Verificar se os dados estão no formato correto
      if (!encryptedBytes.startsWith('0x') || encryptedBytes.length < 4) {
        throw new Error('Invalid encrypted data format');
      }
      if (nonceHexClean.length !== 64) {
        throw new Error(`Invalid nonce length: expected 64 hex chars (32 bytes), got ${nonceHexClean.length}`);
      }

      // 2. Enviar dados criptografados para o contrato
      // ethers v6 aceita strings hex diretamente para bytes e bytes32
      // Não converter para Uint8Array - deixar como string hex
      
      console.log(`   🔍 Debug: encryptedBytes type: ${typeof encryptedBytes}, length: ${encryptedBytes.length}`);
      console.log(`   🔍 Debug: nonceBytes32 type: ${typeof nonceBytes32}, length: ${nonceBytes32.length}`);
      
      // Verificar se o contrato está inicializado
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }
      
      // Verificar se a função existe no contrato
      if (!this.contract.setUserProfileEncrypted) {
        throw new Error('setUserProfileEncrypted function not found in contract');
      }
      
      // Tentar chamar a função
      // No ethers v6, strings hex são aceitas diretamente para bytes e bytes32
      let tx;
      try {
        tx = await this.contract.setUserProfileEncrypted(
          encryptedBytes,  // string hex
          nonceBytes32,    // string hex (bytes32)
          {
            gasLimit: 500000,
          }
        );
      } catch (callError: any) {
        // Se falhar, tentar com Interface manual (fallback)
        console.warn('   ⚠️  Direct call failed, trying manual encoding...');
        const iface = new this.ethers.Interface(OasisAdapter.CONTRACT_ABI);
        const data = iface.encodeFunctionData('setUserProfileEncrypted', [
          encryptedBytes,
          nonceBytes32
        ]);
        
        tx = await this.signer.sendTransaction({
          to: this.config.contractAddress,
          data: data,
          gasLimit: 500000,
        });
      }

      console.log('⏳ Waiting for transaction confirmation...');
      await tx.wait();

      console.log('✅ Profile saved successfully (encrypted)');
      console.log(`📝 Transaction hash: ${tx.hash}`);

      return tx.hash;
    } catch (error: any) {
      console.error('❌ Error setting encrypted profile:', error.message);
      throw new Error(
        `Failed to set encrypted user profile: ${error.message}`
      );
    }
  }

  /**
   * Verifica se um ad combina com o perfil do usuário
   * 
   * @param campaignId ID da campanha
   * @param userAddress Endereço do usuário
   * @returns Resultado do matching
   */
  async checkAdMatch(
    campaignId: number,
    userAddress: string
  ): Promise<{
    isMatch: boolean;
    ageMatch: boolean;
    locationMatch: boolean;
    professionMatch: boolean;
    interestMatch: boolean;
    genderMatch: boolean;
  }> {
    try {
      const result = await this.contract.checkAdMatch(campaignId, userAddress);
      return {
        isMatch: result.isMatch,
        ageMatch: result.ageMatch,
        locationMatch: result.locationMatch,
        professionMatch: result.professionMatch,
        interestMatch: result.interestMatch,
        genderMatch: result.genderMatch,
      };
    } catch (error: any) {
      throw new Error(`Failed to check ad match: ${error.message}`);
    }
  }

  /**
   * Obtém ads que combinam com o perfil do usuário
   * 
   * @param userAddress Endereço do usuário
   * @returns Array de ads matching (com valores convertidos para números)
   */
  async getMatchingAds(userAddress: string): Promise<any[]> {
    try {
      const ads = await this.contract.getMatchingAds(userAddress);
      
      // Converter valores BigNumber para números (compatível com ethers v5 e v6)
      return ads.map((ad: any) => ({
        id: this.toNumber(ad.id),
        creativeHash: ad.creativeHash,
        ctaUrl: ad.ctaUrl,
        bidPerImpression: this.toNumber(ad.bidPerImpression),
        bidPerClick: this.toNumber(ad.bidPerClick),
        impressions: this.toNumber(ad.impressions),
        clicks: this.toNumber(ad.clicks),
        matches: this.toNumber(ad.matches),
        rankingScore: this.toNumber(ad.rankingScore),
      }));
    } catch (error: any) {
      throw new Error(`Failed to get matching ads: ${error.message}`);
    }
  }

  /**
   * Registra impressão de ad
   * 
   * @param campaignId ID da campanha
   * @returns Hash da transação
   */
  async recordImpression(campaignId: number): Promise<string> {
    try {
      const tx = await this.contract.recordImpression(campaignId, {
        gasLimit: 200000,
      });
      await tx.wait();
      return tx.hash;
    } catch (error: any) {
      throw new Error(`Failed to record impression: ${error.message}`);
    }
  }

  /**
   * Registra click em ad
   * 
   * @param campaignId ID da campanha
   * @returns Hash da transação
   */
  async recordClick(campaignId: number): Promise<string> {
    try {
      const tx = await this.contract.recordClick(campaignId, {
        gasLimit: 200000,
      });
      await tx.wait();
      return tx.hash;
    } catch (error: any) {
      throw new Error(`Failed to record click: ${error.message}`);
    }
  }

  /**
   * Obtém estatísticas de campanha
   * 
   * @param campaignId ID da campanha
   * @returns Estatísticas da campanha
   */
  async getCampaignStats(campaignId: number): Promise<{
    impressions: number;
    clicks: number;
    matches: number;
    matchRate: number;
    ctr: number;
  }> {
    try {
      const stats = await this.contract.getCampaignStats(campaignId);
      return {
        impressions: this.toNumber(stats.impressions),
        clicks: this.toNumber(stats.clicks),
        matches: this.toNumber(stats.matches),
        matchRate: this.toNumber(stats.matchRate),
        ctr: this.toNumber(stats.ctr),
      };
    } catch (error: any) {
      throw new Error(`Failed to get campaign stats: ${error.message}`);
    }
  }

  /**
   * Verifica se criptografia está habilitada
   * 
   * @returns true (sempre obrigatório - não pode ser desabilitado)
   */
  isEncryptionRequired(): boolean {
    return true; // Sempre obrigatório - não pode ser desabilitado
  }

  /**
   * Testa criptografia LOCALMENTE antes de enviar para o contrato
   * 
   * Esta função permite validar e testar a criptografia sem fazer
   * chamadas reais ao contrato. Útil para desenvolvimento e debugging.
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
    // Importar funções de teste dinamicamente
    const { validateProfile, simulateEncryptionProcess } = await import('../utils/encryption.test');
    const { generateTestReport, testEncryption } = await import('../utils/encryption.test');

    // 1. Validar perfil
    const validationErrors = validateProfile(userProfile);
    const isValid = validationErrors.length === 0;

    // 2. Testar criptografia completa
    const encryptionTest = await testEncryption(userProfile, userAddress);

    // 3. Simular processo
    const simulation = await simulateEncryptionProcess(userProfile, userAddress);

    // 4. Gerar relatório
    const report = generateTestReport(encryptionTest);

    return {
      validation: {
        isValid,
        errors: validationErrors,
      },
      encryption: {
        success: encryptionTest.success && simulation.encryption.success,
        encryptedData: simulation.encryption.encryptedData,
        nonce: simulation.encryption.nonce,
        size: simulation.encryption.size,
      },
      ready: isValid && encryptionTest.success && simulation.readyForContract,
      report,
    };
  }

  /**
   * Prepara dados para envio sem realmente enviar
   * 
   * Valida e criptografa dados, mas não faz chamada ao contrato.
   * Útil para verificar se tudo está correto antes de enviar.
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
    const { validateProfile, simulateEncryptionProcess } = await import('../utils/encryption.test');

    const errors: string[] = [];
    const warnings: string[] = [];
    const validation: string[] = [];

    // 1. Validar perfil
    const profileErrors = validateProfile(userProfile);
    if (profileErrors.length > 0) {
      errors.push(...profileErrors);
      return { ready: false, validation, errors, warnings };
    }
    validation.push('✅ Perfil válido');

    // 2. Verificar criptografia
    if (!this.isEncryptionRequired()) {
      errors.push('Criptografia não está habilitada');
      return { ready: false, validation, errors, warnings };
    }
    validation.push('✅ Criptografia obrigatória habilitada');

    // 3. Simular processo
    const simulation = await simulateEncryptionProcess(userProfile, userAddress);

    if (!simulation.readyForContract) {
      errors.push(simulation.summary);
      return { ready: false, validation, errors, warnings };
    }

    validation.push('✅ Dados criptografados com sucesso');
    validation.push(`✅ Tamanho: ${simulation.encryption.size} bytes`);

    return {
      ready: true,
      encryptedData: simulation.encryption.encryptedData,
      nonce: simulation.encryption.nonce,
      validation,
      errors: [],
      warnings,
    };
  }

  /**
   * Obtém endereço do contrato
   */
  getContractAddress(): string {
    return this.config.contractAddress;
  }

  /**
   * Obtém endereço da wallet conectada
   */
  async getWalletAddress(): Promise<string> {
    return await this.signer.getAddress();
  }

  /**
   * Obtém uma campanha específica do contrato
   * 
   * @param campaignId ID da campanha
   * @returns Dados da campanha
   */
  async getCampaign(campaignId: number): Promise<any> {
    try {
      const campaign = await this.contract.getCampaign(campaignId);
      return {
        id: campaign.id.toString(),
        advertiser: campaign.advertiser,
        creativeHash: campaign.creativeHash,
        ctaUrl: campaign.ctaUrl,
        targeting: {
          targetAgeMin: campaign.targeting.targetAgeMin,
          targetAgeMax: campaign.targeting.targetAgeMax,
          targetLocation: campaign.targeting.targetLocation,
          targetProfession: campaign.targeting.targetProfession,
          targetInterest: campaign.targeting.targetInterest,
          targetGender: campaign.targeting.targetGender,
        },
        budgetUSDC: campaign.budgetUSDC.toString(),
        spentUSDC: campaign.spentUSDC.toString(),
        dailyBudgetUSDC: campaign.dailyBudgetUSDC.toString(),
        bidPerImpression: campaign.bidPerImpression.toString(),
        bidPerClick: campaign.bidPerClick.toString(),
        status: campaign.status,
        impressions: this.toNumber(campaign.impressions),
        clicks: this.toNumber(campaign.clicks),
        matches: this.toNumber(campaign.matches),
        createdAt: new Date(this.toNumber(campaign.createdAt) * 1000),
        activatedAt: new Date(this.toNumber(campaign.activatedAt) * 1000),
      };
    } catch (error: any) {
      throw new Error(`Failed to get campaign: ${error.message}`);
    }
  }

  /**
   * Obtém IDs de todas as campanhas ativas
   * 
   * @returns Array de IDs de campanhas ativas
   */
  async getActiveCampaigns(): Promise<number[]> {
    try {
      const campaignIds = await this.contract.getActiveCampaigns();
      return campaignIds.map((id: any) => this.toNumber(id));
    } catch (error: any) {
      throw new Error(`Failed to get active campaigns: ${error.message}`);
    }
  }

  /**
   * Obtém o total de campanhas criadas
   * 
   * @returns Total de campanhas
   */
  async getTotalCampaigns(): Promise<number> {
    try {
      const total = await this.contract.getTotalCampaigns();
      return this.toNumber(total);
    } catch (error: any) {
      throw new Error(`Failed to get total campaigns: ${error.message}`);
    }
  }

  /**
   * Obtém perfil do usuário (apenas o próprio usuário pode acessar)
   * 
   * ⚠️ IMPORTANTE: O contrato verifica se msg.sender == user
   * Esta função só funciona se o signer for o próprio usuário
   * 
   * @param userAddress Endereço do usuário (deve corresponder ao signer)
   * @returns Perfil do usuário descriptografado
   */
  async getUserProfile(userAddress: string): Promise<UserProfile> {
    try {
      // Verificar se o signer corresponde ao userAddress
      const signerAddress = await this.signer.getAddress();
      if (signerAddress.toLowerCase() !== userAddress.toLowerCase()) {
        throw new Error(
          `Signer address (${signerAddress}) does not match user address (${userAddress}). ` +
          `The contract requires msg.sender == user. Please use the correct wallet.`
        );
      }
      
      // No ethers v6, view calls podem não usar o signer como msg.sender
      // Precisamos garantir que o contrato está conectado ao signer
      // Recriar contrato conectado ao signer explicitamente para garantir msg.sender correto
      const contractWithSigner = new this.ethers.Contract(
        this.config.contractAddress,
        OasisAdapter.CONTRACT_ABI,
        this.signer
      );
      
      // Verificar se o contrato tem o método antes de chamar
      if (!contractWithSigner.getUserProfile) {
        throw new Error('getUserProfile function not found in contract ABI');
      }
      
      // Chamar a função - o signer será usado como msg.sender
      const profile = await contractWithSigner.getUserProfile(userAddress);
      
      return {
        age: profile.age,
        location: profile.location,
        profession: profile.profession,
        interests: profile.interests.map((i: any) => this.toNumber(i)).filter((i: number) => i !== 0),
        gender: profile.gender,
      };
    } catch (error: any) {
      // Se ainda falhar, pode ser que o ethers v6 não esteja usando o signer corretamente
      // Tentar usar callStatic com o signer explicitamente
      if (error.message.includes('Can only view own profile')) {
        try {
          console.warn('⚠️  View call failed, trying with explicit signer connection...');
          
          // Tentar usar callStatic com signer
          const iface = new this.ethers.Interface(OasisAdapter.CONTRACT_ABI);
          const data = iface.encodeFunctionData('getUserProfile', [userAddress]);
          
          // Fazer call estático usando o signer
          const result = await this.signer.call({
            to: this.config.contractAddress,
            data: data,
          });
          
          // Decodificar resultado
          const decoded = iface.decodeFunctionResult('getUserProfile', result);
          const profile = decoded[0];
          
          return {
            age: this.toNumber(profile.age),
            location: this.toNumber(profile.location),
            profession: this.toNumber(profile.profession),
            interests: profile.interests.map((i: any) => this.toNumber(i)).filter((i: number) => i !== 0),
            gender: this.toNumber(profile.gender),
          };
        } catch (retryError: any) {
          const currentSignerAddress = await this.signer.getAddress();
          throw new Error(
            `Failed to get user profile: ${retryError.message}. ` +
            `Make sure the wallet (${currentSignerAddress}) matches the user address (${userAddress}).`
          );
        }
      }
      throw new Error(`Failed to get user profile: ${error.message}`);
    }
  }

  /**
   * Verifica se um usuário tem perfil cadastrado
   * 
   * @param userAddress Endereço do usuário
   * @returns true se o usuário tem perfil
   */
  async hasProfile(userAddress: string): Promise<boolean> {
    try {
      return await this.contract.hasProfile(userAddress);
    } catch (error: any) {
      throw new Error(`Failed to check if user has profile: ${error.message}`);
    }
  }

  /**
   * Cria uma nova campanha de anúncio
   * 
   * @param creativeHash Hash do creative (armazenado off-chain)
   * @param ctaUrl URL de call-to-action
   * @param targeting Critérios de targeting
   * @param budgetUSDC Orçamento total em USDC
   * @param dailyBudgetUSDC Orçamento diário em USDC
   * @param bidPerImpression Bid por impressão
   * @param bidPerClick Bid por click
   * @returns ID da campanha criada
   */
  async createCampaign(
    creativeHash: string,
    ctaUrl: string,
    targeting: {
      targetAgeMin: number;
      targetAgeMax: number;
      targetLocation: number;
      targetProfession: number;
      targetInterest: number;
      targetGender: number;
    },
    budgetUSDC: number | string,
    dailyBudgetUSDC: number | string,
    bidPerImpression: number | string,
    bidPerClick: number | string
  ): Promise<number> {
    try {
      // Converter valores para BigNumber se necessário
      const budget = typeof budgetUSDC === 'string' ? budgetUSDC : budgetUSDC.toString();
      const dailyBudget = typeof dailyBudgetUSDC === 'string' ? dailyBudgetUSDC : dailyBudgetUSDC.toString();
      const bidImp = typeof bidPerImpression === 'string' ? bidPerImpression : bidPerImpression.toString();
      const bidClick = typeof bidPerClick === 'string' ? bidPerClick : bidPerClick.toString();

      // Converter creativeHash para bytes32
      const hashBytes32 = creativeHash.startsWith('0x') ? creativeHash : '0x' + creativeHash;
      if (hashBytes32.length !== 66) {
        throw new Error('creativeHash must be 32 bytes (64 hex characters + 0x)');
      }

      const tx = await this.contract.createCampaign(
        hashBytes32,
        ctaUrl,
        {
          targetAgeMin: targeting.targetAgeMin,
          targetAgeMax: targeting.targetAgeMax,
          targetLocation: targeting.targetLocation,
          targetProfession: targeting.targetProfession,
          targetInterest: targeting.targetInterest,
          targetGender: targeting.targetGender,
        },
        budget,
        dailyBudget,
        bidImp,
        bidClick,
        {
          gasLimit: 500000,
        }
      );

      const receipt = await tx.wait();
      
      // Tentar obter o ID do evento CampaignCreated
      let campaignId: number | null = null;
      if (receipt.logs) {
        const iface = new this.ethers.Interface(OasisAdapter.CONTRACT_ABI);
        for (const log of receipt.logs) {
          try {
            const parsed = iface.parseLog(log);
            if (parsed && parsed.name === 'CampaignCreated') {
              campaignId = this.toNumber(parsed.args[0]); // Primeiro argumento é o campaignId
              break;
            }
          } catch {
            // Ignorar logs que não podem ser parseados
          }
        }
      }
      
      // Se não encontrou no evento, usar o total de campanhas (última criada)
      if (campaignId === null) {
        campaignId = await this.getTotalCampaigns();
      }
      
      return campaignId;
    } catch (error: any) {
      throw new Error(`Failed to create campaign: ${error.message}`);
    }
  }
}

