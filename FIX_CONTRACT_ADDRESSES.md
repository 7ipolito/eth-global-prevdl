# 🔧 Corrigir Endereços dos Contratos

## ❌ Problema

O erro mostra que o contrato não foi encontrado no endereço:
```
0x2b21a86163c3bcf613c2dec5f3ff75ab09a31cf12dd71f2b0d71f3e9697a18a6
```

Mas os endereços corretos (do último deploy) são diferentes!

## ✅ Solução Rápida

### Opção 1: Script Automático (Recomendado)

```bash
# Carregar endereços automaticamente do deployed.json
source scripts/load-deployed-addresses.sh

# Agora testar SDK
cd packages/sdk
npm run example:sandbox
```

### Opção 2: Manual

```bash
# Copiar endereços do deployed.json
export AD_TARGETING_ADDRESS=0x2eccf215319ee574439064313ba513ab8193728931dbd80556621ac7d9624240
export AD_AUCTION_ADDRESS=0x211a6e27bfa16cb87fed56945cd2a958033c10aeb6b7df47c1072fff7c678282
export PREVDL_MODE=sandbox
export AZTEC_NODE_URL=http://localhost:8080

# Testar
cd packages/sdk
npm run example:sandbox
```

### Opção 3: Criar arquivo .env

No diretório `packages/sdk/`, crie um arquivo `.env`:

```env
AD_TARGETING_ADDRESS=0x2eccf215319ee574439064313ba513ab8193728931dbd80556621ac7d9624240
AD_AUCTION_ADDRESS=0x211a6e27bfa16cb87fed56945cd2a958033c10aeb6b7df47c1072fff7c678282
PREVDL_MODE=sandbox
AZTEC_NODE_URL=http://localhost:8080
```

## 🔍 Verificar Endereços Atuais

```bash
# Ver endereços do último deploy
cat packages/aztec/contracts/config/deployed.json
```

## 🚨 Se os Contratos Não Existem no Sandbox

Se mesmo com os endereços corretos ainda der erro, pode ser que:

1. **Sandbox foi reiniciado** - Os contratos foram perdidos
2. **Deploy foi feito em outro sandbox** - Endereços são de outro node

**Solução:** Fazer deploy novamente:

```bash
# 1. Certifique-se que sandbox está rodando
curl http://localhost:8080/status

# 2. Deploy novamente
cd packages/aztec/contracts
yarn deploy-prevdl

# 3. Copiar novos endereços do output
# 4. Configurar variáveis de ambiente
# 5. Testar novamente
```

## 📋 Checklist

- [ ] Sandbox está rodando (`curl http://localhost:8080/status`)
- [ ] Endereços corretos do `deployed.json`
- [ ] Variáveis de ambiente configuradas
- [ ] SDK testado com endereços corretos

