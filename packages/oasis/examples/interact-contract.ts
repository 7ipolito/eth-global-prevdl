/**
 * Exemplo Prático: Interagir com Contrato PrevDLAds
 * 
 * Este script mostra como manipular o contrato deployado
 * usando o SDK TypeScript.
 * 
 * USO:
 *   cd packages/oasis
 *   npx ts-node examples/interact-contract.ts
 */

import { PrevDLAds } from '../../sdk/src/core/PrevDLAds';
import { UserProfile, Location, Profession, Interest, Gender } from '../../sdk/src/types';
import { ethers } from 'ethers';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env' });

// Configuração
const CONTRACT_ADDRESS = '0x8a7d416e2fb2eedc3a547cadb3f21dd0dcff19e0';
const RPC_URL = 'https://testnet.sapphire.oasis.io';
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!PRIVATE_KEY) {
  console.error('❌ PRIVATE_KEY não encontrada no .env');
  process.exit(1);
}

async function main() {
  console.log('='.repeat(60));
  console.log('PREVDL ADS - Interação com Contrato');
  console.log('='.repeat(60));
  console.log('');
  console.log(`📋 Contrato: ${CONTRACT_ADDRESS}`);
  console.log(`🌐 Network: Sapphire Testnet`);
  console.log('');

  // Criar wallet
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const userAddress = await wallet.getAddress();
  
  console.log(`👤 Wallet: ${userAddress}`);
  console.log('');

  // Inicializar SDK
  console.log('🔧 Inicializando SDK...');
  const sdk = new PrevDLAds({
    clientId: 'interaction-example',
    oasis: {
      contractAddress: CONTRACT_ADDRESS,
      rpcUrl: RPC_URL,
      wallet: wallet,
    }
  });

  await sdk.initialize();
  console.log('✅ SDK inicializado!');
  console.log('');

  // ============================================
  // 1. VERIFICAR ESTADO DO CONTRATO
  // ============================================
  console.log('📊 Verificando estado do contrato...');
  
  try {
    const totalCampaigns = await sdk.getTotalCampaigns();
    console.log(`   Total de campanhas: ${totalCampaigns}`);
    
    const activeCampaigns = await sdk.getActiveCampaigns();
    console.log(`   Campanhas ativas: ${activeCampaigns.length}`);
    
    if (activeCampaigns.length > 0) {
      console.log(`   IDs ativos: ${activeCampaigns.join(', ')}`);
    }
  } catch (error: any) {
    console.log(`   ⚠️  Erro ao verificar: ${error.message}`);
  }
  console.log('');

  // ============================================
  // 2. VERIFICAR SE USUÁRIO TEM PERFIL
  // ============================================
  console.log('👤 Verificando perfil do usuário...');
  
  let hasProfile = false;
  try {
    hasProfile = await sdk.hasProfile(userAddress);
    console.log(`   Usuário tem perfil: ${hasProfile ? '✅ Sim' : '❌ Não'}`);
  } catch (error: any) {
    console.log(`   ⚠️  Erro: ${error.message}`);
  }
  console.log('');

  // ============================================
  // 3. CRIAR PERFIL (SE NÃO TIVER)
  // ============================================
  if (!hasProfile) {
    console.log('📝 Criando perfil de usuário...');
    
    const userProfile: UserProfile = {
      age: 28,
      location: Location.SAO_PAULO,
      profession: Profession.SOFTWARE_ENGINEER,
      interests: [Interest.TECH, Interest.CRYPTO],
      gender: Gender.MALE,
    };
    
    try {
      console.log('   🔐 Criptografando e enviando...');
      const txHash = await sdk.setUserProfile(userProfile, userAddress);
      console.log(`   ✅ Perfil criado! TX: ${txHash}`);
      console.log('   ⏳ Aguardando confirmação...');
      
      // Aguardar confirmação
      await provider.waitForTransaction(txHash as string);
      console.log('   ✅ Transação confirmada!');
    } catch (error: any) {
      console.log(`   ❌ Erro ao criar perfil: ${error.message}`);
    }
    console.log('');
  } else {
    console.log('📋 Obtendo perfil existente...');
    try {
      const profile = await sdk.getUserProfile(userAddress);
      console.log('   Perfil:', {
        age: profile.age,
        location: Location[profile.location],
        profession: Profession[profile.profession],
        interests: profile.interests.map(i => Interest[i]),
        gender: Gender[profile.gender],
      });
    } catch (error: any) {
      console.log(`   ⚠️  Erro: ${error.message}`);
    }
    console.log('');
  }

  // ============================================
  // 4. OBTER ADS MATCHING
  // ============================================
  console.log('🎯 Buscando ads matching...');
  
  try {
    const ads = await sdk.getTargetedAds(undefined, userAddress);
    console.log(`   ✅ Encontrados ${ads.length} ads matching`);
    
    if (ads.length > 0) {
      ads.forEach((ad, index) => {
        console.log(`   ${index + 1}. Ad ID: ${ad.id}`);
        console.log(`      CTA: ${ad.ctaUrl}`);
        console.log(`      Bid/Impression: ${ad.bidPerImpression}`);
        console.log(`      Bid/Click: ${ad.bidPerClick}`);
        console.log(`      Impressions: ${ad.impressions}`);
        console.log(`      Clicks: ${ad.clicks}`);
        console.log('');
      });
    } else {
      console.log('   ℹ️  Nenhum ad matching encontrado');
      console.log('   💡 Crie uma campanha que corresponda ao seu perfil');
    }
  } catch (error: any) {
    console.log(`   ⚠️  Erro: ${error.message}`);
  }
  console.log('');

  // ============================================
  // 5. VERIFICAR MATCH DE AD ESPECÍFICO
  // ============================================
  const activeCampaigns = await sdk.getActiveCampaigns();
  if (activeCampaigns.length > 0) {
    console.log('🔍 Verificando match de ad específico...');
    
    const adId = activeCampaigns[0];
    try {
      const userProfile: UserProfile = {
        age: 28,
        location: Location.SAO_PAULO,
        profession: Profession.SOFTWARE_ENGINEER,
        interests: [Interest.TECH, Interest.CRYPTO],
        gender: Gender.MALE,
      };
      
      const match = await sdk.checkAdMatch(userProfile, adId, userAddress);
      console.log(`   Ad ID: ${adId}`);
      console.log(`   Match: ${match.isMatch ? '✅ Sim' : '❌ Não'}`);
      if (match.matchDetails) {
        console.log(`   Detalhes:`);
        console.log(`     - Idade: ${match.matchDetails.ageMatch ? '✅' : '❌'}`);
        console.log(`     - Localização: ${match.matchDetails.locationMatch ? '✅' : '❌'}`);
        console.log(`     - Profissão: ${match.matchDetails.professionMatch ? '✅' : '❌'}`);
        console.log(`     - Interesse: ${match.matchDetails.interestMatch ? '✅' : '❌'}`);
        console.log(`     - Gênero: ${match.matchDetails.genderMatch ? '✅' : '❌'}`);
      }
    } catch (error: any) {
      console.log(`   ⚠️  Erro: ${error.message}`);
    }
    console.log('');
  }

  // ============================================
  // 6. OBTER ESTATÍSTICAS DE CAMPANHA
  // ============================================
  if (activeCampaigns.length > 0) {
    console.log('📈 Obtendo estatísticas de campanha...');
    
    const campaignId = activeCampaigns[0];
    try {
      const stats = await sdk.getCampaignStats(campaignId);
      console.log(`   Campanha ID: ${campaignId}`);
      console.log(`   Impressões: ${stats.impressions}`);
      console.log(`   Clicks: ${stats.clicks}`);
      console.log(`   Matches: ${stats.matches}`);
      console.log(`   Match Rate: ${stats.matchRate}%`);
      console.log(`   CTR: ${stats.ctr}%`);
    } catch (error: any) {
      console.log(`   ⚠️  Erro: ${error.message}`);
    }
    console.log('');
  }

  // ============================================
  // 7. REGISTRAR IMPRESSÃO (Exemplo)
  // ============================================
  if (activeCampaigns.length > 0 && hasProfile) {
    console.log('👁️  Registrando impressão...');
    
    const campaignId = activeCampaigns[0];
    try {
      const txHash = await sdk.oasisAdapter?.recordImpression(
        parseInt(campaignId)
      );
      console.log(`   ✅ Impressão registrada! TX: ${txHash}`);
    } catch (error: any) {
      console.log(`   ⚠️  Erro: ${error.message}`);
    }
    console.log('');
  }

  console.log('='.repeat(60));
  console.log('✅ Interação completa!');
  console.log('='.repeat(60));
}

main().catch((error) => {
  console.error('❌ Erro:', error);
  process.exit(1);
});

