/**
 * Oasis Adapter - Testing Utilities
 * 
 * Funções para testar o adapter LOCALMENTE antes de enviar para o contrato.
 * Permite validar dados, testar criptografia e simular chamadas.
 */

import type { UserProfile } from '../types';
import { OasisAdapter } from './OasisAdapter';
import {
  testEncryption,
  validateProfile,
  simulateEncryptionProcess,
  generateTestReport,
} from '../utils/encryption.test';

/**
 * Testa o adapter sem fazer chamadas reais ao contrato
 * 
 * @param adapter Instância do adapter
 * @param profile Perfil para testar
 * @param walletAddress Endereço da wallet
 * @returns Resultado do teste
 */
export async function testAdapterLocally(
  adapter: OasisAdapter,
  profile: UserProfile,
  walletAddress: string
): Promise<{
  validation: {
    isValid: boolean;
    errors: string[];
  };
  encryption: {
    success: boolean;
    testResult?: any;
  };
  ready: boolean;
  report: string;
}> {
  // 1. Validar perfil
  const validationErrors = validateProfile(profile);
  const isValid = validationErrors.length === 0;

  // 2. Testar criptografia
  const encryptionTest = await testEncryption(profile, walletAddress);

  // 3. Gerar relatório
  const report = generateTestReport(encryptionTest);

  return {
    validation: {
      isValid,
      errors: validationErrors,
    },
    encryption: {
      success: encryptionTest.success,
      testResult: encryptionTest,
    },
    ready: isValid && encryptionTest.success,
    report,
  };
}

/**
 * Prepara dados para envio sem realmente enviar
 * 
 * Útil para verificar se os dados estão prontos antes de fazer a transação.
 * 
 * @param adapter Instância do adapter
 * @param profile Perfil para preparar
 * @param walletAddress Endereço da wallet
 * @returns Dados preparados e validação
 */
export async function prepareDataForSending(
  adapter: OasisAdapter,
  profile: UserProfile,
  walletAddress: string
): Promise<{
  ready: boolean;
  encryptedData?: string;
  nonce?: string;
  validation: string[];
  errors: string[];
}> {
  const errors: string[] = [];
  const validation: string[] = [];

  // 1. Validar perfil
  const profileErrors = validateProfile(profile);
  if (profileErrors.length > 0) {
    errors.push(...profileErrors);
    return { ready: false, validation, errors };
  }
  validation.push('✅ Perfil válido');

  // 2. Verificar se adapter está configurado
  if (!adapter.isEncryptionRequired()) {
    errors.push('Criptografia não está habilitada');
    return { ready: false, validation, errors };
  }
  validation.push('✅ Criptografia obrigatória habilitada');

  // 3. Simular processo de criptografia
  const simulation = await simulateEncryptionProcess(profile, walletAddress);
  
  if (!simulation.readyForContract) {
    errors.push(simulation.summary);
    return { ready: false, validation, errors };
  }

  validation.push('✅ Dados criptografados com sucesso');
  validation.push(`✅ Tamanho dos dados: ${simulation.encryption.size} bytes`);

  return {
    ready: true,
    encryptedData: simulation.encryption.encryptedData,
    nonce: simulation.encryption.nonce,
    validation,
    errors: [],
  };
}

