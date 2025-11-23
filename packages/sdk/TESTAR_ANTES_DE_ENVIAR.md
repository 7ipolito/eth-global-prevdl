# 🧪 Como Testar Antes de Enviar ao TEE

## 🎯 Objetivo

Testar e validar a criptografia **LOCALMENTE** antes de enviar dados para o contrato no TEE. Isso permite:
- ✅ Validar dados antes de enviar
- ✅ Testar criptografia sem custo de gas
- ✅ Verificar se tudo está funcionando corretamente
- ✅ Debugging mais fácil

## 📋 Métodos Disponíveis

### 1. Testar Criptografia Básica

```typescript
import { testEncryption, generateTestReport } from '@prevdl/sdk/utils/encryption.test';
import { UserProfile, Location, Profession, Interest } from '@prevdl/sdk/types';

const profile: UserProfile = {
  age: 28,
  location: Location.SAO_PAULO,
  profession: Profession.SOFTWARE_ENGINEER,
  interests: [Interest.TECH, Interest.CRYPTO],
};

const walletAddress = '0xYourWalletAddress';

// Testar criptografia
const result = await testEncryption(profile, walletAddress);

// Ver resultado
console.log(result.success ? '✅ Sucesso' : '❌ Falha');
console.log(generateTestReport(result));
```

### 2. Validar Perfil

```typescript
import { validateProfile } from '@prevdl/sdk/utils/encryption.test';

const errors = validateProfile(profile);

if (errors.length > 0) {
  console.log('❌ Erros de validação:');
  errors.forEach(error => console.log(`  - ${error}`));
} else {
  console.log('✅ Perfil válido!');
}
```

### 3. Simular Processo Completo

```typescript
import { simulateEncryptionProcess } from '@prevdl/sdk/utils/encryption.test';

const simulation = await simulateEncryptionProcess(profile, walletAddress);

console.log(simulation.summary);
// ✅ Perfil validado e criptografado com sucesso! Pronto para enviar ao contrato.

if (simulation.readyForContract) {
  console.log('✅ Dados prontos para enviar!');
  console.log(`Tamanho: ${simulation.encryption.size} bytes`);
}
```

### 4. Testar com OasisAdapter (Recomendado)

```typescript
import { OasisAdapter } from '@prevdl/sdk/core/OasisAdapter';
import { PrevDLAds } from '@prevdl/sdk/core/PrevDLAds';

// Criar adapter
const prevdlAds = new PrevDLAds({
  clientId: 'test',
  oasis: {
    contractAddress: '0x...', // Pode ser endereço fake para testes
    rpcUrl: 'https://testnet.sapphire.oasis.io',
    privateKey: '0x...',
  }
});

// Testar LOCALMENTE (sem enviar)
const testResult = await prevdlAds.oasisAdapter.testEncryptionLocally(
  profile,
  walletAddress
);

console.log(testResult.report);
// Relatório completo com todos os detalhes

if (testResult.ready) {
  console.log('✅ Tudo pronto! Pode enviar agora.');
  
  // Agora sim, enviar para o contrato
  await prevdlAds.setUserProfile(profile, walletAddress);
}
```

### 5. Preparar Dados Sem Enviar

```typescript
// Preparar dados sem fazer transação
const prepared = await adapter.prepareDataForSending(profile, walletAddress);

if (prepared.ready) {
  console.log('✅ Dados preparados:');
  prepared.validation.forEach(v => console.log(`  ${v}`));
  console.log(`Encrypted: ${prepared.encryptedData?.substring(0, 20)}...`);
  console.log(`Nonce: ${prepared.nonce?.substring(0, 20)}...`);
  
  // Agora pode enviar com confiança
} else {
  console.log('❌ Erros:');
  prepared.errors.forEach(e => console.log(`  - ${e}`));
}
```

## 🚀 Exemplo Completo

