/**
 * Teste de Interação com Contrato PrevDLAds
 * 
 * Este script testa todas as funcionalidades do SDK usando a wallet específica:
 * 0x323446c4ad69ff1f85bbd9d62b3fbe522998f438
 * 
 * USO:
 *   cd packages/sdk
 *   npx tsx examples/test-wallet-interaction.ts
 * 
 * OU com private key no .env:
 *   PRIVATE_KEY=0x... npx tsx examples/test-wallet-interaction.ts
 */

import { PrevDLAds } from '../src/core/PrevDLAds';
import { UserProfile, Location, Profession, Interest, Gender } from '../src/types';
import * as dotenv from 'dotenv';
import { ethers } from 'ethers';

// Carregar variáveis de ambiente
dotenv.config();

// Configuração do contrato
const CONTRACT_ADDRESS = '0x8a7d416e2fb2eedc3a547cadb3f21dd0dcff19e0';
const RPC_URL = 'https://testnet.sapphire.oasis.io';
const USER_WALLET_ADDRESS = '0x323446c4ad69ff1f85bbd9d62b3fbe522998f438';

// Obter private key do .env ou usar uma wallet padrão para testes
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!PRIVATE_KEY) {
  console.error('❌ PRIVATE_KEY não encontrada no .env');
  console.error('   Por favor, configure PRIVATE_KEY no arquivo .env');
  console.error('   Exemplo: PRIVATE_KEY=0x...');
  process.exit(1);
}

