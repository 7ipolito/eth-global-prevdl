/**
 * EXEMPLO DEVNET - PREVDL SDK
 * 
 * Este exemplo mostra como usar o SDK conectado aos contratos
 * Aztec no Devnet (testnet pública).
 * 
 * REQUISITOS:
 * - Contratos deployed no Aztec Devnet
 * - Endereços dos contratos em variáveis de ambiente
 * - Wallet Aztec configurada
 */

import { PrevDLSDK } from '../src/sdk';
import { DEVNET_CONFIG } from '../src/config';
import { UserProfile, Location, Profession, Interest, Gender } from '../src/types';

async function main() {
  console.log('='.repeat(60));
  console.log('PREVDL SDK - DEVNET EXAMPLE');
  console.log('='.repeat(60));
  console.log('');

  // ============================================
  // VERIFICAR CONFIGURAÇÃO
  // ============================================
  console.log('🔍 Checking configuration...');
  console.log(`   Aztec Node URL: ${DEVNET_CONFIG.aztecNodeUrl}`);
  console.log(`   AdTargeting Contract: ${DEVNET_CONFIG.contracts?.adTargeting || 'NOT SET'}`);
  console.log(`   AdAuction Contract: ${DEVNET_CONFIG.contracts?.adAuction || 'NOT SET'}`);
  console.log('');

  if (!DEVNET_CONFIG.contracts?.adTargeting || !DEVNET_CONFIG.contracts?.adAuction) {
    console.log('❌ ERROR: Contract addresses not configured!');
    console.log('');
    console.log('SETUP INSTRUCTIONS:');
    console.log('1. Deploy contracts to Aztec Devnet:');
    console.log('   cd packages/aztec/contracts');
    console.log('   yarn deploy-prevdl::devnet');
    console.log('');
    console.log('2. Set environment variables:');
    console.log('   export AD_TARGETING_ADDRESS=0x...');
    console.log('   export AD_AUCTION_ADDRESS=0x...');
    console.log('');
    console.log('3. Run this example again');
    console.log('');
    return;
  }

  // ============================================
  // INICIALIZAR AZTEC WALLET
  // ============================================
  console.log('🔐 Initializing Aztec wallet...');
  
  // TODO: Implementar conexão com Aztec wallet
  // const { createAztecNodeClient } = require('@aztec/aztec.js/node');
  // const { TestWallet } = require('@aztec/test-wallet/server');
  // const node = createAztecNodeClient(DEVNET_CONFIG.aztecNodeUrl);
  // const wallet = await TestWallet.create(node);
  
  console.log('⚠️  Aztec wallet initialization not implemented yet');
  console.log('');

  // ============================================
  // INICIALIZAR SDK EM MODO DEVNET
  // ============================================
  // const sdk = new PrevDLSDK(DEVNET_CONFIG, wallet);
  // console.log(`✅ SDK initialized in ${sdk.getMode()} mode`);
  // console.log('');

  // ============================================
  // EXEMPLO DE USO (QUANDO IMPLEMENTADO)
  // ============================================
  console.log('📝 Example usage (when implemented):');
  console.log('');
  console.log('// User profile (private data)');
  console.log('const userProfile: UserProfile = {');
  console.log('  age: 28,');
  console.log('  location: Location.SAO_PAULO,');
  console.log('  profession: Profession.SOFTWARE_ENGINEER,');
  console.log('  interests: [Interest.TECH, Interest.CRYPTO]');
  console.log('};');
  console.log('');
  console.log('// Get matching ads (calls Aztec contract privately)');
  console.log('const matchingAds = await sdk.getMatchingAds(userProfile);');
  console.log('');
  console.log('// The Aztec contract verifies compatibility WITHOUT');
  console.log('// revealing user data. Only the match result is public.');
  console.log('');

  // ============================================
  // PRÓXIMOS PASSOS
  // ============================================
  console.log('='.repeat(60));
  console.log('NEXT STEPS TO ENABLE DEVNET MODE:');
  console.log('='.repeat(60));
  console.log('');
  console.log('1. Deploy Aztec Contracts:');
  console.log('   cd packages/aztec/contracts');
  console.log('   yarn compile');
  console.log('   yarn codegen');
  console.log('   yarn deploy-prevdl::devnet');
  console.log('');
  console.log('2. Save contract addresses from deployment output');
  console.log('');
  console.log('3. Update SDK config:');
  console.log('   export AD_TARGETING_ADDRESS=<address_from_step_1>');
  console.log('   export AD_AUCTION_ADDRESS=<address_from_step_1>');
  console.log('');
  console.log('4. Implement Aztec wallet integration in sdk.ts');
  console.log('');
  console.log('5. Test private matching on real Aztec Devnet!');
  console.log('');
}

main().catch(console.error);

