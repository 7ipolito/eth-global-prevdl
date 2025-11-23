/**
 * Script para listar todas as campanhas e suas informações de segmentação
 * 
 * Este script conecta ao contrato e mostra:
 * - Total de campanhas
 * - IDs de todas as campanhas ativas
 * - Detalhes completos de cada campanha (targeting, budget, bids, stats)
 * 
 * USO:
 *   cd packages/sdk
 *   npx tsx examples/list-all-campaigns.ts
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

// Função para formatar valores de enum
function formatEnum(value: number, enumObject: any): string {
  const keys = Object.keys(enumObject).filter(k => enumObject[k] === value);
  return keys.length > 0 ? keys[0] : `Unknown (${value})`;
}

// Função para verificar se campanha é compatível com todos
function isCompatibleWithAll(targeting: any): boolean {
  return (
    targeting.targetAgeMin === 0 &&
    targeting.targetAgeMax === 0 &&
    targeting.targetLocation === 0 && // Location.ANY
    targeting.targetProfession === 0 && // Profession.ANY
    targeting.targetInterest === 0 && // Interest.NONE
    (targeting.targetGender === 0 || targeting.targetGender === undefined) // Gender.ANY
  );
}

// Função para calcular especificidade
function calculateSpecificity(targeting: any): number {
  let specificity = 0;
  
  const ageMin = Number(targeting.targetAgeMin) || 0;
  const ageMax = Number(targeting.targetAgeMax) || 0;
  const location = Number(targeting.targetLocation) || 0;
  const profession = Number(targeting.targetProfession) || 0;
  const interest = Number(targeting.targetInterest) || 0;
  const gender = Number(targeting.targetGender) || 0;

  // Idade específica
  if (ageMin !== 0 || ageMax !== 0) {
    const ageRange = ageMax - ageMin;
    if (ageRange === 0) {
      specificity += 15; // Idade exata
    } else if (ageRange <= 5) {
      specificity += 10;
    } else if (ageRange <= 10) {
      specificity += 5;
    } else {
      specificity += 2;
    }
  }

  // Outros critérios
  if (location !== 0) specificity += 5;
  if (profession !== 0) specificity += 5;
  if (interest !== 0) specificity += 5;
  if (gender !== 0) specificity += 2;

  return specificity;
}

async function main() {
  console.log('='.repeat(80));
  console.log('📋 LISTAR TODAS AS CAMPANHAS E INFORMAÇÕES DE SEGMENTAÇÃO');
  console.log('='.repeat(80));
  console.log('');

  // Criar wallet
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const privateKey = PRIVATE_KEY as string;
  const wallet = new ethers.Wallet(privateKey, provider);
  const walletAddress = await wallet.getAddress();

  console.log(`👤 Wallet: ${walletAddress}`);
  console.log(`📋 Contrato: ${CONTRACT_ADDRESS}`);
  console.log(`🌐 Network: Oasis Sapphire Testnet`);
  console.log('');

  // Inicializar SDK
  console.log('🔧 Inicializando SDK...');
  const sdk = new PrevDLAds({
    clientId: 'campaign-lister',
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
    // Obter total de campanhas
    console.log('📊 Obtendo informações do contrato...');
    const totalCampaigns = await sdk.getTotalCampaigns();
    console.log(`   Total de campanhas criadas: ${totalCampaigns}`);
    console.log('');

    // Obter campanhas ativas
    const activeCampaignIds = await sdk.getActiveCampaigns();
    console.log(`   Campanhas ativas: ${activeCampaignIds.length}`);
    console.log(`   IDs: ${activeCampaignIds.join(', ')}`);
    console.log('');

    if (activeCampaignIds.length === 0) {
      console.log('⚠️  Nenhuma campanha ativa encontrada no contrato');
      return;
    }

    console.log('='.repeat(80));
    console.log('📢 DETALHES DAS CAMPANHAS');
    console.log('='.repeat(80));
    console.log('');

    // Buscar detalhes de cada campanha
    for (let i = 0; i < activeCampaignIds.length; i++) {
      const campaignId = activeCampaignIds[i];
      console.log(`\n${'─'.repeat(80)}`);
      console.log(`📢 CAMPANHA ID: ${campaignId}`);
      console.log(`${'─'.repeat(80)}`);

      try {
        // Buscar campanha diretamente do adapter para ter acesso a todas as propriedades
        const campaignRaw = sdk.oasisAdapter 
          ? await sdk.oasisAdapter.getCampaign(parseInt(campaignId))
          : await sdk.getCampaign(campaignId);
        
        const campaign = campaignRaw as any;
        
        // Extrair targeting (pode estar em campaign.targeting ou diretamente em campaign)
        const targeting = campaign.targeting || {
          targetAgeMin: campaign.targetAgeMin || 0,
          targetAgeMax: campaign.targetAgeMax || 0,
          targetLocation: campaign.targetLocation || 0,
          targetProfession: campaign.targetProfession || 0,
          targetInterest: campaign.targetInterest || 0,
          targetGender: campaign.targetGender || 0,
        };

        // Informações básicas
        if ('advertiser' in campaign) {
          console.log(`   👤 Advertiser: ${campaign.advertiser}`);
          console.log(`   📊 Status: ${campaign.status === 1 ? 'ACTIVE' : 'INACTIVE'}`);
        }
        console.log(`   🔗 CTA URL: ${campaign.ctaUrl}`);
        console.log('');

        // Informações de segmentação (TARGETING)
        console.log('   🎯 SEGMENTAÇÃO (TARGETING):');
        console.log('   ' + '─'.repeat(76));
        
        const ageMin = Number(targeting.targetAgeMin) || 0;
        const ageMax = Number(targeting.targetAgeMax) || 0;
        const location = Number(targeting.targetLocation) || 0;
        const profession = Number(targeting.targetProfession) || 0;
        const interest = Number(targeting.targetInterest) || 0;
        const gender = Number(targeting.targetGender) || 0;

        // Idade
        if (ageMin === 0 && ageMax === 0) {
          console.log(`   📅 Idade: Qualquer (0-0) - ACEITA TODOS`);
        } else if (ageMin === ageMax) {
          console.log(`   📅 Idade: Exatamente ${ageMin} anos`);
        } else {
          console.log(`   📅 Idade: ${ageMin} a ${ageMax} anos`);
        }

        // Localização
        if (location === 0) {
          console.log(`   📍 Localização: ANY (0) - ACEITA TODOS`);
        } else {
          console.log(`   📍 Localização: ${formatEnum(location, Location)} (${location})`);
        }

        // Profissão
        if (profession === 0) {
          console.log(`   💼 Profissão: ANY (0) - ACEITA TODOS`);
        } else {
          console.log(`   💼 Profissão: ${formatEnum(profession, Profession)} (${profession})`);
        }

        // Interesse
        if (interest === 0) {
          console.log(`   ❤️  Interesse: NONE (0) - ACEITA TODOS`);
        } else {
          console.log(`   ❤️  Interesse: ${formatEnum(interest, Interest)} (${interest})`);
        }

        // Gênero
        if (gender === 0 || gender === undefined) {
          console.log(`   👥 Gênero: ANY (0) - ACEITA TODOS`);
        } else {
          console.log(`   👥 Gênero: ${formatEnum(gender, Gender)} (${gender})`);
        }

        console.log('');

        // Verificar se é compatível com todos
        const compatibleWithAll = isCompatibleWithAll(targeting);
        const specificity = calculateSpecificity(targeting);

        if (compatibleWithAll) {
          console.log('   🌍 COMPATIBILIDADE: COMPATÍVEL COM TODOS OS USUÁRIOS');
          console.log('   ⚠️  Esta campanha não tem segmentação específica');
        } else {
          console.log(`   🎯 COMPATIBILIDADE: SEGMENTAÇÃO ESPECÍFICA`);
          console.log(`   📊 Score de Especificidade: ${specificity} pontos`);
        }
        console.log('');

        // Informações de budget e bids
        if ('budgetUSDC' in campaign) {
          console.log('   💰 ORÇAMENTO E BIDS:');
          console.log('   ' + '─'.repeat(76));
          console.log(`   💵 Budget Total: ${Number(campaign.budgetUSDC) / 1000000} USDC`);
          console.log(`   📅 Budget Diário: ${Number(campaign.dailyBudgetUSDC || 0) / 1000000} USDC`);
          console.log(`   💸 Bid por Impressão: ${Number(campaign.bidPerImpression) / 1000000} USDC`);
          console.log(`   🖱️  Bid por Click: ${Number(campaign.bidPerClick) / 1000000} USDC`);
          console.log('');
        }

        // Estatísticas
        console.log('   📊 ESTATÍSTICAS:');
        console.log('   ' + '─'.repeat(76));
        console.log(`   👁️  Impressões: ${campaign.impressions || 0}`);
        console.log(`   🖱️  Clicks: ${campaign.clicks || 0}`);
        console.log(`   ✅ Matches: ${campaign.matches || 0}`);
        
        if (campaign.impressions > 0) {
          const ctr = ((campaign.clicks || 0) / campaign.impressions) * 100;
          const matchRate = ((campaign.matches || 0) / campaign.impressions) * 100;
          console.log(`   📈 CTR: ${ctr.toFixed(2)}%`);
          console.log(`   🎯 Match Rate: ${matchRate.toFixed(2)}%`);
        }
        console.log('');

      } catch (error: any) {
        console.error(`   ❌ Erro ao obter detalhes da campanha ${campaignId}:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ LISTAGEM CONCLUÍDA');
    console.log('='.repeat(80));
    console.log('');

  } catch (error: any) {
    console.error('');
    console.error('❌ Erro ao listar campanhas:', error.message);
    console.error('');
    if (error.message.includes('insufficient funds')) {
      console.error('💡 Você precisa de ROSE na wallet para pagar o gas das consultas');
      console.error(`   Wallet: ${walletAddress}`);
      console.error('   Obtenha ROSE no faucet: https://faucet.testnet.oasis.dev/');
    }
    process.exit(1);
  }
}

main().catch(console.error);

