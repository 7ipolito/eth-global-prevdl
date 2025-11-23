/**
 * EXEMPLO: Testar Criptografia Antes de Enviar
 * 
 * Este exemplo mostra como testar a criptografia LOCALMENTE
 * antes de enviar dados para o contrato no TEE.
 */

import { UserProfile, Location, Profession, Interest, Gender } from '../src/types';
import {
  testEncryption,
  validateProfile,
  simulateEncryptionProcess,
  generateTestReport,
} from '../src/utils/encryption.test';
import { OasisAdapter } from '../src/core/OasisAdapter';
import { testAdapterLocally, prepareDataForSending } from '../src/core/OasisAdapter.test';

async function main() {
  console.log('='.repeat(60));
  console.log('TESTE DE CRIPTOGRAFIA - ANTES DE ENVIAR AO TEE');
  console.log('='.repeat(60));
  console.log('');

  // ============================================
  // 1. CRIAR PERFIL DE TESTE
  // ============================================
  console.log('📝 Criando perfil de teste...');
  const profile: UserProfile = {
    age: 28,
    location: Location.SAO_PAULO,
    profession: Profession.SOFTWARE_ENGINEER,
    interests: [Interest.TECH, Interest.CRYPTO, Interest.GAMING],
    gender: Gender.MALE,
  };
  console.log('   ✅ Perfil criado');
  console.log('');

  const walletAddress = '0x1234567890123456789012345678901234567890';

  // ============================================
  // 2. VALIDAR PERFIL
  // ============================================
  console.log('🔍 Validando perfil...');
  const validationErrors = validateProfile(profile);
  
  if (validationErrors.length > 0) {
    console.log('   ❌ Erros de validação:');
    validationErrors.forEach(error => {
      console.log(`      - ${error}`);
    });
    return;
  }
  console.log('   ✅ Perfil válido');
  console.log('');

  // ============================================
  // 3. TESTAR CRIPTOGRAFIA
  // ============================================
  console.log('🔐 Testando criptografia...');
  const testResult = await testEncryption(profile, walletAddress);
  
  if (!testResult.success) {
    console.log('   ❌ Teste de criptografia falhou:');
    testResult.errors.forEach(error => {
      console.log(`      - ${error}`);
    });
    return;
  }
  console.log('   ✅ Criptografia funcionando corretamente');
  console.log('');

  // ============================================
  // 4. SIMULAR PROCESSO COMPLETO
  // ============================================
  console.log('🔄 Simulando processo completo...');
  const simulation = await simulateEncryptionProcess(profile, walletAddress);
  console.log(`   ${simulation.summary}`);
  console.log('');

  if (!simulation.readyForContract) {
    console.log('   ⚠️  Dados não estão prontos para enviar');
    return;
  }

  console.log('   📊 Detalhes:');
  console.log(`      - Validação: ${simulation.validation.isValid ? '✅' : '❌'}`);
  console.log(`      - Criptografia: ${simulation.encryption.success ? '✅' : '❌'}`);
  console.log(`      - Tamanho: ${simulation.encryption.size} bytes`);
  console.log('');

  // ============================================
  // 5. GERAR RELATÓRIO COMPLETO
  // ============================================
  console.log('📋 Gerando relatório completo...');
  const report = generateTestReport(testResult);
  console.log(report);
  console.log('');

  // ============================================
  // 6. TESTAR COM ADAPTER (SEM ENVIAR)
  // ============================================
  console.log('🧪 Testando com OasisAdapter (sem enviar)...');
  
  // Criar adapter (não precisa de contrato real para testes)
  try {
    const adapter = new OasisAdapter({
      contractAddress: '0x0000000000000000000000000000000000000000', // Endereço fake
      rpcUrl: 'https://testnet.sapphire.oasis.io',
      privateKey: '0x0000000000000000000000000000000000000000000000000000000000000001', // Fake
    });

    const adapterTest = await testAdapterLocally(adapter, profile, walletAddress);
    
    console.log('   📊 Resultado:');
    console.log(`      - Validação: ${adapterTest.validation.isValid ? '✅' : '❌'}`);
    console.log(`      - Criptografia: ${adapterTest.encryption.success ? '✅' : '❌'}`);
    console.log(`      - Pronto para enviar: ${adapterTest.ready ? '✅' : '❌'}`);
    console.log('');

    // Preparar dados sem enviar
    const prepared = await prepareDataForSending(adapter, profile, walletAddress);
    
    if (prepared.ready) {
      console.log('   ✅ Dados preparados e prontos para enviar!');
      console.log('   📝 Validações:');
      prepared.validation.forEach(v => {
        console.log(`      ${v}`);
      });
      console.log('');
      console.log('   💡 Próximo passo: Chamar adapter.setUserProfile() para enviar');
    } else {
      console.log('   ❌ Dados não estão prontos:');
      prepared.errors.forEach(error => {
        console.log(`      - ${error}`);
      });
    }
  } catch (error: any) {
    console.log(`   ⚠️  Não foi possível testar adapter: ${error.message}`);
    console.log('   (Isso é normal se não houver contrato deployado)');
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('✅ TESTE COMPLETO');
  console.log('='.repeat(60));
  console.log('');
  console.log('💡 Próximos passos:');
  console.log('   1. Se todos os testes passaram, os dados estão prontos');
  console.log('   2. Faça deploy do contrato no Oasis Sapphire');
  console.log('   3. Use adapter.setUserProfile() para enviar dados reais');
  console.log('');
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

export { main };

