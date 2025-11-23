/**
 * EXEMPLO PRÁTICO: Testar Antes de Enviar
 * 
 * Este exemplo mostra o fluxo completo de testar localmente
 * antes de enviar dados para o contrato no TEE.
 */

import { PrevDLAds } from '../src/core/PrevDLAds';
import { UserProfile, Location, Profession, Interest, Gender } from '../src/types';

async function main() {
  console.log('='.repeat(60));
  console.log('TESTE ANTES DE ENVIAR AO TEE');
  console.log('='.repeat(60));
  console.log('');

  // ============================================
  // 1. CRIAR PERFIL
  // ============================================
  console.log('📝 Passo 1: Criar perfil de teste');
  const profile: UserProfile = {
    age: 28,
    location: Location.SAO_PAULO,
    profession: Profession.SOFTWARE_ENGINEER,
    interests: [Interest.TECH, Interest.CRYPTO, Interest.GAMING],
    gender: Gender.MALE,
  };
  console.log('   ✅ Perfil criado');
  console.log(`   - Idade: ${profile.age}`);
  console.log(`   - Localização: ${Location[profile.location]}`);
  console.log(`   - Profissão: ${Profession[profile.profession]}`);
  console.log('');

  const walletAddress = '0x1234567890123456789012345678901234567890';

  // ============================================
  // 2. INICIALIZAR SDK
  // ============================================
  console.log('🔧 Passo 2: Inicializar SDK');
  const prevdlAds = new PrevDLAds({
    clientId: 'test-client',
    oasis: {
      contractAddress: '0x0000000000000000000000000000000000000000', // Fake para testes
      rpcUrl: 'https://testnet.sapphire.oasis.io',
      privateKey: '0x0000000000000000000000000000000000000000000000000000000000000001', // Fake
    }
  });
  console.log('   ✅ SDK inicializado');
  console.log('');

  // ============================================
  // 3. TESTAR CRIPTOGRAFIA LOCALMENTE
  // ============================================
  console.log('🧪 Passo 3: Testar criptografia LOCALMENTE');
  console.log('   (Sem enviar para o contrato)');
  console.log('');

  try {
    const testResult = await prevdlAds.testEncryptionLocally(profile, walletAddress);

    console.log('   📊 Resultado do Teste:');
    console.log(`   - Validação: ${testResult.validation.isValid ? '✅' : '❌'}`);
    console.log(`   - Criptografia: ${testResult.encryption.success ? '✅' : '❌'}`);
    console.log(`   - Pronto para enviar: ${testResult.ready ? '✅' : '❌'}`);
    console.log('');

    if (testResult.encryption.size) {
      console.log(`   📦 Tamanho dos dados: ${testResult.encryption.size} bytes`);
      console.log('');
    }

    // Mostrar relatório completo
    console.log('   📋 Relatório Completo:');
    console.log(testResult.report);
    console.log('');

    if (!testResult.ready) {
      console.log('   ❌ Teste falhou. Corrija os erros antes de enviar.');
      return;
    }

    // ============================================
    // 4. PREPARAR DADOS
    // ============================================
    console.log('📦 Passo 4: Preparar dados para envio');
    const prepared = await prevdlAds.prepareDataForSending(profile, walletAddress);

    if (!prepared.ready) {
      console.log('   ❌ Dados não estão prontos:');
      prepared.errors.forEach(error => {
        console.log(`      - ${error}`);
      });
      return;
    }

    console.log('   ✅ Dados preparados com sucesso!');
    console.log('   📝 Validações:');
    prepared.validation.forEach(v => {
      console.log(`      ${v}`);
    });
    console.log('');

    // ============================================
    // 5. RESUMO
    // ============================================
    console.log('='.repeat(60));
    console.log('✅ TESTE COMPLETO - DADOS PRONTOS PARA ENVIAR');
    console.log('='.repeat(60));
    console.log('');
    console.log('💡 Próximos passos:');
    console.log('   1. Faça deploy do contrato no Oasis Sapphire Testnet');
    console.log('   2. Atualize contractAddress no código');
    console.log('   3. Chame prevdlAds.setUserProfile() para enviar');
    console.log('');
    console.log('📝 Exemplo de envio:');
    console.log('   await prevdlAds.setUserProfile(profile, walletAddress);');
    console.log('');

  } catch (error: any) {
    console.log('   ❌ Erro durante teste:');
    console.log(`      ${error.message}`);
    console.log('');
  }
}

// Executar
main().catch(console.error);

