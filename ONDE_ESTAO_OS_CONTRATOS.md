# 📍 Onde Estão os Contratos Deployados?

## 🎯 Resposta Rápida

No **Aztec Sandbox**, os contratos deployados **não ficam em arquivos** - eles ficam **armazenados no próprio node Aztec** que está rodando no Docker.

## 📦 Onde os Contratos Estão?

### 1. **No Node Aztec (Sandbox)**
- Os contratos são armazenados no estado do blockchain Aztec
- Ficam no container Docker do sandbox
- Persistem enquanto o sandbox estiver rodando
- **Se você reiniciar o sandbox, os contratos são perdidos!**

### 2. **Arquivo `deployed.json` (Metadados)**
- Este arquivo é criado pelo script de deploy
- Contém apenas os **endereços** dos contratos deployados
- Localização: `packages/aztec/contracts/config/deployed.json`
- **Não contém os contratos em si**, apenas referências

## 🔍 Como Verificar Contratos Deployados

### Opção 1: Listar informações do node

```bash
cd packages/aztec/contracts
yarn list-contracts
```

### Opção 2: Verificar arquivo deployed.json

```bash
cat packages/aztec/contracts/config/deployed.json
```

### Opção 3: Verificar contrato específico

```bash
cd packages/aztec/contracts
yarn check-contract <endereço>
```

### Opção 4: Ver status do sandbox

```bash
curl http://localhost:8080/status
```

## 🚨 Se o arquivo `deployed.json` não existe

Isso significa que:

1. **Contratos ainda não foram deployados**
   - Solução: Execute `yarn deploy-prevdl`

2. **Sandbox foi reiniciado**
   - Os contratos foram perdidos (sandbox é volátil)
   - Solução: Deploy novamente

3. **Deploy foi feito em outro diretório/sandbox**
   - Solução: Verifique qual sandbox está rodando e faça deploy nele

## 💡 Como Funciona

```
┌─────────────────────────────────────────┐
│  Aztec Sandbox (Docker)                 │
│  ┌───────────────────────────────────┐  │
│  │  Aztec Node (porta 8080)          │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │  Blockchain State            │  │  │
│  │  │  - Contratos deployados      │  │  │
│  │  │  - Transações                │  │  │
│  │  │  - Estado dos contratos      │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Seu Computador                         │
│  ┌───────────────────────────────────┐  │
│  │  config/deployed.json              │  │
│  │  (apenas endereços/metadados)      │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## 🔄 Fluxo Completo

1. **Deploy**: `yarn deploy-prevdl`
   - Conecta ao sandbox
   - Deploy no node Aztec
   - Salva endereços em `deployed.json`

2. **Uso**: SDK lê `deployed.json` ou variáveis de ambiente
   - Conecta ao sandbox
   - Busca contratos pelo endereço no node
   - Interage com os contratos

## ✅ Checklist

- [ ] Sandbox está rodando (`curl http://localhost:8080/status`)
- [ ] Contratos foram deployados (`yarn deploy-prevdl`)
- [ ] Arquivo `deployed.json` existe
- [ ] Endereços estão corretos nas variáveis de ambiente

## 🎯 Próximos Passos

Se o arquivo não existe:

```bash
# 1. Certifique-se que sandbox está rodando
curl http://localhost:8080/status

# 2. Deploy os contratos
cd packages/aztec/contracts
yarn compile-prevdl
yarn codegen
yarn deploy-prevdl

# 3. Verificar endereços
cat config/deployed.json

# 4. Configurar SDK
source ../../scripts/load-deployed-addresses.sh
```

