# 📄 Entendendo o arquivo `deployed.json`

## ⚠️ Importante: O que este arquivo NÃO contém

O arquivo `deployed.json` **NÃO contém os contratos em si**. Ele contém apenas:

- ✅ **Endereços** dos contratos deployados
- ✅ **Metadados** (network, timestamp)
- ❌ **Código dos contratos** (não está aqui)
- ❌ **Estado dos contratos** (não está aqui)

## 📍 Onde os Contratos Realmente Estão

### Os Contratos Estão no Aztec Sandbox

```
┌─────────────────────────────────────────────┐
│  Aztec Sandbox (Docker Container)           │
│  ┌───────────────────────────────────────┐  │
│  │  Aztec Node (localhost:8080)          │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │  Blockchain State                │  │  │
│  │  │  ✅ Código dos contratos         │  │  │
│  │  │  ✅ Estado dos contratos         │  │  │
│  │  │  ✅ Transações                   │  │  │
│  │  │  ✅ Storage                      │  │  │
│  │  └─────────────────────────────────┘  │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### O arquivo `deployed.json` é apenas um registro

```
┌─────────────────────────────────────────────┐
│  Seu Computador                             │
│  ┌───────────────────────────────────────┐  │
│  │  deployed.json                        │  │
│  │  ✅ Endereço do AdTargeting           │  │
│  │  ✅ Endereço do AdAuction              │  │
│  │  ✅ Timestamp do deploy                │  │
│  │  ❌ Código (não está aqui)            │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

## 🔍 O que o arquivo contém

```json
{
  "network": "sandbox",           // Rede onde foi deployado
  "timestamp": "2025-11-22...",  // Quando foi deployado
  "contracts": {
    "adTargeting": "0x2022...",   // Endereço do contrato AdTargeting
    "adAuction": "0x2abf...",     // Endereço do contrato AdAuction
    "admin": "0x1f3e...",         // Endereço da conta admin
    "sponsoredFPC": "0x280e..."   // Endereço do Sponsored FPC
  }
}
```

## 🎯 Como Funciona

1. **Deploy**: Quando você roda `yarn deploy-prevdl`
   - Os contratos são deployados no **Aztec Sandbox** (node)
   - Os endereços são **salvos** neste arquivo para referência

2. **Uso**: Quando o SDK precisa usar os contratos
   - Lê os endereços deste arquivo (ou variáveis de ambiente)
   - Conecta ao **Aztec Sandbox**
   - Busca os contratos **pelo endereço** no node
   - Interage com os contratos que estão no node

## 💡 Analogia

É como um **catálogo telefônico**:
- O arquivo `deployed.json` = catálogo com números de telefone
- Os contratos no sandbox = as pessoas que você liga

Você precisa do catálogo para saber o número, mas a pessoa está em outro lugar!

## ✅ Como Usar os Endereços

### Opção 1: Script Automático

```bash
source scripts/load-deployed-addresses.sh
cd packages/sdk
npm run example:sandbox
```

### Opção 2: Manual

```bash
export AD_TARGETING_ADDRESS=0x202239edec2b5cdec6f23095e94c56411f242716e148c000afef989a0f925d91
export AD_AUCTION_ADDRESS=0x2abf42be358fc389c7c44f048e3d01f15fe4a1356f3e63fe0d2d665978b06f7c
export PREVDL_MODE=sandbox
export AZTEC_NODE_URL=http://localhost:8080

cd packages/sdk
npm run example:sandbox
```

## 🚨 Se o Sandbox for Reiniciado

Se você parar e reiniciar o sandbox:
- ❌ Os contratos no node são **perdidos**
- ✅ O arquivo `deployed.json` **permanece** (mas os endereços não funcionam mais)
- 🔄 Você precisa fazer **deploy novamente**

## 📋 Resumo

| Item | Onde Está |
|------|-----------|
| **Código dos contratos** | Aztec Sandbox (node) |
| **Estado dos contratos** | Aztec Sandbox (node) |
| **Endereços dos contratos** | `deployed.json` (seu computador) |
| **Metadados do deploy** | `deployed.json` (seu computador) |

## 🎯 Próximos Passos

1. Use os endereços do `deployed.json` para configurar o SDK
2. Certifique-se que o sandbox está rodando
3. O SDK vai buscar os contratos no sandbox usando esses endereços

