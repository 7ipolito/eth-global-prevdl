/**
 * Script para criar uma campanha específica para um perfil de usuário
 * 
 * Perfil alvo:
 * - Age: 30 years
 * - Location: BRASILIA
 * - Profession: SOFTWARE_ENGINEER
 * - Interests: TECH, TRAVEL, SPORTS
 * 
 * Esta campanha será compatível APENAS com usuários que tenham exatamente esse perfil
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
  console.error('   Configure PRIVATE_KEY ou VITE_PRIVATE_KEY no arquivo .env');
  process.exit(1);
}

async function main() {
  console.log('='.repeat(70));
  console.log('🎯 CRIAR CAMPANHA ESPECÍFICA PARA PERFIL DE USUÁRIO');
  console.log('='.repeat(70));
  console.log('');

  // Perfil alvo
  console.log('📋 Perfil alvo da campanha:');
  console.log('   - Idade: 30 anos');
  console.log('   - Localização: BRASILIA');
  console.log('   - Profissão: SOFTWARE_ENGINEER');
  console.log('   - Interesses: TECH, TRAVEL, SPORTS');
  console.log('   - Gênero: Qualquer (ANY)');
  console.log('');

  // Criar wallet
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const privateKey = PRIVATE_KEY as string;
  const wallet = new ethers.Wallet(privateKey, provider);
  const walletAddress = await wallet.getAddress();

  console.log(`👤 Wallet: ${walletAddress}`);
  console.log(`📋 Contrato: ${CONTRACT_ADDRESS}`);
  console.log('');

  // Inicializar SDK
  console.log('🔧 Inicializando SDK...');
  const sdk = new PrevDLAds({
    clientId: 'campaign-creator',
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

  // Configuração da campanha
  const campaignTitle = 'Oferta Especial para Software Engineers em Brasília';
  const ctaUrl = 'https://example.com/software-engineer-brasilia';
  
  // Criar hash do creative (pode ser qualquer hash único)
  const creativeHash = ethers.keccak256(ethers.toUtf8Bytes(campaignTitle + Date.now()));

  // Targeting específico para o perfil
  // IMPORTANTE: O contrato aceita apenas UM interesse por campanha
  // Vamos usar TECH (1) como interesse principal
  // Para também atingir usuários com TRAVEL ou SPORTS, seria necessário criar outras campanhas
  const targeting = {
    targetAgeMin: 30,                           // Exatamente 30 anos
    targetAgeMax: 30,                           // Exatamente 30 anos
    targetLocation: Location.BRASILIA,          // 3 - Brasília
    targetProfession: Profession.SOFTWARE_ENGINEER, // 1 - Software Engineer
    targetInterest: Interest.TECH,              // 1 - Tech (interesse principal)
    targetGender: Gender.ANY,                   // 0 - Qualquer gênero
  };

  console.log('📢 Configuração da campanha:');
  console.log(`   - Título: ${campaignTitle}`);
  console.log(`   - CTA URL: ${ctaUrl}`);
  console.log(`   - Creative Hash: ${creativeHash}`);
  console.log('');
  console.log('🎯 Targeting (critérios específicos):');
  console.log(`   - Idade: ${targeting.targetAgeMin}-${targeting.targetAgeMax} anos (exatamente 30)`);
  console.log(`   - Localização: ${Location[targeting.targetLocation]} (${targeting.targetLocation})`);
  console.log(`   - Profissão: ${Profession[targeting.targetProfession]} (${targeting.targetProfession})`);
  console.log(`   - Interesse: ${Interest[targeting.targetInterest]} (${targeting.targetInterest})`);
  console.log(`   - Gênero: ${Gender[targeting.targetGender]} (${targeting.targetGender})`);
  console.log('');
  console.log('⚠️  NOTA: Esta campanha será compatível APENAS com:');
  console.log('   - Usuários com exatamente 30 anos');
  console.log('   - Localizados em Brasília');
  console.log('   - Com profissão Software Engineer');
  console.log('   - Com interesse em TECH (interesse principal)');
  console.log('   - Qualquer gênero');
  console.log('');
  console.log('💡 Para também atingir usuários com interesse TRAVEL ou SPORTS,');
  console.log('   será necessário criar campanhas adicionais com targetInterest diferente');
  console.log('');

  // Valores de budget e bid (em menor denominação - assumindo 6 decimais para USDC)
  const budgetUSDC = 1000000;      // 1 USDC
  const dailyBudgetUSDC = 100000;  // 0.1 USDC
  const bidPerImpression = 1000;   // 0.001 USDC
  const bidPerClick = 5000;        // 0.005 USDC

  console.log('💰 Orçamento:');
  console.log(`   - Budget total: ${budgetUSDC / 1000000} USDC`);
  console.log(`   - Budget diário: ${dailyBudgetUSDC / 1000000} USDC`);
  console.log(`   - Bid por impressão: ${bidPerImpression / 1000000} USDC`);
  console.log(`   - Bid por click: ${bidPerClick / 1000000} USDC`);
  console.log('');

  try {
    console.log('🚀 Criando campanha no contrato...');
    
    if (!sdk.oasisAdapter) {
      throw new Error('Oasis adapter não disponível');
    }

    const campaignId = await sdk.oasisAdapter.createCampaign(
      creativeHash,
      ctaUrl,
      targeting,
      budgetUSDC,
      dailyBudgetUSDC,
      bidPerImpression,
      bidPerClick
    );

    console.log('');
    console.log('✅ Campanha criada com sucesso!');
    console.log(`   📋 ID da campanha: ${campaignId}`);
    console.log('');
    console.log('📊 Verificando campanha criada...');
    
    // Aguardar confirmação
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Verificar campanha
    const campaign = await sdk.getCampaign(campaignId.toString());
    console.log('   ✅ Campanha confirmada no contrato!');
    console.log(`   - CTA URL: ${campaign.ctaUrl}`);
    console.log(`   - Status: Ativa`);
    console.log('');

    // Verificar targeting da campanha
    if (sdk.oasisAdapter) {
      const campaignRaw = await sdk.oasisAdapter.getCampaign(campaignId);
      console.log('📋 Targeting da campanha criada:');
      console.log(`   - Idade: ${campaignRaw.targeting.targetAgeMin}-${campaignRaw.targeting.targetAgeMax}`);
      console.log(`   - Localização: ${campaignRaw.targeting.targetLocation} (${Location[campaignRaw.targeting.targetLocation] || 'UNKNOWN'})`);
      console.log(`   - Profissão: ${campaignRaw.targeting.targetProfession} (${Profession[campaignRaw.targeting.targetProfession] || 'UNKNOWN'})`);
      console.log(`   - Interesse: ${campaignRaw.targeting.targetInterest} (${Interest[campaignRaw.targeting.targetInterest] || 'UNKNOWN'})`);
      console.log(`   - Gênero: ${campaignRaw.targeting.targetGender} (${Gender[campaignRaw.targeting.targetGender] || 'UNKNOWN'})`);
      console.log('');
    }

    console.log('='.repeat(70));
    console.log('✅ CAMPANHA CRIADA COM SUCESSO!');
    console.log('='.repeat(70));
    console.log('');
    console.log(`📋 ID da Campanha: ${campaignId}`);
    console.log(`🔗 Explorer: https://testnet.explorer.sapphire.oasis.io/address/${CONTRACT_ADDRESS}`);
    console.log('');
    console.log('💡 Esta campanha será exibida APENAS para usuários que:');
    console.log('   ✅ Tenham exatamente 30 anos');
    console.log('   ✅ Estejam localizados em Brasília');
    console.log('   ✅ Tenham profissão Software Engineer');
    console.log('   ✅ Tenham interesse em TECH');
    console.log('   ✅ Qualquer gênero');
    console.log('');
    console.log('⚠️  IMPORTANTE: O contrato aceita apenas UM interesse por campanha.');
    console.log('   Para também atingir usuários com interesse TRAVEL ou SPORTS,');
    console.log('   será necessário criar campanhas adicionais.');
    console.log('');

  } catch (error: any) {
    console.error('');
    console.error('❌ Erro ao criar campanha:', error.message);
    console.error('');
    if (error.message.includes('insufficient funds')) {
      console.error('💡 Você precisa de ROSE na wallet para pagar o gas da transação');
      console.error(`   Wallet: ${walletAddress}`);
      console.error('   Obtenha ROSE no faucet: https://faucet.testnet.oasis.dev/');
    }
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

main().catch(console.error);

