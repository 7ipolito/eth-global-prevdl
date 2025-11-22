# 📋 Resumo: Como Testar no Sandbox com Endereços Locais

## 💰 Como Pagar Fees (Baseado na [Documentação Aztec](https://docs.aztec.network/developers/docs/guides/js_apps/how_to_pay_fees))

### ✅ Sponsored FPC (Método Usado - GRATUITO)

O script `deploy_ad_contracts.ts` **já usa Sponsored FPC** que é:

- ✅ **100% GRATUITO** no sandbox
- ✅ **Não precisa de fee juice**
- ✅ **Já está deployado** no sandbox
- ✅ **Basta registrar** e usar

**Código (já implementado):**
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

// 4. Usar em TODAS as transações (GRATUITO!)
await contract.deploy({
    from: accountAddress,
    fee: { paymentMethod } // ← Sem custo!
}).send();
```

## 🚀 Passo a Passo Rápido

### 1. Terminal 1: Sandbox
```bash
cd packages/aztec/contracts
aztec sandbox
# Aguarde: "Aztec Sandbox is ready!"
```

### 2. Terminal 2: Deploy
```bash
cd packages/aztec/contracts

# Compilar
yarn compile

# Gerar artifacts
yarn codegen

# Deploy (usa Sponsored FPC - GRATUITO!)
yarn deploy-prevdl

# COPIAR ENDEREÇOS DO OUTPUT!
# Exemplo:
# ✅ AdTargeting deployed: 0x1234...
# ✅ AdAuction deployed: 0x5678...
```

### 3. Terminal 3: Testar
```bash
cd packages/sdk

# Set endereços (do output do Terminal 2)
export AD_TARGETING_ADDRESS=0x1234...  # Do deploy
export AD_AUCTION_ADDRESS=0x5678...    # Do deploy
export PREVDL_MODE=sandbox

# Testar
bun run example:sandbox
```

## 📍 Onde Estão os Endereços?

### Opção 1: Output do Deploy
O script mostra no final:
```
✅ AdTargeting deployed: 0x1234...
✅ AdAuction deployed: 0x5678...
```

### Opção 2: Arquivo Salvo
```bash
cat packages/aztec/contracts/config/deployed.json
```

Exemplo:
```json
{
  "contracts": {
    "adTargeting": "0x1234...",
    "adAuction": "0x5678...",
    "admin": "0x..."
  }
}
```

### Opção 3: Script Automático
```bash
# Extrair endereços automaticamente
cd packages/aztec/contracts
AD_TARGETING=$(cat config/deployed.json | grep -o '"adTargeting": "[^"]*"' | cut -d'"' -f4)
AD_AUCTION=$(cat config/deployed.json | grep -o '"adAuction": "[^"]*"' | cut -d'"' -f4)

export AD_TARGETING_ADDRESS=$AD_TARGETING
export AD_AUCTION_ADDRESS=$AD_AUCTION
export PREVDL_MODE=sandbox

cd ../../sdk
bun run example:sandbox
```

## 🔍 Verificar se Funcionou

### Check 1: Sandbox
```bash
curl http://localhost:8080/status
```

### Check 2: Deploy
```bash
cat packages/aztec/contracts/config/deployed.json
```

### Check 3: SDK
O exemplo deve mostrar:
- ✅ `Connected to Aztec node`
- ✅ `AdTargeting contract loaded: 0x...`
- ✅ `AdAuction contract loaded: 0x...`
- ✅ `Found X matching ads`

## 🐛 Problemas Comuns

### "Insufficient fee payer balance"
**Solução:** O script já usa Sponsored FPC (gratuito). Se ainda der erro:
- Verificar se sandbox está rodando
- Verificar se Sponsored FPC foi registrado

### "Could not import AdTargetingContract"
**Solução:**
```bash
yarn compile
yarn codegen
```

### "Contract not found"
**Solução:**
1. Verificar deploy: `yarn deploy-prevdl`
2. Verificar endereços: `cat config/deployed.json`
3. Set env vars corretamente

## ✅ Checklist

- [ ] Sandbox rodando (Terminal 1)
- [ ] Contratos compilados (`yarn compile`)
- [ ] Artifacts gerados (`yarn codegen`)
- [ ] Deploy feito (`yarn deploy-prevdl`)
- [ ] Endereços copiados
- [ ] Env vars setadas
- [ ] SDK testado (`bun run example:sandbox`)

## 🎯 Próximos Passos

Depois que funcionar:
1. Testar com diferentes perfis de usuário
2. Deploy no Devnet (testnet pública)
3. Integrar Substance Labs bridge (Polygon → Aztec)

