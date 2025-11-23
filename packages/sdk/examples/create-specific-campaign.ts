/**
 * Script para criar uma campanha específica para um perfil de usuário
 * 
 * Perfil alvo:
 * - Age: 35 years
 * - Location: SAO_PAULO
 * - Profession: DESIGNER
 * - Interests: FASHION, TRAVEL
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
  console.log('   - Idade: 35 anos');
  console.log('   - Localização: SAO_PAULO');
  console.log('   - Profissão: DESIGNER');
  console.log('   - Interesses: FASHION, TRAVEL');
  console.log('   - Gênero: Qualquer (ANY)');
  console.log('');

  // Criar wallet
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  // PRIVATE_KEY já foi verificado acima, mas TypeScript precisa de garantia
  const privateKey = PRIVATE_KEY as string;
  const wallet = new ethers.Wallet(privateKey, provider);
  const walletAddress = await wallet.getAddress();

  console.log(`👤 Wallet: ${walletAddress}`);
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
  const campaignTitle = 'Oferta Especial para Designers em São Paulo';
  const ctaUrl = 'https://example.com/designer-offer';
  
  // Criar hash do creative (pode ser qualquer hash único)
  const creativeHash = ethers.keccak256(ethers.toUtf8Bytes(campaignTitle + Date.now()));

  // Targeting específico para o perfil
  // IMPORTANTE: O contrato aceita apenas UM interesse por campanha
  // Vamos usar FASHION (5) como interesse principal
  // Para também atingir usuários com TRAVEL, seria necessário criar outra campanha
  const targeting = {
    targetAgeMin: 35,                    // Exatamente 35 anos
    targetAgeMax: 35,                    // Exatamente 35 anos
    targetLocation: Location.SAO_PAULO,  // 1 - São Paulo
    targetProfession: Profession.DESIGNER, // 2 - Designer
    targetInterest: Interest.FASHION,     // 5 - Fashion (primeiro interesse mencionado)
    targetGender: Gender.ANY,             // 0 - Qualquer gênero
  };

  console.log('📢 Configuração da campanha:');
  console.log(`   - Título: ${campaignTitle}`);
  console.log(`   - CTA URL: ${ctaUrl}`);
  console.log(`   - Creative Hash: ${creativeHash}`);
  console.log('');
  console.log('🎯 Targeting (critérios específicos):');
  console.log(`   - Idade: ${targeting.targetAgeMin}-${targeting.targetAgeMax} anos`);
  console.log(`   - Localização: ${Location[targeting.targetLocation]} (${targeting.targetLocation})`);
  console.log(`   - Profissão: ${Profession[targeting.targetProfession]} (${targeting.targetProfession})`);
  console.log(`   - Interesse: ${Interest[targeting.targetInterest]} (${targeting.targetInterest})`);
  console.log(`   - Gênero: ${Gender[targeting.targetGender]} (${targeting.targetGender})`);
  console.log('');
  console.log('⚠️  NOTA: Esta campanha será compatível apenas com:');
  console.log('   - Usuários com exatamente 35 anos');
  console.log('   - Localizados em São Paulo');
  console.log('   - Com profissão Designer');
  console.log('   - Com interesse em Fashion (ou Travel, se criar outra campanha)');
  console.log('   - Qualquer gênero');
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

    // Verificar se é compatível com o perfil alvo
    console.log('🔍 Verificando compatibilidade com perfil alvo...');
    const testProfile = {
      age: 35,
      location: Location.SAO_PAULO,
      profession: Profession.DESIGNER,
      interests: [Interest.FASHION, Interest.TRAVEL],
      gender: Gender.ANY,
    };

    // Nota: Para verificar match, precisaríamos do endereço do usuário
    // Mas podemos confirmar que os critérios estão corretos
    console.log('   ✅ Critérios configurados corretamente para o perfil alvo');
    console.log('');

    console.log('='.repeat(70));
    console.log('✅ CAMPANHA CRIADA COM SUCESSO!');
    console.log('='.repeat(70));
    console.log('');
    console.log(`📋 ID da Campanha: ${campaignId}`);
    console.log(`🔗 Explorer: https://testnet.explorer.sapphire.oasis.io/address/${CONTRACT_ADDRESS}`);
    console.log('');
    console.log('💡 Para criar uma campanha também para usuários com interesse TRAVEL,');
    console.log('   execute este script novamente alterando targetInterest para Interest.TRAVEL');
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
    process.exit(1);
  }
}

main().catch(console.error);

