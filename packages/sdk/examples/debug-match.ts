/**
 * Script de debug para verificar por que um match está ocorrendo incorretamente
 * 
 * USO:
 *   cd packages/sdk
 *   npx tsx examples/debug-match.ts <campaignId> <userAddress>
 */

import { PrevDLAds } from '../src/core/PrevDLAds';
import { Location, Profession, Interest, Gender } from '../src/types';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { ethers } from 'ethers';

// Carregar variáveis de ambiente
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Configuração do contrato Oasis Sapphire
const CONTRACT_ADDRESS = '0x8a7d416E2fb2EEdC3a547Cadb3F21dD0dcFF19e0';
const RPC_URL = 'https://testnet.sapphire.oasis.io';

// Obter private key do .env
const PRIVATE_KEY = process.env.PRIVATE_KEY || process.env.VITE_PRIVATE_KEY;

if (!PRIVATE_KEY) {
  console.error('❌ PRIVATE_KEY não encontrada no .env');
  process.exit(1);
}

// Obter argumentos da linha de comando
const campaignId = process.argv[2];
const userAddress = process.argv[3];

if (!campaignId || !userAddress) {
  console.error('❌ Uso: npx tsx examples/debug-match.ts <campaignId> <userAddress>');
  process.exit(1);
}

async function main() {
  console.log('='.repeat(80));
  console.log('🔍 DEBUG DE MATCHING');
  console.log('='.repeat(80));
  console.log('');

  // Criar wallet
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log(`👤 Wallet: ${await wallet.getAddress()}`);
  console.log(`📋 Contrato: ${CONTRACT_ADDRESS}`);
  console.log(`🎯 Campanha ID: ${campaignId}`);
  console.log(`👤 Endereço do usuário: ${userAddress}`);
  console.log('');

  // Inicializar SDK
  const sdk = new PrevDLAds({
    clientId: 'debug-match',
    environment: 'sandbox',
    oasis: {
      contractAddress: CONTRACT_ADDRESS,
      rpcUrl: RPC_URL,
      wallet: wallet,
      requireEncryption: true,
    },
  });

  await sdk.initialize();
  console.log('✅ SDK inicializado!');
  console.log('');

  try {
    // 1. Buscar dados da campanha
    console.log('📢 DADOS DA CAMPANHA:');
    console.log('─'.repeat(80));
    
    if (!sdk.oasisAdapter) {
      throw new Error('OasisAdapter não inicializado');
    }

    const campaign = await sdk.oasisAdapter.getCampaign(parseInt(campaignId));
    
    console.log('   Targeting da campanha:');
    console.log(`   - targetAgeMin: ${campaign.targeting.targetAgeMin}`);
    console.log(`   - targetAgeMax: ${campaign.targeting.targetAgeMax}`);
    console.log(`   - targetLocation: ${campaign.targeting.targetLocation} (${Location[campaign.targeting.targetLocation] || 'UNKNOWN'})`);
    console.log(`   - targetProfession: ${campaign.targeting.targetProfession} (${Profession[campaign.targeting.targetProfession] || 'UNKNOWN'})`);
    console.log(`   - targetInterest: ${campaign.targeting.targetInterest} (${Interest[campaign.targeting.targetInterest] || 'UNKNOWN'})`);
    console.log(`   - targetGender: ${campaign.targeting.targetGender} (${Gender[campaign.targeting.targetGender] || 'UNKNOWN'})`);
    console.log('');

    // 2. Buscar perfil do usuário (se possível)
    console.log('👤 TENTANDO BUSCAR PERFIL DO USUÁRIO:');
    console.log('─'.repeat(80));
    
    try {
      // Tentar buscar perfil do usuário diretamente do contrato
      // Nota: Isso pode não funcionar se o perfil estiver criptografado
      const contract = sdk.oasisAdapter['contract'];
      if (contract) {
        // Tentar chamar getUserProfile (se existir)
        try {
          const profile = await contract.getUserProfile(userAddress);
          console.log('   Perfil do usuário (do contrato):');
          console.log(`   - age: ${profile.age}`);
          console.log(`   - location: ${profile.location} (${Location[profile.location] || 'UNKNOWN'})`);
          console.log(`   - profession: ${profile.profession} (${Profession[profile.profession] || 'UNKNOWN'})`);
          console.log(`   - interests: [${profile.interests.map((i: any) => `${i} (${Interest[i] || 'UNKNOWN'})`).join(', ')}]`);
          console.log(`   - gender: ${profile.gender} (${Gender[profile.gender] || 'UNKNOWN'})`);
        } catch (err: any) {
          console.log('   ⚠️  Não foi possível buscar perfil do contrato:', err.message);
          console.log('   (Isso é normal se o perfil estiver criptografado)');
        }
      }
    } catch (err: any) {
      console.log('   ⚠️  Erro ao buscar perfil:', err.message);
    }
    console.log('');

    // 3. Verificar match
    console.log('🔍 VERIFICANDO MATCH:');
    console.log('─'.repeat(80));
    
    const matchResult = await sdk.oasisAdapter.checkAdMatch(parseInt(campaignId), userAddress);
    
    console.log('   Resultado do match:');
    console.log(`   - isMatch: ${matchResult.isMatch}`);
    console.log(`   - ageMatch: ${matchResult.ageMatch}`);
    console.log(`   - locationMatch: ${matchResult.locationMatch}`);
    console.log(`   - professionMatch: ${matchResult.professionMatch}`);
    console.log(`   - interestMatch: ${matchResult.interestMatch}`);
    console.log(`   - genderMatch: ${matchResult.genderMatch}`);
    console.log('');

    // 4. Análise
    console.log('📊 ANÁLISE:');
    console.log('─'.repeat(80));
    
    if (matchResult.isMatch) {
      console.log('   ✅ MATCH DETECTADO');
      console.log('');
      
      // Verificar cada critério
      if (campaign.targeting.targetProfession === 0) {
        console.log('   ⚠️  ATENÇÃO: targetProfession = 0 (ANY) - aceita qualquer profissão');
      } else {
        console.log(`   ℹ️  targetProfession = ${campaign.targeting.targetProfession} (${Profession[campaign.targeting.targetProfession]})`);
        if (matchResult.professionMatch) {
          console.log('   ✅ professionMatch = true');
        } else {
          console.log('   ❌ professionMatch = false');
        }
      }
      
      if (campaign.targeting.targetGender === 0) {
        console.log('   ⚠️  ATENÇÃO: targetGender = 0 (ANY) - aceita qualquer gênero');
      } else {
        console.log(`   ℹ️  targetGender = ${campaign.targeting.targetGender} (${Gender[campaign.targeting.targetGender]})`);
        if (matchResult.genderMatch) {
          console.log('   ✅ genderMatch = true');
        } else {
          console.log('   ❌ genderMatch = false');
        }
      }
    } else {
      console.log('   ❌ NÃO HÁ MATCH');
      console.log('');
      console.log('   Motivos:');
      if (!matchResult.ageMatch) console.log('   - Idade não corresponde');
      if (!matchResult.locationMatch) console.log('   - Localização não corresponde');
      if (!matchResult.professionMatch) console.log('   - Profissão não corresponde');
      if (!matchResult.interestMatch) console.log('   - Interesse não corresponde');
      if (!matchResult.genderMatch) console.log('   - Gênero não corresponde');
    }

    console.log('');
    console.log('='.repeat(80));
    console.log('✅ DEBUG CONCLUÍDO');
    console.log('='.repeat(80));

  } catch (error: any) {
    console.error('');
    console.error('❌ Erro:', error.message);
    console.error('');
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

main().catch(console.error);

