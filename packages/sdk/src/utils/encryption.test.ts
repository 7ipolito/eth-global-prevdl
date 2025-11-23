/**
 * PrevDL Ads - Encryption Testing Utilities
 * 
 * Funções para testar e validar criptografia LOCALMENTE antes de enviar para o TEE.
 * Permite verificar se os dados estão sendo criptografados corretamente.
 */

import type { UserProfile } from '../types';
import {
  encryptUserProfile,
  decryptUserProfile,
  encryptAndEncodeUserProfile,
  encodeUserProfileForContract,
  isEncryptionSupported,
} from './encryption';

/**
 * Resultado do teste de criptografia
 */
export interface EncryptionTestResult {
  success: boolean;
  originalProfile: UserProfile;
  encryptedData?: {
    encrypted: string;
    nonce: string;
    iv?: string;
  };
  decryptedProfile?: UserProfile;
  encodedData?: string;
  errors: string[];
  warnings: string[];
}

/**
 * Testa criptografia completa de um perfil
 * 
 * Esta função permite testar a criptografia LOCALMENTE antes de enviar para o contrato.
 * 
 * @param profile Perfil para testar
 * @param walletAddress Endereço da wallet
 * @returns Resultado do teste
 */
export async function testEncryption(
  profile: UserProfile,
  walletAddress: string
): Promise<EncryptionTestResult> {
  const result: EncryptionTestResult = {
    success: false,
    originalProfile: profile,
    errors: [],
    warnings: [],
  };

  try {
    // 1. Verificar se criptografia está disponível
    if (!isEncryptionSupported()) {
      result.errors.push('Web Crypto API não está disponível neste ambiente');
      return result;
    }

    // 2. Validar perfil
    if (!profile.age || profile.age < 1 || profile.age > 120) {
      result.errors.push(`Idade inválida: ${profile.age}`);
      return result;
    }

    if (!profile.interests || profile.interests.length > 3) {
      result.errors.push(`Interesses inválidos: máximo 3, recebido ${profile.interests?.length || 0}`);
      return result;
    }

    // 3. Testar criptografia básica
    try {
      const encrypted = await encryptUserProfile(profile, walletAddress);
      result.encryptedData = {
        encrypted: encrypted.encrypted,
        nonce: encrypted.nonce,
        iv: encrypted.iv,
      };
    } catch (error: any) {
      result.errors.push(`Erro ao criptografar: ${error.message}`);
      return result;
    }

    // 4. Testar descriptografia
    if (result.encryptedData) {
      try {
        const decrypted = await decryptUserProfile(
          {
            encrypted: result.encryptedData.encrypted,
            nonce: result.encryptedData.nonce,
            iv: result.encryptedData.iv || '',
          },
          walletAddress
        );
        result.decryptedProfile = decrypted;

        // 5. Verificar se descriptografou corretamente
        if (decrypted.age !== profile.age) {
          result.errors.push(`Idade não corresponde: esperado ${profile.age}, obtido ${decrypted.age}`);
        }
        if (decrypted.location !== profile.location) {
          result.errors.push(`Localização não corresponde`);
        }
        if (decrypted.profession !== profile.profession) {
          result.errors.push(`Profissão não corresponde`);
        }
      } catch (error: any) {
        result.errors.push(`Erro ao descriptografar: ${error.message}`);
        return result;
      }
    }

    // 6. Testar encoding para contrato
    try {
      const encoded = await encodeUserProfileForContract(profile);
      result.encodedData = encoded;
    } catch (error: any) {
      result.warnings.push(`Erro ao codificar para contrato: ${error.message}`);
    }

    // 7. Testar criptografia completa (pronta para contrato)
    try {
      const { encryptedData, nonce } = await encryptAndEncodeUserProfile(profile, walletAddress);
      if (!result.encryptedData) {
        result.encryptedData = {
          encrypted: encryptedData,
          nonce: nonce,
        };
      }
    } catch (error: any) {
      result.warnings.push(`Erro ao criptografar para contrato: ${error.message}`);
    }

    // 8. Verificar se não há erros
    if (result.errors.length === 0) {
      result.success = true;
    }

  } catch (error: any) {
    result.errors.push(`Erro inesperado: ${error.message}`);
  }

  return result;
}

/**
 * Valida perfil antes de criptografar
 * 
 * @param profile Perfil para validar
 * @returns Array de erros (vazio se válido)
 */
export function validateProfile(profile: UserProfile): string[] {
  const errors: string[] = [];

  // Validar idade
  if (!profile.age || profile.age < 1 || profile.age > 120) {
    errors.push(`Idade inválida: ${profile.age} (deve estar entre 1 e 120)`);
  }

  // Validar localização
  if (profile.location === undefined || profile.location < 0 || profile.location > 100) {
    errors.push(`Localização inválida: ${profile.location}`);
  }

  // Validar profissão
  if (profile.profession === undefined || profile.profession < 0 || profile.profession > 99) {
    errors.push(`Profissão inválida: ${profile.profession}`);
  }

  // Validar interesses
  if (!profile.interests || profile.interests.length === 0) {
    errors.push('Pelo menos um interesse é necessário');
  }
  if (profile.interests.length > 3) {
    errors.push(`Muitos interesses: ${profile.interests.length} (máximo 3)`);
  }
  profile.interests.forEach((interest, index) => {
    if (interest < 1 || interest > 10) {
      errors.push(`Interesse ${index + 1} inválido: ${interest}`);
    }
  });

  // Validar gênero (opcional)
  if (profile.gender !== undefined && (profile.gender < 0 || profile.gender > 3)) {
    errors.push(`Gênero inválido: ${profile.gender}`);
  }

  return errors;
}

