# ⚡ Guia Rápido: Testar Antes de Enviar

## 🎯 Testar Criptografia Localmente (Sem TEE)

Você pode testar a criptografia **ANTES** de enviar para o contrato no TEE!

## 🚀 Uso Rápido

```typescript
import { PrevDLAds } from '@prevdl/sdk/core/PrevDLAds';
import { UserProfile, Location, Profession, Interest } from '@prevdl/sdk/types';

// 1. Criar perfil
const profile: UserProfile = {
  age: 28,
  location: Location.SAO_PAULO,
  profession: Profession.SOFTWARE_ENGINEER,
  interests: [Interest.TECH, Interest.CRYPTO],
};

// 2. Inicializar SDK
const prevdlAds = new PrevDLAds({
  clientId: 'test',
  oasis: {
    contractAddress: '0x...', // Pode ser fake para testes
    rpcUrl: 'https://testnet.sapphire.oasis.io',
    privateKey: '0x...',
  }
});

// 3. TESTAR LOCALMENTE (sem enviar)
const testResult = await prevdlAds.testEncryptionLocally(
  profile,
  '0xYourWalletAddress'
);

// 4. Ver resultado
console.log(testResult.report);

if (testResult.ready) {
  // 5. Agora sim, enviar para o contrato
  await prevdlAds.setUserProfile(profile, '0xYourWalletAddress');
}
```

## 📊 O que é Testado

✅ **Validação do perfil**
- Idade, localização, profissão, interesses

✅ **Criptografia**
- AES-256-GCM funciona
- Descriptografia funciona
- Dados correspondem após descriptografia

✅ **Preparação para contrato**
- Encoding ABI correto
- Tamanho dos dados
- Formato válido

## 💡 Vantagens

- ✅ **Sem custo**: Testes locais não custam gas
- ✅ **Rápido**: Testes instantâneos
- ✅ **Seguro**: Valida antes de enviar
- ✅ **Debugging**: Fácil identificar problemas

## 🎯 Fluxo

```
1. Criar perfil
   ↓
2. testEncryptionLocally() ← TESTA AQUI
   ↓
3. Verificar se ready === true
   ↓
4. setUserProfile() ← ENVIA PARA TEE
```

## 📚 Documentação Completa

Veja `TESTAR_ANTES_DE_ENVIAR.md` para mais detalhes.

