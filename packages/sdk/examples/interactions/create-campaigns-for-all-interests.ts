/**
 * Script para criar campanhas para todos os interesses do perfil
 * 
 * Perfil alvo:
 * - Age: 30 years
 * - Location: BRASILIA
 * - Profession: SOFTWARE_ENGINEER
 * - Interests: TECH, TRAVEL, SPORTS
 * 
 * Cria 3 campanhas (uma para cada interesse) para garantir cobertura completa
 */

import { PrevDLAds } from '../../src/core/PrevDLAds';
import { Location, Profession, Interest, Gender } from '../../src/types';
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

async function createCampaignForInterest(
  sdk: PrevDLAds,
  interest: Interest,
  interestName: string
): Promise<number> {
  const campaignTitle = `Oferta para Software Engineers em Brasília - ${interestName}`;
  const ctaUrl = `https://example.com/software-engineer-brasilia-${interestName.toLowerCase()}`;
  const creativeHash = ethers.keccak256(ethers.toUtf8Bytes(campaignTitle + Date.now() + Math.random()));

  const targeting = {
    targetAgeMin: 30,
    targetAgeMax: 30,
    targetLocation: Location.BRASILIA,
    targetProfession: Profession.SOFTWARE_ENGINEER,
    targetInterest: interest,
    targetGender: Gender.ANY,
  };

  const budgetUSDC = 1000000;
  const dailyBudgetUSDC = 100000;
  const bidPerImpression = 1000;
  const bidPerClick = 5000;

  if (!sdk.oasisAdapter) {
    throw new Error('Oasis adapter não disponível');
  }

  console.log(`   🚀 Criando campanha para interesse ${interestName}...`);
  const campaignId = await sdk.oasisAdapter.createCampaign(
    creativeHash,
    ctaUrl,
    targeting,
    budgetUSDC,
    dailyBudgetUSDC,
    bidPerImpression,
    bidPerClick
  );

  console.log(`   ✅ Campanha ${campaignId} criada para ${interestName}`);
  return campaignId;
}

async function main() {
  console.log('='.repeat(70));
  console.log('🎯 CRIAR CAMPANHAS PARA TODOS OS INTERESSES DO PERFIL');
  console.log('='.repeat(70));
  console.log('');

  console.log('📋 Perfil alvo:');
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

  console.log('📢 Criando campanhas para cada interesse...');
  console.log('');

  const campaigns: { interest: string; id: number }[] = [];

  try {
    // Criar campanha para TECH
    const techId = await createCampaignForInterest(sdk, Interest.TECH, 'TECH');
    campaigns.push({ interest: 'TECH', id: techId });
    await new Promise(resolve => setTimeout(resolve, 2000)); // Aguardar entre transações

    // Criar campanha para TRAVEL
    const travelId = await createCampaignForInterest(sdk, Interest.TRAVEL, 'TRAVEL');
    campaigns.push({ interest: 'TRAVEL', id: travelId });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Criar campanha para SPORTS
    const sportsId = await createCampaignForInterest(sdk, Interest.SPORTS, 'SPORTS');
    campaigns.push({ interest: 'SPORTS', id: sportsId });

    console.log('');
    console.log('='.repeat(70));
    console.log('✅ TODAS AS CAMPANHAS CRIADAS COM SUCESSO!');
    console.log('='.repeat(70));
    console.log('');
    console.log('📋 Campanhas criadas:');
    campaigns.forEach(c => {
      console.log(`   - ${c.interest}: ID ${c.id}`);
    });
    console.log('');
    console.log('💡 Estas campanhas serão exibidas APENAS para usuários que:');
    console.log('   ✅ Tenham exatamente 30 anos');
    console.log('   ✅ Estejam localizados em Brasília');
    console.log('   ✅ Tenham profissão Software Engineer');
    console.log('   ✅ Tenham o interesse correspondente (TECH, TRAVEL ou SPORTS)');
    console.log('   ✅ Qualquer gênero');
    console.log('');

  } catch (error: any) {
    console.error('');
    console.error('❌ Erro ao criar campanhas:', error.message);
    console.error('');
    if (error.message.includes('insufficient funds')) {
      console.error('💡 Você precisa de ROSE na wallet para pagar o gas das transações');
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