/**
 * Simula o processo completo sem enviar para o contrato
 * 
 * Útil para testar antes de fazer deploy ou enviar dados reais.
 * 
 * @param profile Perfil para testar
 * @param walletAddress Endereço da wallet
 * @returns Resultado detalhado do teste
 */
export async function simulateEncryptionProcess(
  profile: UserProfile,
  walletAddress: string
): Promise<{
  validation: {
    isValid: boolean;
    errors: string[];
  };
  encryption: {
    success: boolean;
    encryptedData?: string;
    nonce?: string;
    size: number;
  };
  readyForContract: boolean;
  summary: string;
}> {
  // 1. Validar perfil
  const validationErrors = validateProfile(profile);
  const isValid = validationErrors.length === 0;

  if (!isValid) {
    return {
      validation: {
        isValid: false,
        errors: validationErrors,
      },
      encryption: {
        success: false,
        size: 0,
      },
      readyForContract: false,
      summary: `❌ Validação falhou: ${validationErrors.join(', ')}`,
    };
  }

  // 2. Testar criptografia
  try {
    const { encryptedData, nonce } = await encryptAndEncodeUserProfile(profile, walletAddress);
    
    return {
      validation: {
        isValid: true,
        errors: [],
      },
      encryption: {
        success: true,
        encryptedData,
        nonce,
        size: encryptedData.length,
      },
      readyForContract: true,
      summary: `✅ Perfil validado e criptografado com sucesso! Pronto para enviar ao contrato.`,
    };
  } catch (error: any) {
    return {
      validation: {
        isValid: true,
        errors: [],
      },
      encryption: {
        success: false,
        size: 0,
      },
      readyForContract: false,
      summary: `❌ Erro ao criptografar: ${error.message}`,
    };
  }
}

/**
 * Compara dois perfis para verificar se são iguais
 * 
 * @param profile1 Primeiro perfil
 * @param profile2 Segundo perfil
 * @returns true se forem iguais
 */
export function compareProfiles(profile1: UserProfile, profile2: UserProfile): boolean {
  if (profile1.age !== profile2.age) return false;
  if (profile1.location !== profile2.location) return false;
  if (profile1.profession !== profile2.profession) return false;
  if ((profile1.gender || 0) !== (profile2.gender || 0)) return false;
  
  if (profile1.interests.length !== profile2.interests.length) return false;
  for (let i = 0; i < profile1.interests.length; i++) {
    if (profile1.interests[i] !== profile2.interests[i]) return false;
  }
  
  return true;
}

/**
 * Gera relatório de teste de criptografia
 * 
 * @param result Resultado do teste
 * @returns Relatório formatado
 */
export function generateTestReport(result: EncryptionTestResult): string {
  const lines: string[] = [];
  
  lines.push('='.repeat(60));
  lines.push('RELATÓRIO DE TESTE DE CRIPTOGRAFIA');
  lines.push('='.repeat(60));
  lines.push('');
  
  lines.push('📊 Status:');
  lines.push(`   ${result.success ? '✅ SUCESSO' : '❌ FALHA'}`);
  lines.push('');
  
  lines.push('📝 Perfil Original:');
  lines.push(`   Idade: ${result.originalProfile.age}`);
  lines.push(`   Localização: ${result.originalProfile.location}`);
  lines.push(`   Profissão: ${result.originalProfile.profession}`);
  lines.push(`   Interesses: ${result.originalProfile.interests.join(', ')}`);
  lines.push(`   Gênero: ${result.originalProfile.gender || 'N/A'}`);
  lines.push('');
  
  if (result.encryptedData) {
    lines.push('🔐 Dados Criptografados:');
    lines.push(`   Tamanho: ${result.encryptedData.encrypted.length} bytes`);
    lines.push(`   Nonce: ${result.encryptedData.nonce.substring(0, 20)}...`);
    if (result.encryptedData.iv) {
      lines.push(`   IV: ${result.encryptedData.iv.substring(0, 20)}...`);
    }
    lines.push('');
  }
  
  if (result.decryptedProfile) {
    lines.push('🔓 Perfil Descriptografado:');
    lines.push(`   Idade: ${result.decryptedProfile.age}`);
    lines.push(`   Localização: ${result.decryptedProfile.location}`);
    lines.push(`   Profissão: ${result.decryptedProfile.profession}`);
    lines.push(`   Interesses: ${result.decryptedProfile.interests.join(', ')}`);
    lines.push('');
    
    const matches = compareProfiles(result.originalProfile, result.decryptedProfile);
    lines.push(`✅ Dados correspondem: ${matches ? 'SIM' : 'NÃO'}`);
    lines.push('');
  }
  
  if (result.errors.length > 0) {
    lines.push('❌ Erros:');
    result.errors.forEach(error => {
      lines.push(`   - ${error}`);
    });
    lines.push('');
  }
  
  if (result.warnings.length > 0) {
    lines.push('⚠️  Avisos:');
    result.warnings.forEach(warning => {
      lines.push(`   - ${warning}`);
    });
    lines.push('');
  }
  
  if (result.encodedData) {
    lines.push('📦 Dados Codificados (ABI):');
    lines.push(`   ${result.encodedData.substring(0, 50)}...`);
    lines.push('');
  }
  
  lines.push('='.repeat(60));
  
  return lines.join('\n');
}

