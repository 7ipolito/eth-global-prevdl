/**
 * PrevDL Ads - Encryption Utilities
 * 
 * Biblioteca para criptografar dados do usuário antes de enviar para o contrato.
 * Adiciona camada extra de segurança além da proteção do Oasis Sapphire.
 * 
 * Usa Web Crypto API (nativo do navegador) para criptografia AES-256-GCM.
 */

import type { UserProfile } from '../types';

/**
 * Interface para dados criptografados
 */
export interface EncryptedData {
  encrypted: string;  // Hex string dos dados criptografados
  nonce: string;      // Hex string do nonce usado
  iv: string;         // Hex string do initialization vector
}

/**
 * Interface para chave de criptografia derivada
 */
interface EncryptionKey {
  key: CryptoKey;
  salt: Uint8Array;
}

/**
 * Deriva uma chave de criptografia a partir do endereço da wallet
 * @param walletAddress Endereço da wallet do usuário
 * @param salt Salt adicional (opcional)
 * @returns Chave de criptografia e salt usado
 */
export async function deriveKeyFromWallet(
  walletAddress: string,
  salt?: Uint8Array
): Promise<EncryptionKey> {
  // Criar salt se não fornecido
  const keySalt = salt || crypto.getRandomValues(new Uint8Array(16));
  
  // Converter endereço para bytes
  const addressBytes = new TextEncoder().encode(walletAddress.toLowerCase());
  
  // Combinar endereço com salt
  const keyMaterial = new Uint8Array(addressBytes.length + keySalt.length);
  keyMaterial.set(addressBytes, 0);
  keyMaterial.set(keySalt, addressBytes.length);
  
  // Importar material da chave
  const keyMaterialBuffer = await crypto.subtle.importKey(
    'raw',
    keyMaterial,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  
  // Derivar chave usando PBKDF2
  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: keySalt,
      iterations: 100000, // Número de iterações (ajustável)
      hash: 'SHA-256',
    },
    keyMaterialBuffer,
    {
      name: 'AES-GCM',
      length: 256, // AES-256
    },
    false,
    ['encrypt', 'decrypt']
  );
  
  return {
    key: derivedKey,
    salt: keySalt,
  };
}

/**
 * Criptografa um perfil de usuário
 * @param profile Perfil do usuário para criptografar
 * @param walletAddress Endereço da wallet do usuário
 * @returns Dados criptografados
 */
export async function encryptUserProfile(
  profile: UserProfile,
  walletAddress: string
): Promise<EncryptedData> {
  // Validar perfil
  if (!profile.age || profile.age < 1 || profile.age > 120) {
    throw new Error('Invalid age');
  }
  
  if (!profile.interests || profile.interests.length > 3) {
    throw new Error('Invalid interests (max 3)');
  }
  
  // Serializar perfil para JSON
  const profileJson = JSON.stringify({
    age: profile.age,
    location: profile.location,
    profession: profile.profession,
    interests: profile.interests,
    gender: profile.gender || 0,
  });
  
  // Converter para bytes
  const profileBytes = new TextEncoder().encode(profileJson);
  
  // Gerar IV (Initialization Vector) aleatório
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 12 bytes para AES-GCM
  
  // Derivar chave da wallet
  const { key } = await deriveKeyFromWallet(walletAddress);
  
  // Criptografar usando AES-GCM
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
      tagLength: 128, // 128 bits para autenticação
    },
    key,
    profileBytes
  );
  
  // Converter para hex strings
  const encrypted = arrayBufferToHex(encryptedBuffer);
  const ivHex = arrayBufferToHex(iv);
  
  // Gerar nonce adicional para segurança
  const nonce = crypto.getRandomValues(new Uint8Array(32));
  const nonceHex = arrayBufferToHex(nonce);
  
  return {
    encrypted,
    nonce: nonceHex,
    iv: ivHex,
  };
}

/**
 * Descriptografa um perfil de usuário
 * @param encryptedData Dados criptografados
 * @param walletAddress Endereço da wallet do usuário
 * @returns Perfil descriptografado
 */
