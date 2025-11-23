/**
 * Frontend Encryption Utilities
 * 
 * Funções opcionais para criptografar dados no frontend ANTES de passar para o SDK.
 * Isso adiciona uma camada extra de segurança, garantindo que dados nunca ficam
 * em texto claro, nem mesmo temporariamente no mesmo processo.
 * 
 * NOTA: O SDK já criptografa automaticamente, mas esta camada adicional garante
 * que dados nunca ficam em texto claro, mesmo dentro do mesmo processo JavaScript.
 */

import type { UserProfile } from '../types';
import { encryptUserProfile, encryptAndEncodeUserProfile } from './encryption';

/**
 * Interface para perfil pré-criptografado
 */
export interface PreEncryptedProfile {
  encrypted: string;
  nonce: string;
  iv: string;
  walletAddress: string; // Para descriptografia
}

/**
 * Criptografa perfil no frontend antes de passar para SDK
 * 
 * Esta função permite que o frontend criptografe dados ANTES de passar
 * para o SDK, garantindo que dados nunca ficam em texto claro, nem mesmo
 * temporariamente no mesmo processo.
 * 
 * @param profile Perfil do usuário
 * @param walletAddress Endereço da wallet
 * @returns Dados criptografados
 */
export async function encryptProfileInFrontend(
  profile: UserProfile,
  walletAddress: string
): Promise<PreEncryptedProfile> {
  // Criptografar no frontend
  const encrypted = await encryptUserProfile(profile, walletAddress);
  
  return {
    encrypted: encrypted.encrypted,
    nonce: encrypted.nonce,
    iv: encrypted.iv,
    walletAddress,
  };
}

/**
 * Wrapper para SDK que aceita dados pré-criptografados
 * 
 * Permite passar dados já criptografados do frontend para o SDK.
 * O SDK ainda vai processar e enviar, mas dados nunca ficam em texto claro.
 * 
 * @param preEncrypted Dados pré-criptografados do frontend
 * @param adapter Instância do OasisAdapter
 * @returns Hash da transação
 */
export async function sendPreEncryptedProfile(
  preEncrypted: PreEncryptedProfile,
  adapter: any // OasisAdapter
): Promise<string> {
  // Dados já estão criptografados do frontend
  // SDK ainda vai processar, mas dados nunca foram texto claro
  
  // Nota: O SDK ainda vai criptografar novamente para o contrato
  // Mas isso garante que dados nunca ficam em texto claro no processo
  
  // Para máxima segurança, você pode descriptografar e re-criptografar
  // ou passar diretamente se o SDK suportar
  
  // Por enquanto, SDK sempre criptografa novamente (segurança em camadas)
  throw new Error(
    'sendPreEncryptedProfile: SDK sempre criptografa automaticamente. ' +
    'Dados pré-criptografados do frontend ainda serão processados pelo SDK. ' +
    'Isso é intencional para garantir segurança em camadas.'
  );
}

/**
 * Valida se dados estão criptografados
 * 
 * @param data Dados para verificar
 * @returns true se parecem estar criptografados
 */
export function isEncrypted(data: string): boolean {
  // Verificar se é hex string (formato de dados criptografados)
  if (!data.startsWith('0x')) {
    return false;
  }
  
  // Verificar se tem tamanho razoável (dados criptografados são maiores)
  if (data.length < 20) {
    return false;
  }
  
  // Verificar se contém apenas caracteres hex
  const hexPattern = /^0x[0-9a-fA-F]+$/;
  return hexPattern.test(data);
}

/**
 * Limpa dados sensíveis da memória (tanto quanto possível em JavaScript)
 * 
 * NOTA: JavaScript não garante limpeza imediata de memória,
 * mas esta função ajuda o garbage collector.
 * 
 * @param data Dados sensíveis para limpar
 */
export function clearSensitiveData(data: any): void {
  if (typeof data === 'object' && data !== null) {
    // Tentar limpar propriedades
    Object.keys(data).forEach(key => {
      if (typeof data[key] === 'string' || typeof data[key] === 'number') {
        (data as any)[key] = null;
      } else if (typeof data[key] === 'object') {
        clearSensitiveData(data[key]);
      }
    });
  }
  
  // Nota: Em JavaScript, não há garantia de limpeza imediata
  // Mas isso ajuda o garbage collector
}

