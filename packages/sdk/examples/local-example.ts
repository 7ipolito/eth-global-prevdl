/**
 * EXEMPLO LOCAL - PREVDL SDK
 * 
 * Este exemplo mostra como usar o SDK com dados mockados
 * para desenvolvimento local SEM precisar de contratos deployed.
 */

import { PrevDLSDK } from '../src/sdk';
import { LOCAL_CONFIG } from '../src/config';
import { UserProfile, Location, Profession, Interest, Gender } from '../src/types';

async function main() {
  console.log('='.repeat(60));
  console.log('PREVDL SDK - LOCAL EXAMPLE');
  console.log('='.repeat(60));
  console.log('');

  // ============================================
  // 1. INICIALIZAR SDK EM MODO LOCAL
  // ============================================
  const sdk = new PrevDLSDK(LOCAL_CONFIG);
  console.log(`✅ SDK Mode: ${sdk.getMode()}`);
  console.log('');

  // ============================================
  // 2. LISTAR TODOS OS ANUNCIOS MOCKADOS
  // ============================================
  console.log('📋 All available ads:');
  const allAds = await sdk.getAllAds();
  allAds.forEach((ad, index) => {
    console.log(`  ${index + 1}. ${ad.title}`);
    console.log(`     Target: Age ${ad.targetAgeMin}-${ad.targetAgeMax}, ${Profession[ad.targetProfession]}, ${Interest[ad.targetInterest]}`);
    console.log(`     Stats: ${ad.impressions} impressions, ${ad.clicks} clicks`);
  });
  console.log('');

  // ============================================
  // 3. CRIAR PERFIL DE USUARIO (PRIVADO)
  // ============================================
  console.log('👤 Creating user profile:');
  const userProfile: UserProfile = {
    age: 28,
    location: Location.SAO_PAULO,
    profession: Profession.SOFTWARE_ENGINEER,
    interests: [Interest.TECH, Interest.CRYPTO, Interest.TRAVEL],
    gender: Gender.MALE
  };
  console.log(`   Age: ${userProfile.age}`);
  console.log(`   Location: ${Location[userProfile.location]}`);
  console.log(`   Profession: ${Profession[userProfile.profession]}`);
  console.log(`   Interests: ${userProfile.interests.map(i => Interest[i]).join(', ')}`);
  console.log('');

  // ============================================
  // 4. BUSCAR ANUNCIOS COMPATÍVEIS (MATCHING)
  // ============================================
  console.log('🎯 Finding matching ads for user...');
  const matchingAds = await sdk.getMatchingAds(userProfile);
  
  console.log(`✅ Found ${matchingAds.length} matching ads:`);
  matchingAds.forEach((ad, index) => {
    console.log(`  ${index + 1}. ${ad.title}`);
    console.log(`     Ranking Score: ${ad.rankingScore.toFixed(2)}`);
    console.log(`     CTA: ${ad.ctaUrl}`);
  });
  console.log('');

  // ============================================
  // 5. VERIFICAR MATCH DETALHADO DE UM ANÚNCIO
  // ============================================
  if (matchingAds.length > 0) {
    const firstAd = matchingAds[0];
    console.log(`🔍 Checking detailed match for: "${firstAd.title}"`);
    
    const matchResult = await sdk.checkAdMatch(userProfile, firstAd.id);
    console.log(`   Is Match: ${matchResult.isMatch ? '✅ YES' : '❌ NO'}`);
    console.log(`   Match Details:`);
    console.log(`     - Age: ${matchResult.matchDetails?.ageMatch ? '✅' : '❌'}`);
    console.log(`     - Location: ${matchResult.matchDetails?.locationMatch ? '✅' : '❌'}`);
    console.log(`     - Profession: ${matchResult.matchDetails?.professionMatch ? '✅' : '❌'}`);
    console.log(`     - Interest: ${matchResult.matchDetails?.interestMatch ? '✅' : '❌'}`);
    console.log(`     - Gender: ${matchResult.matchDetails?.genderMatch ? '✅' : '❌'}`);
    console.log('');

    // ============================================
    // 6. SIMULAR IMPRESSÃO
    // ============================================
    console.log(`👁️  Simulating ad impression...`);
    await sdk.recordImpression(firstAd.id, userProfile);
    console.log('');

    // ============================================
    // 7. SIMULAR CLIQUE
    // ============================================
    console.log(`🖱️  Simulating ad click...`);
    await sdk.recordClick(firstAd.id);
    console.log('');

    // ============================================
    // 8. VER ESTATÍSTICAS DA CAMPANHA
    // ============================================
    console.log(`📊 Getting campaign stats...`);
    const stats = await sdk.getCampaignStats(firstAd.id);
    console.log(`   Impressions: ${stats.impressions}`);
    console.log(`   Clicks: ${stats.clicks}`);
    console.log(`   Matches: ${stats.matches}`);
    console.log(`   Match Rate: ${stats.matchRate.toFixed(2)}%`);
    console.log(`   CTR: ${stats.ctr.toFixed(2)}%`);
    console.log('');
  }

  // ============================================
  // 9. TESTAR DIFERENTES PERFIS
  // ============================================
  console.log('🧪 Testing different user profiles:');
  const mockUsers = sdk.getMockUsers();
  
  for (const [name, profile] of Object.entries(mockUsers)) {
    const matches = await sdk.getMatchingAds(profile);
    console.log(`   ${name}: ${matches.length} matching ads`);
  }
  console.log('');

  // ============================================
  // 10. CRIAR NOVA CAMPANHA (MOCK)
  // ============================================
  console.log('🎯 Creating new campaign...');
  const newCampaignId = await sdk.createCampaign({
    title: 'Test Campaign - Web3 Event',
    description: 'Exclusive event for blockchain developers',
    ctaUrl: 'https://web3event.com',
    targetAgeMin: 25,
    targetAgeMax: 40,
    targetLocation: Location.SAO_PAULO,
    targetProfession: Profession.SOFTWARE_ENGINEER,
    targetInterest: Interest.CRYPTO,
    budgetUSDC: 1000,
    bidPerImpression: 0.02,
    bidPerClick: 0.30
  });
  console.log(`✅ Campaign created with ID: ${newCampaignId}`);
  console.log('');

  // ============================================
  // RESUMO
  // ============================================
  console.log('='.repeat(60));
  console.log('✅ LOCAL EXAMPLE COMPLETED');
  console.log('='.repeat(60));
  console.log('');
  console.log('WHAT HAPPENED:');
  console.log('- SDK initialized in LOCAL mode (no blockchain needed)');
  console.log('- Used mocked ads and user profiles');
  console.log('- Performed private matching client-side');
  console.log('- Simulated impressions and clicks');
  console.log('- Retrieved campaign statistics');
  console.log('');
  console.log('NEXT STEPS:');
  console.log('1. Run "yarn example:devnet" to test with Aztec Devnet');
  console.log('2. Deploy contracts to Aztec Devnet');
  console.log('3. Update contract addresses in config');
  console.log('');
}

main().catch(console.error);

