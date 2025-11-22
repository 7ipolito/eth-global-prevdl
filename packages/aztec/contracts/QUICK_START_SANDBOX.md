# 🚀 Quick Start: Testar PREVDL no Sandbox

Guia rápido baseado na [documentação oficial do Aztec sobre fees](https://docs.aztec.network/developers/docs/guides/js_apps/how_to_pay_fees).

## ⚡ Comandos Rápidos (3 Terminais)

### Terminal 1: Sandbox
```bash
cd packages/aztec/contracts
aztec sandbox
# Aguarde: "Aztec Sandbox is ready!"
```

### Terminal 2: Deploy
```bash
cd packages/aztec/contracts

# Compilar
yarn compile

# Gerar artifacts
yarn codegen

# Deploy (usa Sponsored FPC - GRATUITO!)
yarn deploy-prevdl

# Copiar endereços do output ou de config/deployed.json
```

### Terminal 3: Testar
```bash
cd packages/sdk

# Set endereços (do output do Terminal 2)
export AD_TARGETING_ADDRESS=0x...
export AD_AUCTION_ADDRESS=0x...
export PREVDL_MODE=sandbox

# Rodar exemplo
bun run example:sandbox
```

## 💰 Como Funciona o Pagamento de Fees

### Sponsored FPC (Método Usado - GRATUITO)

O script `deploy_ad_contracts.ts` usa **Sponsored FPC** que é:

- ✅ **100% GRATUITO** no sandbox
- ✅ **Não precisa de fee juice**
- ✅ **Já está deployado** no sandbox
- ✅ **Basta registrar** e usar

**Código no script:**
```typescript
// 1. Obter Sponsored FPC (já existe no sandbox)
const sponsoredFPC = await getSponsoredFPCInstance();

// 2. Registrar no wallet
await wallet.registerContract({ 
    instance: sponsoredFPC, 
    artifact: SponsoredFPCContract.artifact 
});

// 3. Criar payment method
const paymentMethod = new SponsoredFeePaymentMethod(sponsoredFPC.address);

// 4. Usar em todas as transações (GRATUITO!)
await contract.deploy({
    fee: { paymentMethod } // ← Sem custo!
}).send();
```

## 🔍 Verificar se Está Funcionando

### 1. Sandbox Rodando?
```bash
curl http://localhost:8080/status
```

### 2. Contratos Compilados?
```bash
ls -la target/*.json
# Deve ter: PrivateVoting, AdTargeting, AdAuction
```

### 3. Artifacts Gerados?
```bash
ls -la src/artifacts/
# Deve ter: AdTargeting.ts, AdAuction.ts
```

### 4. Deploy Funcionou?
```bash
cat config/deployed.json
# Deve ter endereços dos contratos
```

## 🐛 Problemas Comuns

### "Insufficient fee payer balance"

**Causa:** Tentando usar Fee Juice sem ter fundos.

**Solução:** O script já usa Sponsored FPC (gratuito). Se ainda der erro, verifique:
- Sandbox está rodando?
- Sponsored FPC foi registrado?

### "Could not import AdTargetingContract"

**Solução:**
```bash
yarn compile
yarn codegen
```

### "Contract not found"

**Solução:**
1. Verificar se deploy foi feito: `yarn deploy-prevdl`
2. Verificar endereços: `cat config/deployed.json`
3. Set env vars: `export AD_TARGETING_ADDRESS=0x...`

## 📊 Output Esperado do Deploy

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

📋 Next steps:
1. Set environment variables:
   export AD_TARGETING_ADDRESS=0x1234...
   export AD_AUCTION_ADDRESS=0x5678...
```

## ✅ Checklist Completo

- [ ] Docker rodando
- [ ] Sandbox iniciado (Terminal 1)
- [ ] Contratos compilados (`yarn compile`)
- [ ] Artifacts gerados (`yarn codegen`)
- [ ] Deploy feito (`yarn deploy-prevdl`)
- [ ] Endereços copiados
- [ ] Env vars setadas
- [ ] SDK testado (`bun run example:sandbox`)

## 🎯 Próximo Passo

Depois que funcionar no sandbox:
1. Testar com diferentes perfis de usuário
2. Deploy no Devnet (testnet pública)
3. Integrar Substance Labs bridge