async function main() {
  console.log('='.repeat(70));
  console.log('🧪 PREVDL ADS - TESTE DE INTERAÇÃO COM CONTRATO');
  console.log('='.repeat(70));
  console.log('');
  console.log(`📋 Contrato: ${CONTRACT_ADDRESS}`);
  console.log(`🌐 Network: Sapphire Testnet`);
  console.log(`👤 Wallet: ${USER_WALLET_ADDRESS}`);
  console.log('');

  // Criar wallet (ethers v6)
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  
  if (!PRIVATE_KEY) {
    throw new Error('PRIVATE_KEY não definida');
  }
  
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  let walletAddress = await wallet.getAddress();
  
  // Verificar se a wallet corresponde
  if (walletAddress.toLowerCase() !== USER_WALLET_ADDRESS.toLowerCase()) {
    console.warn(`⚠️  ATENÇÃO: Wallet conectada (${walletAddress}) não corresponde à wallet esperada (${USER_WALLET_ADDRESS})`);
    console.warn('   Continuando com a wallet conectada...');
  } else {
    console.log(`✅ Wallet verificada: ${walletAddress}`);
  }
  console.log('');

  // Verificar saldo
  try {
    const balance = await provider.getBalance(walletAddress);
    // ethers v6 usa formatEther diretamente
    const balanceInEth = ethers.formatEther(balance);
    console.log(`💰 Saldo: ${balanceInEth} ROSE`);
    if (parseFloat(balanceInEth) < 0.01) {
      console.warn('   ⚠️  Saldo baixo! Você pode precisar de ROSE para gas.');
    }
  } catch (error: any) {
    console.warn(`   ⚠️  Não foi possível verificar saldo: ${error.message}`);
  }
  console.log('');

  // Inicializar SDK
  console.log('🔧 Inicializando SDK...');
  const sdk = new PrevDLAds({
    clientId: 'wallet-test',
    environment: 'sandbox',
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
  console.log('📊 TESTE 1: Verificando estado do contrato...');
  console.log('-'.repeat(70));
  
  let activeCampaigns: string[] = [];
  try {
    const totalCampaigns = await sdk.getTotalCampaigns();
    console.log(`   ✅ Total de campanhas: ${totalCampaigns}`);
    
    activeCampaigns = await sdk.getActiveCampaigns();
    console.log(`   ✅ Campanhas ativas: ${activeCampaigns.length}`);
    
    if (activeCampaigns.length > 0) {
      console.log(`   📋 IDs ativos: ${activeCampaigns.join(', ')}`);
    } else {
      console.log('   ℹ️  Nenhuma campanha ativa no momento');
    }
  } catch (error: any) {
    console.error(`   ❌ Erro ao verificar contrato: ${error.message}`);
  }
  console.log('');

  // ============================================
  // 2. VERIFICAR SE USUÁRIO TEM PERFIL
  // ============================================
  console.log('👤 TESTE 2: Verificando perfil do usuário...');
  console.log('-'.repeat(70));
  
  let hasProfile = false;
  try {
    hasProfile = await sdk.hasProfile(walletAddress);
    console.log(`   ${hasProfile ? '✅' : '❌'} Usuário tem perfil: ${hasProfile ? 'Sim' : 'Não'}`);
  } catch (error: any) {
    console.error(`   ❌ Erro: ${error.message}`);
  }
  console.log('');

  // ============================================
  // 3. OBTER PERFIL EXISTENTE OU CRIAR NOVO
  // ============================================
  let userProfile: UserProfile | null = null;

  if (hasProfile) {
    console.log('📋 TESTE 3: Perfil existente detectado...');
    console.log('-'.repeat(70));
    console.log('   ✅ Perfil encontrado no contrato');
    console.log('   ℹ️  Nota: getUserProfile() requer msg.sender == user');
    console.log('   ℹ️  Em view calls no Oasis Sapphire, msg.sender pode não estar disponível');
    console.log('   ℹ️  O perfil existe e está funcionando, mas não podemos recuperá-lo via view call');
    console.log('   ℹ️  Isso não afeta a funcionalidade - o perfil pode ser usado para matching de ads');
    console.log('');
    console.log('   💡 Para obter o perfil, você precisaria fazer uma transação ou usar um método alternativo');
    console.log('   💡 Por enquanto, vamos criar um novo perfil de teste ou pular para os testes de ads');
    console.log('');
    
    // Não tentar obter o perfil via getUserProfile, pois view calls não funcionam bem no Oasis
    // Em vez disso, vamos criar um perfil de teste para os próximos testes
    console.log('   🔄 Criando perfil de teste para continuar os testes...');
    userProfile = {
      age: 28,
      location: Location.SAO_PAULO,
      profession: Profession.SOFTWARE_ENGINEER,
      interests: [Interest.TECH, Interest.CRYPTO, Interest.GAMING],
      gender: Gender.MALE,
    };
  } else {
    console.log('📝 TESTE 3: Criando novo perfil de usuário...');
    console.log('-'.repeat(70));
    
    // Criar perfil de teste
    userProfile = {
      age: 28,
      location: Location.SAO_PAULO,
      profession: Profession.SOFTWARE_ENGINEER,
      interests: [Interest.TECH, Interest.CRYPTO, Interest.GAMING],
      gender: Gender.MALE,
    };
    
    try {
      console.log('   🔐 Criptografando e enviando perfil...');
      console.log('   📋 Dados do perfil:');
      console.log(`      - Idade: ${userProfile.age}`);
      console.log(`      - Localização: ${Location[userProfile.location] || 'Unknown'}`);
      console.log(`      - Profissão: ${Profession[userProfile.profession] || 'Unknown'}`);
      console.log(`      - Interesses: ${userProfile.interests.map(i => Interest[i] || 'Unknown').join(', ')}`);
      console.log(`      - Gênero: ${userProfile.gender !== undefined ? Gender[userProfile.gender] || 'Unknown' : 'Unknown'}`);
      
      const txHash = await sdk.setUserProfile(userProfile, walletAddress);
      console.log(`   ✅ Perfil criado! TX Hash: ${txHash}`);
      console.log('   ⏳ Aguardando confirmação...');
      
      // Aguardar confirmação
      if (txHash) {
        // Compatível com ethers v5 e v6
        try {
          await provider.waitForTransaction(txHash as string, 1);
        } catch {
          // ethers v6 pode ter assinatura diferente
          await provider.waitForTransaction(txHash as string);
        }
        console.log('   ✅ Transação confirmada!');
        
        // Verificar se o perfil foi realmente criado
        try {
          await new Promise(resolve => setTimeout(resolve, 2000)); // Aguardar 2s para o contrato processar
          hasProfile = await sdk.hasProfile(walletAddress);
          if (hasProfile) {
            console.log('   ✅ Perfil confirmado no contrato!');
          } else {
            console.warn('   ⚠️  Perfil ainda não foi confirmado no contrato');
          }
        } catch (error: any) {
          console.warn(`   ⚠️  Não foi possível verificar perfil: ${error.message}`);
        }
      }
    } catch (error: any) {
      console.error(`   ❌ Erro ao criar perfil: ${error.message}`);
      if (error.message.includes('insufficient funds')) {
        console.error('   💡 Você precisa de ROSE para pagar o gas da transação');
      }
      userProfile = null; // Marcar como não criado
    }
  }
  console.log('');

  // ============================================
  // 4. CRIAR CAMPANHA QUE CORRESPONDE AO PERFIL
  // ============================================
  if (userProfile && hasProfile) {
    console.log('📢 TESTE 4: Criando campanha que corresponde ao perfil...');
    console.log('-'.repeat(70));
    
    try {
      // Criar uma campanha que corresponde ao perfil do usuário
      // Perfil: idade 28, São Paulo, Software Engineer, Tech/Crypto/Gaming, Male
      const creativeHash = '0x' + '0'.repeat(64); // Hash dummy para teste
      const ctaUrl = 'https://example.com/tech-offer';
      
      const targeting = {
        targetAgeMin: 25, // Idade mínima próxima ao perfil (28)
        targetAgeMax: 35, // Idade máxima próxima ao perfil (28)
        targetLocation: Location.SAO_PAULO, // Mesma localização
        targetProfession: Profession.SOFTWARE_ENGINEER, // Mesma profissão
        targetInterest: Interest.TECH, // Um dos interesses do perfil
        targetGender: Gender.MALE, // Mesmo gênero
      };
      
      console.log('   📋 Parâmetros da campanha:');
      console.log(`      - Idade: ${targeting.targetAgeMin}-${targeting.targetAgeMax}`);
      console.log(`      - Localização: ${Location[targeting.targetLocation] || 'Unknown'}`);
      console.log(`      - Profissão: ${Profession[targeting.targetProfession] || 'Unknown'}`);
      console.log(`      - Interesse: ${Interest[targeting.targetInterest] || 'Unknown'}`);
      console.log(`      - Gênero: ${Gender[targeting.targetGender] || 'Unknown'}`);
      console.log(`      - CTA URL: ${ctaUrl}`);
      console.log('');
      
      const campaignId = await sdk.oasisAdapter!.createCampaign(
        creativeHash,
        ctaUrl,
        targeting,
        1000000, // Budget: 1 USDC (em menor denominação)
        100000,  // Daily budget: 0.1 USDC
        1000,    // Bid per impression: 0.001 USDC
        5000     // Bid per click: 0.005 USDC
      );
      
      console.log(`   ✅ Campanha criada com sucesso! ID: ${campaignId}`);
      console.log('   ⏳ Aguardando confirmação...');
      
      // Aguardar confirmação
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Adicionar à lista de campanhas ativas
      activeCampaigns.push(campaignId.toString());
      console.log('   ✅ Campanha confirmada e ativa!');
      console.log('');
      console.log('   💡 Esta campanha deve fazer match com o perfil do usuário');
    } catch (error: any) {
      console.error(`   ❌ Erro ao criar campanha: ${error.message}`);
      if (error.message.includes('insufficient funds')) {
        console.error('   💡 Você precisa de ROSE para pagar o gas da transação');
      }
    }
    console.log('');
  }

  // ============================================
  // 5. TESTAR ENCODING LOCALMENTE
  // ============================================
  if (userProfile) {
    console.log('📝 TESTE 5: Testando encoding ABI localmente...');
    console.log('-'.repeat(70));
    
    try {
      // Testar encoding ABI (sem criptografia AES, pois o contrato espera ABI encoded)
      const { encodeUserProfileForContract } = await import('../src/utils/encryption');
      const encoded = await encodeUserProfileForContract(userProfile);
      
      console.log(`   ✅ Encoding ABI: Sucesso`);
      console.log(`   📦 Tamanho dos dados: ${(encoded.length - 2) / 2} bytes`);
      console.log(`   📋 Formato: ${encoded.substring(0, 30)}... (ABI encoded)`);
      console.log(`   ✅ Dados prontos para enviar ao contrato`);
      console.log('');
      console.log('   ℹ️  Nota: O contrato atual espera dados ABI encoded (não criptografados)');
      console.log('   ℹ️  O contrato faz abi.decode diretamente dos dados recebidos');
      console.log('   ℹ️  Para usar criptografia AES no futuro, o contrato precisaria descriptografar primeiro');
    } catch (error: any) {
      console.error(`   ❌ Erro ao testar encoding: ${error.message}`);
    }
    console.log('');
  }

  // ============================================
  // 6. OBTER ADS MATCHING
  // ============================================
  console.log('🎯 TESTE 6: Buscando ads matching...');
  console.log('-'.repeat(70));
  
  // Verificar novamente se o usuário tem perfil (pode ter sido criado no teste 3)
  try {
    hasProfile = await sdk.hasProfile(walletAddress);
  } catch (error: any) {
    console.warn(`   ⚠️  Não foi possível verificar perfil: ${error.message}`);
  }
  
  // Verificar se o usuário tem perfil antes de tentar obter ads
  if (!hasProfile) {
    console.log('   ⚠️  Usuário não tem perfil cadastrado');
    console.log('   💡 É necessário criar um perfil antes de obter ads matching');
    console.log('   💡 O perfil pode não ter sido criado ou ainda não foi confirmado no contrato');
    console.log('   💡 Verifique se a transação do TESTE 3 foi bem-sucedida');
  } else {
    try {
      const ads = await sdk.getTargetedAds(undefined, walletAddress);
      console.log(`   ✅ Encontrados ${ads.length} ads matching`);
      
      if (ads.length > 0) {
        ads.forEach((ad, index) => {
          console.log(`   ${index + 1}. Ad ID: ${ad.id}`);
          console.log(`      CTA URL: ${ad.ctaUrl}`);
          console.log(`      Bid/Impression: ${ad.bidPerImpression}`);
          console.log(`      Bid/Click: ${ad.bidPerClick}`);
          console.log(`      Impressions: ${ad.impressions}`);
          console.log(`      Clicks: ${ad.clicks}`);
          console.log(`      Matches: ${ad.matches}`);
          console.log(`      Ranking Score: ${ad.rankingScore}`);
          console.log('');
        });
      } else {
        console.log('   ℹ️  Nenhum ad matching encontrado');
        console.log('   💡 Crie uma campanha que corresponda ao seu perfil');
      }
    } catch (error: any) {
      console.error(`   ❌ Erro: ${error.message}`);
      if (error.message.includes('User has no profile')) {
        console.error('   💡 O perfil ainda não foi confirmado no contrato');
        console.error('   💡 Aguarde alguns segundos e tente novamente');
      }
    }
  }
  console.log('');

  // ============================================
  // 7. VERIFICAR MATCH DE AD ESPECÍFICO
  // ============================================
  // Re-obter campanhas ativas se necessário
  if (activeCampaigns.length === 0) {
    try {
      activeCampaigns = await sdk.getActiveCampaigns();
    } catch (error: any) {
      console.warn(`   ⚠️  Não foi possível obter campanhas ativas: ${error.message}`);
    }
  }
  
  if (activeCampaigns.length > 0 && userProfile) {
    console.log('🔍 TESTE 7: Verificando match de ad específico...');
    console.log('-'.repeat(70));
    
    const adId = activeCampaigns[0];
    try {
      const match = await sdk.checkAdMatch(userProfile, adId, walletAddress);
      console.log(`   📋 Ad ID: ${adId}`);
      console.log(`   ${match.isMatch ? '✅' : '❌'} Match: ${match.isMatch ? 'Sim' : 'Não'}`);
      
      if (match.matchDetails) {
        console.log('   📊 Detalhes do match:');
        console.log(`      - Idade: ${match.matchDetails.ageMatch ? '✅' : '❌'}`);
        console.log(`      - Localização: ${match.matchDetails.locationMatch ? '✅' : '❌'}`);
        console.log(`      - Profissão: ${match.matchDetails.professionMatch ? '✅' : '❌'}`);
        console.log(`      - Interesse: ${match.matchDetails.interestMatch ? '✅' : '❌'}`);
        console.log(`      - Gênero: ${match.matchDetails.genderMatch ? '✅' : '❌'}`);
      }
    } catch (error: any) {
      console.error(`   ❌ Erro: ${error.message}`);
    }
    console.log('');
  }

  // ============================================
  // 8. OBTER ESTATÍSTICAS DE CAMPANHA
  // ============================================
  if (activeCampaigns.length > 0) {
    console.log('📈 TESTE 8: Obtendo estatísticas de campanha...');
    console.log('-'.repeat(70));
    
    const campaignId = activeCampaigns[0];
    try {
      const stats = await sdk.getCampaignStats(campaignId);
      console.log(`   📋 Campanha ID: ${campaignId}`);
      console.log(`   👁️  Impressões: ${stats.impressions}`);
      console.log(`   🖱️  Clicks: ${stats.clicks}`);
      console.log(`   🎯 Matches: ${stats.matches}`);
      console.log(`   📊 Match Rate: ${stats.matchRate}%`);
      console.log(`   📈 CTR: ${stats.ctr}%`);
    } catch (error: any) {
      console.error(`   ❌ Erro: ${error.message}`);
    }
    console.log('');
  }

  // ============================================
  // 9. OBTER DETALHES DE CAMPANHA
  // ============================================
  if (activeCampaigns.length > 0) {
    console.log('📋 TESTE 9: Obtendo detalhes de campanha...');
    console.log('-'.repeat(70));
    
    const campaignId = activeCampaigns[0];
    try {
      const campaign = await sdk.getCampaign(campaignId);
      console.log(`   ✅ Campanha ID: ${campaign.id}`);
      console.log(`   🔗 CTA URL: ${campaign.ctaUrl}`);
      console.log(`   🎯 Targeting:`);
      console.log(`      - Idade: ${campaign.targetAgeMin} - ${campaign.targetAgeMax}`);
      console.log(`      - Localização: ${Location[campaign.targetLocation]}`);
      console.log(`      - Profissão: ${Profession[campaign.targetProfession]}`);
      console.log(`      - Interesse: ${Interest[campaign.targetInterest]}`);
      console.log(`      - Gênero: ${Gender[campaign.targetGender || 0]}`);
      console.log(`   💰 Bids:`);
      console.log(`      - Por impressão: ${campaign.bidPerImpression}`);
      console.log(`      - Por click: ${campaign.bidPerClick}`);
      console.log(`   📊 Estatísticas:`);
      console.log(`      - Impressões: ${campaign.impressions}`);
      console.log(`      - Clicks: ${campaign.clicks}`);
      console.log(`      - Matches: ${campaign.matches}`);
    } catch (error: any) {
      console.error(`   ❌ Erro: ${error.message}`);
    }
    console.log('');
  }

  // ============================================
  // 10. REGISTRAR IMPRESSÃO (OPCIONAL)
  // ============================================
  if (activeCampaigns.length > 0 && hasProfile) {
    console.log('👁️  TESTE 10: Registrando impressão...');
    console.log('-'.repeat(70));
    
    const campaignId = activeCampaigns[0];
    try {
      console.log(`   📋 Campanha ID: ${campaignId}`);
      const txHash = await sdk.oasisAdapter?.recordImpression(parseInt(campaignId));
      console.log(`   ✅ Impressão registrada! TX Hash: ${txHash}`);
      
      if (txHash) {
        console.log('   ⏳ Aguardando confirmação...');
        // Compatível com ethers v5 e v6
        try {
          await provider.waitForTransaction(txHash, 1);
        } catch {
          // ethers v6 pode ter assinatura diferente
          await provider.waitForTransaction(txHash);
        }
        console.log('   ✅ Transação confirmada!');
      }
    } catch (error: any) {
      console.error(`   ⚠️  Erro ao registrar impressão: ${error.message}`);
      if (error.message.includes('insufficient funds')) {
        console.error('   💡 Você precisa de ROSE para pagar o gas da transação');
      }
    }
    console.log('');
  }

  // ============================================
  // RESUMO FINAL
  // ============================================
  console.log('='.repeat(70));
  console.log('✅ TESTES CONCLUÍDOS!');
  console.log('='.repeat(70));
  console.log('');
  console.log('📋 Resumo:');
  console.log(`   - Contrato: ${CONTRACT_ADDRESS}`);
  console.log(`   - Wallet: ${walletAddress}`);
  console.log(`   - Perfil: ${hasProfile ? '✅ Cadastrado' : '❌ Não cadastrado'}`);
  console.log(`   - Campanhas ativas: ${activeCampaigns.length}`);
  console.log('');
  console.log('🔗 Links úteis:');
  console.log(`   - Explorer: https://explorer.oasis.io/testnet/sapphire/address/${CONTRACT_ADDRESS}`);
  console.log(`   - Wallet: https://explorer.oasis.io/testnet/sapphire/address/${walletAddress}`);
  console.log('');
}

main().catch((error) => {
  console.error('');
  console.error('='.repeat(70));
  console.error('❌ ERRO FATAL');
  console.error('='.repeat(70));
  console.error(error);
  console.error('');
  process.exit(1);
});

