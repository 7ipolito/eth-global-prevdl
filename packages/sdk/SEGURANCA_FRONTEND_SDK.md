# 🔐 Segurança: Frontend → SDK → Contrato

## 🤔 A Pergunta

> "Quando frontend manda os dados para o SDK (que vem como lib no node_modules), se mandar sem criptografar tem risco de interceptação?"

## 📊 Análise de Riscos

### 1. Frontend → SDK (Mesmo Processo)

```
┌─────────────────────────────────────┐
│ FRONTEND (Browser)                  │
│ ┌─────────────────────────────────┐ │
│ │ React/Vue/Angular App           │ │
│ │                                  │ │
│ │ const profile = { age: 25, ... } │ │
│ │                                  │ │
│ │ prevdlAds.setUserProfile(        │ │
│ │   profile,                       │ │ ← Dados em texto claro
│ │   walletAddress                  │ │   (mas no mesmo processo)
│ │ );                               │ │
│ └──────────────────┬────────────────┘ │
│                    │                   │
│                    ▼                   │
│ ┌─────────────────────────────────┐ │
│ │ SDK (node_modules)               │ │
│ │ - Recebe dados em texto claro    │ │
│ │ - Criptografa ANTES de enviar   │ │ ← CRIPTOGRAFIA AQUI
│ └──────────────────┬────────────────┘ │
└────────────────────┼───────────────────┘
                     │
                     ▼
```

**Risco:** ⚠️ **BAIXO** (mas existe)

**Por quê?**
- ✅ SDK roda no **mesmo processo** do frontend (mesmo JavaScript)
- ✅ Dados não saem do navegador até serem criptografados
- ⚠️ **MAS**: Dados ficam em memória em texto claro temporariamente
- ⚠️ **MAS**: Extensões do navegador podem interceptar
- ⚠️ **MAS**: DevTools podem ver dados durante debugging

### 2. SDK → Contrato (Rede)

```
┌─────────────────────────────────────┐
│ SDK (Browser)                       │
│ ┌─────────────────────────────────┐ │
│ │ Dados criptografados            │ │
│ │ encrypted = "0xabc123..."       │ │
│ └──────────────────┬────────────────┘ │
└────────────────────┼───────────────────┘
                     │
                     ▼
┌─────────────────────────────────────┐
│ INTERNET / MEMPOOL                  │
│ ⚠️  RISCO DE INTERCEPTAÇÃO          │
│ - Mempool pode ver                 │
│ - Logs RPC podem conter             │
│ - Interceptação possível             │
└──────────────────┬───────────────────┘
                     │
                     ▼
┌─────────────────────────────────────┐
│ OASIS SAPPHIRE (TEE)                │
│ ✅ Descriptografa no hardware seguro│
└─────────────────────────────────────┘
```

**Risco:** 🔴 **ALTO** se não criptografar

**Por quê?**
- ❌ Dados visíveis no mempool
- ❌ Logs de RPC contêm dados
- ❌ Interceptação possível

## 🛡️ Proteções Implementadas

### ✅ Proteção 1: SDK Sempre Criptografa

```typescript
// SDK FORÇA criptografia - não pode desabilitar
const adapter = new OasisAdapter({
  contractAddress: '0x...',
  rpcUrl: 'https://sapphire.oasis.io',
  requireEncryption: true, // ← SEMPRE true (ignorado se false)
});

// Tentar desabilitar = IGNORADO
adapter.config.requireEncryption = false; // ← Não funciona
```

### ✅ Proteção 2: Validação no SDK

```typescript
// SDK valida e criptografa automaticamente
await prevdlAds.setUserProfile(profile, walletAddress);
// ↑ Internamente:
// 1. Valida perfil
// 2. Criptografa (AES-256-GCM)
// 3. Envia dados criptografados
```

### ✅ Proteção 3: Contrato Rejeita Dados Não Criptografados

```solidity
// Método não criptografado DESABILITADO
function setUserProfile(...) external {
    revert("Use setUserProfileEncrypted() instead");
}

// Apenas método criptografado funciona
function setUserProfileEncrypted(bytes calldata encryptedData, bytes32 nonce) {
    // Processa dados criptografados
}
```

## ⚠️ Riscos que AINDA Existem

### 1. Frontend → SDK (Mesmo Processo)

**Risco:** Dados em memória em texto claro

**Cenários de Ataque:**
- Extensões maliciosas do navegador
- DevTools abertos durante desenvolvimento
- Memory dumps
- XSS (Cross-Site Scripting)

**Mitigação:**
- ✅ SDK criptografa o mais rápido possível
- ✅ Dados ficam em texto claro apenas temporariamente
- ⚠️ **Recomendação**: Criptografar no frontend também (opcional)