export async function decryptUserProfile(
  encryptedData: EncryptedData,
  walletAddress: string
): Promise<UserProfile> {
  // Converter hex strings para ArrayBuffer
  const encryptedBuffer = hexToArrayBuffer(encryptedData.encrypted);
  const iv = hexToArrayBuffer(encryptedData.iv);
  
  // Derivar chave da wallet
  const { key } = await deriveKeyFromWallet(walletAddress);
  
  // Descriptografar
  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
      tagLength: 128,
    },
    key,
    encryptedBuffer
  );
  
  // Converter bytes para string
  const decryptedJson = new TextDecoder().decode(decryptedBuffer);
  
  // Parse JSON
  const profile = JSON.parse(decryptedJson);
  
  return {
    age: profile.age,
    location: profile.location,
    profession: profile.profession,
    interests: profile.interests,
    gender: profile.gender,
  };
}

/**
 * Prepara dados para envio ao contrato (ABI encoding)
 * @param profile Perfil do usuário
 * @returns Bytes ABI encoded para o contrato
 * 
 * Nota: Esta função requer ethers.js ou similar para ABI encoding.
 * Se não disponível, use encodeUserProfileSimple.
 */
export async function encodeUserProfileForContract(profile: UserProfile): Promise<string> {
  // Garantir que interests tenha exatamente 3 elementos
  const interests: number[] = [...profile.interests];
  while (interests.length < 3) {
    interests.push(0); // Preencher com 0 (NONE)
  }
  
  // Tentar usar ethers se disponível
  try {
    const ethers = await import('ethers');
    const encoded = ethers.utils.defaultAbiCoder.encode(
      ['uint8', 'uint8', 'uint8', 'uint8[3]', 'uint8'],
      [
        profile.age,
        profile.location,
        profile.profession,
        interests.slice(0, 3),
        profile.gender || 0,
      ]
    );
    return encoded;
  } catch {
    // Fallback para encoding simples
    return encodeUserProfileSimple(profile);
  }
}

/**
 * Encoding simples sem dependência de ethers
 * @param profile Perfil do usuário
 * @returns Hex string dos dados
 */
function encodeUserProfileSimple(profile: UserProfile): string {
  const interests: number[] = [...profile.interests];
  while (interests.length < 3) {
    interests.push(0);
  }
  
  // Encoding manual: cada valor como uint8 (1 byte)
  const bytes = new Uint8Array(7); // age(1) + location(1) + profession(1) + interests[3](3) + gender(1)
  bytes[0] = profile.age;
  bytes[1] = profile.location;
  bytes[2] = profile.profession;
  bytes[3] = interests[0];
  bytes[4] = interests[1];
  bytes[5] = interests[2];
  bytes[6] = profile.gender || 0;
  
  return '0x' + arrayBufferToHex(bytes.buffer);
}

/**
 * Criptografa e prepara dados para envio ao contrato
 * @param profile Perfil do usuário
 * @param walletAddress Endereço da wallet
 * @returns Dados criptografados prontos para o contrato
 */
export async function encryptAndEncodeUserProfile(
  profile: UserProfile,
  walletAddress: string
): Promise<{
  encryptedData: string;
  nonce: string;
}> {
  // Primeiro, codificar para ABI
  const encoded = await encodeUserProfileForContract(profile);
  
  // Converter hex string para bytes
  const encodedBytes = hexToArrayBuffer(encoded.startsWith('0x') ? encoded.slice(2) : encoded);
  
  // Gerar IV
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Derivar chave
  const { key } = await deriveKeyFromWallet(walletAddress);
  
  // Criptografar
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
      tagLength: 128,
    },
    key,
    encodedBytes
  );
  
  // Gerar nonce
  const nonce = crypto.getRandomValues(new Uint8Array(32));
  
  return {
    encryptedData: '0x' + arrayBufferToHex(encryptedBuffer),
    nonce: '0x' + arrayBufferToHex(nonce),
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Converte ArrayBuffer para hex string
 */
function arrayBufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Converte hex string para ArrayBuffer
 */
function hexToArrayBuffer(hex: string): ArrayBuffer {
  // Remove '0x' se presente
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
  }
  
  return bytes.buffer;
}

/**
 * Verifica se Web Crypto API está disponível
 */
export function isEncryptionSupported(): boolean {
  return (
    typeof crypto !== 'undefined' &&
    typeof crypto.subtle !== 'undefined' &&
    typeof crypto.getRandomValues !== 'undefined'
  );
}

// Nota: ethers.js é importado dinamicamente quando necessário
// para evitar dependências obrigatórias

