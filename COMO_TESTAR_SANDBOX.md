# 🧪 Como Testar PREVDL no Aztec Sandbox - Guia Completo

## 📚 Baseado na Documentação Oficial

Este guia segue a [documentação do Aztec sobre como pagar fees](https://docs.aztec.network/developers/docs/guides/js_apps/how_to_pay_fees).

## 💰 Como Pagar Fees no Sandbox

### ✅ Método: Sponsored FPC (GRATUITO)

O **Sponsored FPC** é o método mais fácil e **100% GRATUITO** no sandbox:

1. **Já existe no sandbox** - Não precisa deployar
2. **Basta registrar** no seu wallet
3. **Usar como payment method** - Todas as transações ficam grátis!

**Código (já implementado no script):**
```typescript
import { SponsoredFeePaymentMethod } from "@aztec/aztec.js/fee/testing";
import { getSponsoredFPCInstance } from "../src/utils/sponsored_fpc.js";

// 1. Obter Sponsored FPC (já existe no sandbox)
const sponsoredFPC = await getSponsoredFPCInstance();

// 2. Registrar no wallet
await wallet.registerContract({ 
    instance: sponsoredFPC, 
    artifact: SponsoredFPCContract.artifact 
});

// 3. Criar payment method
const paymentMethod = new SponsoredFeePaymentMethod(sponsoredFPC.address);

// 4. Usar em TODAS as transações (GRATUITO!)
await contract.deploy({
    from: accountAddress,
    fee: { paymentMethod } // ← Sem custo!
}).send();
```

## 🚀 Passo a Passo Completo

### PASSO 1: Iniciar Sandbox

**Terminal 1:**
```bash
cd packages/aztec/contracts
aztec sandbox
```

**Aguarde até ver:** `Aztec Sandbox is ready!`

**Verificar:**
```bash
curl http://localhost:8080/status
```

### PASSO 2: Compilar Contratos

**Terminal 2:**
```bash
cd packages/aztec/contracts

# Compilar todos os contratos
yarn compile

# Verificar se compilou
ls -la target/*.json
# Deve mostrar: PrivateVoting, AdTargeting, AdAuction
```

**Se AdTargeting/AdAuction não compilarem:**
- Verificar se arquivos existem: `ls -la src/*.nr`
- Verificar sintaxe: `aztec-nargo compile` (deve mostrar erros se houver)

### PASSO 3: Gerar TypeScript Artifacts

```bash
# Gerar wrappers TypeScript
yarn codegen

# Verificar se gerou
ls -la src/artifacts/
# Deve ter: AdTargeting.ts, AdAuction.ts
```

**Se codegen falhar:**
- Verificar se compile funcionou
- Tentar: `aztec codegen target --outdir src/artifacts` manualmente

### PASSO 4: Deploy Contratos (COM SPONSORED FPC)

```bash
# Deploy (usa Sponsored FPC automaticamente - GRATUITO!)
yarn deploy-prevdl
```

**O que acontece:**
1. ✅ Conecta ao sandbox (localhost:8080)
2. ✅ Registra Sponsored FPC (gratuito)
3. ✅ Deploy conta admin (sem custo)
4. ✅ Deploy AdTargeting (sem custo)
5. ✅ Deploy AdAuction (sem custo)
6. ✅ Salva endereços em `config/deployed.json`

**IMPORTANTE:** Copie os endereços que aparecerem!

### PASSO 5: Configurar SDK

**Terminal 3:**
```bash
cd packages/sdk

# Opção 1: Environment variables
export AD_TARGETING_ADDRESS=0x...  # Do output do deploy
export AD_AUCTION_ADDRESS=0x...    # Do output do deploy
export PREVDL_MODE=sandbox
export AZTEC_NODE_URL=http://localhost:8080

# Opção 2: Arquivo .env
cat > .env << EOF
AD_TARGETING_ADDRESS=0x...
AD_AUCTION_ADDRESS=0x...
PREVDL_MODE=sandbox
AZTEC_NODE_URL=http://localhost:8080
EOF
```

**OU ler do arquivo:**
```bash
# Endereços salvos automaticamente em:
cat ../aztec/contracts/config/deployed.json
```

### PASSO 6: Testar com SDK

```bash
cd packages/sdk

# Instalar dependências (se ainda não fez)
bun install

# Rodar exemplo sandbox
bun run example:sandbox
```

## 🔍 Verificar Cada Passo

### ✅ Sandbox Rodando?
```bash
curl http://localhost:8080/status
# Deve retornar JSON com status
```

### ✅ Contratos Compilados?
```bash
cd packages/aztec/contracts
ls -la target/*.json
# Deve ter pelo menos: PrivateVoting.json
# Idealmente também: AdTargeting.json, AdAuction.json
```

### ✅ Artifacts Gerados?
```bash
ls -la src/artifacts/
# Deve ter: AdTargeting.ts, AdAuction.ts
```

### ✅ Deploy Funcionou?
```bash
cat config/deployed.json
# Deve ter endereços dos contratos
```

### ✅ SDK Conecta?
O exemplo `sandbox-example.ts` vai mostrar:
- ✅ `Connected to Aztec node`
- ✅ `Sponsored FPC registered`
- ✅ `AdTargeting contract loaded: 0x...`
- ✅ `AdAuction contract loaded: 0x...`

## 🐛 Troubleshooting

### Erro: "Insufficient fee payer balance"

**Causa:** Tentando usar Fee Juice sem ter fundos.

**Solução:** O script já usa Sponsored FPC (gratuito). Se ainda der erro:
1. Verificar se sandbox está rodando
2. Verificar se Sponsored FPC foi registrado
3. Verificar logs do deploy

### Erro: "Could not import AdTargetingContract"

**Solução:**
```bash
cd packages/aztec/contracts
yarn compile
yarn codegen
```

### Erro: "Contract not found"

**Solução:**
1. Verificar se deploy foi feito: `yarn deploy-prevdl`
2. Verificar endereços: `cat config/deployed.json`
3. Set env vars corretamente

### Erro: "Cannot connect to Aztec node"

**Solução:**
```bash
# Verificar se sandbox está rodando
docker ps | grep aztec

# Se não estiver, iniciar:
cd packages/aztec/contracts
aztec sandbox
```

## 📊 Output Esperado

### Deploy Bem-Sucedido:
```
🚀 Deploying PREVDL contracts to Aztec...
📋 Using Sponsored FPC for fee payment (FREE in sandbox)

📡 Setting up wallet...
✅ Wallet set up

💰 Setting up Sponsored FPC (free fee payment)...
📍 Sponsored FPC address: 0x...
✅ Sponsored FPC configured (fees will be FREE)

👤 Deploying admin account with Sponsored FPC...
✅ Admin account deployed: 0x...

📦 Loading contract artifacts...
✅ AdTargeting artifact loaded
✅ AdAuction artifact loaded

🎯 Deploying AdTargeting contract...
   Using Sponsored FPC for fees (FREE in sandbox)
⏳ Waiting for deployment transaction...
✅ AdTargeting deployed: 0x1234...

💰 Deploying AdAuction contract...
   Using Sponsored FPC for fees (FREE in sandbox)
⏳ Waiting for deployment transaction...
✅ AdAuction deployed: 0x5678...

🎉 All contracts deployed successfully!
```

### SDK Bem-Sucedido:
```
============================================================
PREVDL SDK - SANDBOX EXAMPLE (Aztec Docker)
============================================================

🔍 Checking configuration...
   Aztec Node URL: http://localhost:8080
   AdTargeting Contract: 0x1234...
   AdAuction Contract: 0x5678...

🚀 Initializing SDK in SANDBOX mode...
📡 Connecting to Aztec node: http://localhost:8080
✅ Sponsored FPC registered
✅ AdTargeting contract loaded: 0x1234...
✅ AdAuction contract loaded: 0x5678...
✅ SDK initialized in DEVNET mode

👤 Creating user profile (PRIVATE DATA):
   Age: 28
   Location: SAO_PAULO
   Profession: SOFTWARE_ENGINEER
   Interests: TECH, CRYPTO, TRAVEL
   ⚠️  This data stays PRIVATE - never revealed on-chain!

🎯 Finding matching ads (PRIVATE ZK PROOF)...
✅ Found 2 matching ads:
  1. Remote Jobs for Devs - US Companies
  2. Curso de Blockchain - Web3 Brasil

🔒 Privacy Note:
   - Your age, location, profession were NEVER revealed
   - Only the match result (yes/no) is public
   - Aztec contract verified compatibility using ZK proofs
```

## 🎯 Resumo: Como Pagar Fees

**No Sandbox (Recomendado):**
- ✅ **Sponsored FPC** - 100% GRATUITO
- ✅ Já implementado no script
- ✅ Não precisa de fee juice
- ✅ Funciona imediatamente

**Código no Script:**
```typescript
// Sponsored FPC (gratuito no sandbox)
const sponsoredFPC = await getSponsoredFPCInstance();
await wallet.registerContract({ 
    instance: sponsoredFPC, 
    artifact: SponsoredFPCContract.artifact 
});
const paymentMethod = new SponsoredFeePaymentMethod(sponsoredFPC.address);

// Usar em todas as transações
await contract.deploy({
    fee: { paymentMethod } // ← GRATUITO!
}).send();
```

## 📖 Referências

- [Aztec Docs - How to Pay Fees](https://docs.aztec.network/developers/docs/guides/js_apps/how_to_pay_fees)
- [Sponsored FPC Method](https://docs.aztec.network/developers/docs/guides/js_apps/how_to_pay_fees#using-sponsored-fpc-bootstrap-method)