### 2. SDK → Contrato (Rede)

**Risco:** Interceptação em trânsito

**Cenários de Ataque:**
- Mempool exposure
- RPC node logs
- Man-in-the-middle
- DNS hijacking

**Mitigação:**
- ✅ SDK **SEMPRE** criptografa antes de enviar
- ✅ Dados no mempool são apenas bytes criptografados
- ✅ TEE descriptografa somente no hardware seguro

## 🔒 Solução: Criptografia em Duas Camadas

### Camada 1: Frontend → SDK (Opcional mas Recomendado)

```typescript
// Frontend pode criptografar antes de passar para SDK
import { encryptUserProfile } from '@prevdl/sdk/utils/encryption';

// 1. Frontend criptografa
const encrypted = await encryptUserProfile(profile, walletAddress);

// 2. Passa dados já criptografados para SDK
// (SDK ainda vai criptografar novamente, mas dados nunca ficam em texto claro)
```

### Camada 2: SDK → Contrato (Obrigatória)

```typescript
// SDK SEMPRE criptografa antes de enviar
await prevdlAds.setUserProfile(profile, walletAddress);
// ↑ Criptografa automaticamente
```

## 📊 Comparação de Riscos

| Camada | Dados em Texto Claro? | Risco | Proteção |
|--------|----------------------|-------|----------|
| **Frontend → SDK** | ⚠️ Temporariamente | ⚠️ Baixo | SDK criptografa rápido |
| **SDK → Mempool** | ❌ Não (criptografado) | ✅ Baixo | SDK sempre criptografa |
| **Mempool → TEE** | ❌ Não (criptografado) | ✅ Baixo | Dados criptografados |
| **TEE Processamento** | ✅ Sim (mas no hardware seguro) | ✅ Zero | TEE protege |

## 🎯 Recomendações

### Para Máxima Segurança:

1. **SDK sempre criptografa** ✅ (já implementado)
2. **Frontend pode criptografar também** (opcional, camada extra)
3. **Usar HTTPS** para todas as conexões
4. **Validar certificados SSL**
5. **Não expor dados em logs** do frontend

### Implementação Recomendada:

```typescript
// Frontend
const profile: UserProfile = { age: 25, ... };

// Opção 1: SDK criptografa (já implementado)
await prevdlAds.setUserProfile(profile, walletAddress);
// ✅ Seguro - SDK criptografa antes de enviar

// Opção 2: Frontend + SDK (dupla criptografia - máximo segurança)
const encrypted = await encryptUserProfile(profile, walletAddress);
// Passar encrypted para SDK (SDK ainda vai processar)
// ✅ Máxima segurança - dados nunca em texto claro
```

## 🔍 Verificação de Segurança

### Como Verificar se Está Seguro:

```typescript
// 1. Verificar se SDK está usando criptografia
if (prevdlAds.oasisAdapter?.isEncryptionRequired()) {
  console.log('✅ Criptografia obrigatória habilitada');
}

// 2. Testar localmente antes de enviar
const testResult = await prevdlAds.testEncryptionLocally(profile, walletAddress);
if (testResult.ready) {
  console.log('✅ Dados serão criptografados antes de enviar');
}

// 3. Preparar dados e verificar
const prepared = await prevdlAds.prepareDataForSending(profile, walletAddress);
if (prepared.encryptedData) {
  console.log('✅ Dados criptografados:', prepared.encryptedData.substring(0, 20) + '...');
}
```

## ✅ Conclusão

### Resposta Direta:

> "Se frontend mandar dados sem criptografar para o SDK, tem risco?"

**Resposta:**

1. **Frontend → SDK (mesmo processo):**
   - ⚠️ Risco **BAIXO** mas existe
   - Dados ficam em memória em texto claro temporariamente
   - Extensões/DevTools podem ver
   - **Mitigação**: SDK criptografa o mais rápido possível

2. **SDK → Contrato (rede):**
   - 🔴 Risco **ALTO** se não criptografar
   - **Mas**: SDK **SEMPRE** criptografa (não pode desabilitar)
   - Dados no mempool são apenas bytes criptografados
   - **Proteção**: Implementada e obrigatória

### Garantias Atuais:

- ✅ SDK **SEMPRE** criptografa antes de enviar
- ✅ Contrato **SÓ ACEITA** dados criptografados
- ✅ Não há como enviar dados não criptografados
- ✅ Dados no mempool são apenas bytes aleatórios

### Recomendação:

Para **máxima segurança**, você pode adicionar criptografia no frontend também (camada extra), mas o SDK já garante que dados são criptografados antes de sair do navegador.

---

**Status:** Sistema seguro - SDK sempre criptografa antes de enviar! 🔐