```typescript
import { PrevDLAds } from '@prevdl/sdk/core/PrevDLAds';
import { UserProfile, Location, Profession, Interest } from '@prevdl/sdk/types';

async function testBeforeSending() {
  // 1. Criar perfil
  const profile: UserProfile = {
    age: 28,
    location: Location.SAO_PAULO,
    profession: Profession.SOFTWARE_ENGINEER,
    interests: [Interest.TECH, Interest.CRYPTO],
  };

  const walletAddress = '0xYourWalletAddress';

  // 2. Inicializar SDK
  const prevdlAds = new PrevDLAds({
    clientId: 'test',
    oasis: {
      contractAddress: '0xYourContractAddress',
      rpcUrl: 'https://testnet.sapphire.oasis.io',
      privateKey: process.env.PRIVATE_KEY!,
    }
  });

  // 3. TESTAR ANTES DE ENVIAR
  console.log('🧪 Testando criptografia localmente...');
  
  const testResult = await prevdlAds.oasisAdapter.testEncryptionLocally(
    profile,
    walletAddress
  );

  // 4. Ver resultado
  console.log(testResult.report);

  if (!testResult.ready) {
    console.log('❌ Teste falhou. Corrija os erros antes de enviar.');
    return;
  }

  // 5. Preparar dados
  console.log('📦 Preparando dados...');
  const prepared = await prevdlAds.oasisAdapter.prepareDataForSending(
    profile,
    walletAddress
  );

  if (!prepared.ready) {
    console.log('❌ Dados não estão prontos:', prepared.errors);
    return;
  }

  // 6. AGORA SIM, enviar para o contrato
  console.log('✅ Tudo validado! Enviando para o contrato...');
  const txHash = await prevdlAds.setUserProfile(profile, walletAddress);
  console.log(`✅ Enviado! TX: ${txHash}`);
}

testBeforeSending();
```

## 📊 O que é Testado

### Validação
- ✅ Idade válida (1-120)
- ✅ Localização válida
- ✅ Profissão válida
- ✅ Interesses válidos (1-3)
- ✅ Gênero válido (opcional)

### Criptografia
- ✅ Criptografia AES-256-GCM funciona
- ✅ Descriptografia funciona corretamente
- ✅ Dados descriptografados correspondem aos originais
- ✅ Encoding ABI funciona
- ✅ Dados prontos para contrato

### Preparação
- ✅ Tamanho dos dados
- ✅ Formato correto
- ✅ Nonce gerado
- ✅ IV gerado

## 🎯 Fluxo Recomendado

```
1. Criar perfil
   ↓
2. Validar perfil (validateProfile)
   ↓
3. Testar criptografia (testEncryption)
   ↓
4. Preparar dados (prepareDataForSending)
   ↓
5. Verificar se está pronto
   ↓
6. ENVIAR para contrato (setUserProfile)
```

## 💡 Vantagens

- ✅ **Sem custo**: Testes locais não custam gas
- ✅ **Rápido**: Testes instantâneos
- ✅ **Seguro**: Valida antes de enviar
- ✅ **Debugging**: Fácil identificar problemas
- ✅ **Confiança**: Sabe que dados estão corretos antes de enviar

## 🚀 Executar Exemplo

```bash
# Executar exemplo de teste
cd packages/sdk
ts-node examples/test-encryption.ts
```

## 📚 API Reference

### `testEncryption(profile, walletAddress)`
Testa criptografia completa e retorna resultado detalhado.

### `validateProfile(profile)`
Valida perfil e retorna array de erros (vazio se válido).

### `simulateEncryptionProcess(profile, walletAddress)`
Simula processo completo e retorna se está pronto para contrato.

### `adapter.testEncryptionLocally(profile, walletAddress)`
Testa com adapter (recomendado).

### `adapter.prepareDataForSending(profile, walletAddress)`
Prepara dados sem enviar.

---

**Agora você pode testar tudo localmente antes de enviar para o TEE!** 🎉

