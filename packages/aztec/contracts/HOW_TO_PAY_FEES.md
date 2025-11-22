# 💰 Como Pagar Fees no Aztec Sandbox - PREVDL

Baseado na [documentação oficial do Aztec](https://docs.aztec.network/developers/docs/guides/js_apps/how_to_pay_fees).

## 🎯 Método Recomendado: Sponsored FPC (GRATUITO no Sandbox)

O **Sponsored FPC** é o método mais fácil para começar no sandbox. É **100% GRATUITO** e não requer fee juice.

### Como Funciona

1. **Sandbox já tem Sponsored FPC deployado** - Você não precisa fazer nada
2. **Basta registrar** o contrato Sponsored FPC no seu wallet
3. **Usar como payment method** - Todas as transações ficam grátis!

### Código no Script de Deploy

```typescript
import { SponsoredFeePaymentMethod } from "@aztec/aztec.js/fee/testing";
import { getSponsoredFPCInstance } from "../src/utils/sponsored_fpc.js";
import { SponsoredFPCContract } from "@aztec/noir-contracts.js/SponsoredFPC";

// 1. Obter instância do Sponsored FPC (já existe no sandbox)
const sponsoredFPC = await getSponsoredFPCInstance();

// 2. Registrar no wallet
await wallet.registerContract({ 
    instance: sponsoredFPC, 
    artifact: SponsoredFPCContract.artifact 
});

// 3. Criar payment method
const paymentMethod = new SponsoredFeePaymentMethod(sponsoredFPC.address);

// 4. Usar em todas as transações
await contract.deploy({
    from: accountAddress,
    fee: { paymentMethod } // ← GRATUITO!
}).send();
```

## 📋 Passo a Passo para Rodar no Sandbox

### 1. Iniciar Sandbox

```bash
cd packages/aztec/contracts
aztec sandbox
```

**Aguarde:** `Aztec Sandbox is ready!`

### 2. Compilar e Gerar Artifacts

```bash
# Em outro terminal
cd packages/aztec/contracts

# Compilar contratos
yarn compile

# Gerar TypeScript artifacts
yarn codegen
```

### 3. Deploy com Sponsored FPC

```bash
# Deploy (usa Sponsored FPC automaticamente - GRATUITO)
yarn deploy-prevdl
```

**O que acontece:**
- ✅ Wallet conecta ao sandbox
- ✅ Sponsored FPC é registrado (gratuito)
- ✅ Conta admin é deployada (sem custo)
- ✅ AdTargeting é deployado (sem custo)
- ✅ AdAuction é deployado (sem custo)

### 4. Copiar Endereços

O script salva em `config/deployed.json`:

```json
{
  "contracts": {
    "adTargeting": "0x...",
    "adAuction": "0x...",
    "admin": "0x..."
  }
}
```

### 5. Testar com SDK

```bash
cd ../../sdk

# Set environment variables
export AD_TARGETING_ADDRESS=0x...  # Do arquivo deployed.json
export AD_AUCTION_ADDRESS=0x...    # Do arquivo deployed.json
export PREVDL_MODE=sandbox

# Rodar exemplo
bun run example:sandbox
```

## 🔍 Verificar se Está Funcionando

### Check 1: Sandbox Rodando

```bash
curl http://localhost:8080/status
```

### Check 2: Sponsored FPC Disponível

O sandbox já tem Sponsored FPC. O script `getSponsoredFPCInstance()` obtém automaticamente.

### Check 3: Deploy Funcionou

```bash
cat packages/aztec/contracts/config/deployed.json
```

## 🐛 Troubleshooting

### Erro: "Insufficient fee payer balance"

**Causa:** Tentando usar Fee Juice sem ter fundos.

**Solução:** Use Sponsored FPC (já está no script)!

```typescript
// ✅ CORRETO (Sponsored FPC - grátis)
const paymentMethod = new SponsoredFeePaymentMethod(sponsoredFPC.address);

// ❌ ERRADO (precisa de fee juice)
const paymentMethod = new FeeJuicePaymentMethod(accountAddress);
```

### Erro: "Contract not registered"

**Solução:** Certifique-se que Sponsored FPC está registrado:

```typescript
await wallet.registerContract({ 
    instance: sponsoredFPC, 
    artifact: SponsoredFPCContract.artifact 
});
```

### Erro: "Could not import AdTargetingContract"

**Solução:**
```bash
yarn compile
yarn codegen
```

## 📚 Outros Métodos de Pagamento (Para Referência)

### Fee Juice (Precisa de Fundos)

Se você quiser usar Fee Juice (não recomendado para sandbox):

```typescript
import { FeeJuicePaymentMethod } from "@aztec/aztec.js";

// Precisa ter fee juice na conta primeiro!
const paymentMethod = new FeeJuicePaymentMethod(accountAddress);
```

**Para obter Fee Juice no Sandbox:**
```typescript
import { L1FeeJuicePortalManager } from "@aztec/aztec.js";

const portal = await L1FeeJuicePortalManager.new(pxe, l1Client);
const claim = await portal.bridgeTokensPublic(recipient, amount, true /* mint */);
```

### Custom FPC (Para Produção)

Para pagar com outros tokens:

```typescript
import { PublicFeePaymentMethod } from "@aztec/aztec.js";

const paymentMethod = new PublicFeePaymentMethod(fpcAddress, wallet);
```

## ✅ Resumo

**Para Sandbox (Recomendado):**
- ✅ Use **Sponsored FPC** (gratuito)
- ✅ Já está implementado no script
- ✅ Não precisa de fee juice
- ✅ Funciona imediatamente

**Para Devnet/Produção:**
- Bridge fee juice do L1
- Ou use Custom FPC com seus tokens

## 🎯 Fluxo Completo

```
1. aztec sandbox (Terminal 1 - deixar rodando)
2. yarn compile && yarn codegen (Terminal 2)
3. yarn deploy-prevdl (usa Sponsored FPC - GRATUITO)
4. Copiar endereços de config/deployed.json
5. export AD_TARGETING_ADDRESS=... (Terminal 3)
6. bun run example:sandbox
```

## 📖 Referências

- [Aztec Docs - How to Pay Fees](https://docs.aztec.network/developers/docs/guides/js_apps/how_to_pay_fees)
- [Sponsored FPC Example](https://docs.aztec.network/developers/docs/guides/js_apps/how_to_pay_fees#using-sponsored-fpc-bootstrap-method)

