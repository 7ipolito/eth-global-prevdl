# 🏖️ Configuração do Aztec Sandbox - Guia Completo

Este guia segue as orientações oficiais da [documentação do Aztec](https://docs.aztec.network/developers/docs/guides/local_env/sandbox).

## 📋 Pré-requisitos

1. Docker instalado e rodando
2. Aztec CLI instalado

## 🔧 Passo 1: Verificar/Atualizar Versões

### Verificar versão atual do Aztec

```bash
aztec --version
aztec-nargo --version
```

### Atualizar para a versão mais recente

```bash
aztec-up
```

Para atualizar para uma versão específica (ex: v3.0.0-devnet.5):

```bash
aztec-up 3.0.0-devnet.5
# ou
VERSION=3.0.0-devnet.5 aztec-up
```

## 🚀 Passo 2: Iniciar o Sandbox

### Modo padrão (sem proving - mais rápido)

```bash
aztec start --sandbox
```

O sandbox irá:
- Iniciar o Aztec node na porta `8080`
- Iniciar o PXE na porta `8080`
- Criar contas de teste automaticamente

### Modo com proving habilitado (mais lento, mas mais realista)

```bash
PXE_PROVER_ENABLED=1 aztec start --sandbox
```

**Nota:** A primeira vez que rodar com proving habilitado, irá baixar um arquivo CRS grande (vários MB), o que pode levar alguns minutos.

## ✅ Passo 3: Verificar se o Sandbox está rodando

Abra outro terminal e verifique:

```bash
curl http://localhost:8080/status
```

Você deve ver uma resposta JSON com informações do node.

## 📦 Passo 4: Atualizar Dependências do Projeto

### Atualizar Aztec.nr packages

No diretório dos contratos:

```bash
cd packages/aztec/contracts
aztec update . --contract src/ad_targeting --contract src/ad_auction
```

**Importante:** O sandbox precisa estar rodando para o comando `aztec update` funcionar!

### Verificar versões no Nargo.toml

Certifique-se de que as versões estão compatíveis. Para v3.0.0-devnet.5:

```toml
[dependencies]
aztec = { git = "https://github.com/AztecProtocol/aztec-packages/", tag = "v3.0.0-devnet.5", directory = "noir-projects/aztec-nr/aztec" }
```

### Atualizar pacotes JavaScript

No `package.json` dos contratos e SDK, use:

```json
{
  "dependencies": {
    "@aztec/aztec.js": "^3.0.0-devnet.5",
    "@aztec/accounts": "^3.0.0-devnet.5",
    "@aztec/noir-contracts.js": "^3.0.0-devnet.5"
  }
}
```

## 🔨 Passo 5: Compilar Contratos

```bash
cd packages/aztec/contracts

# Compilar contratos PREVDL
yarn compile-prevdl

# Gerar artifacts TypeScript
yarn codegen
```

## 🚢 Passo 6: Deploy dos Contratos

Com o sandbox rodando, em outro terminal:

```bash
cd packages/aztec/contracts
yarn deploy-prevdl
```

Isso irá:
1. Conectar ao sandbox em `http://localhost:8080`
2. Deploy do contrato AdTargeting
3. Deploy do contrato AdAuction
4. Salvar os endereços em `config/deployed.json`

## 📝 Passo 7: Configurar SDK

Copie os endereços dos contratos do output do deploy e configure:

```bash
cd packages/sdk

# Criar arquivo .env ou exportar variáveis
export AD_TARGETING_ADDRESS=0x...
export AD_AUCTION_ADDRESS=0x...
export PREVDL_MODE=sandbox
export AZTEC_NODE_URL=http://localhost:8080
```

Ou crie um arquivo `.env`:

```env
AD_TARGETING_ADDRESS=0x...
AD_AUCTION_ADDRESS=0x...
PREVDL_MODE=sandbox
AZTEC_NODE_URL=http://localhost:8080
```

## 🧪 Passo 8: Testar com SDK

```bash
cd packages/sdk
npm run example:sandbox
```

## 🔍 Troubleshooting

### Sandbox não inicia

1. Verifique se Docker está rodando:
   ```bash
   docker ps
   ```

2. Verifique se a porta 8080 está livre:
   ```bash
   lsof -i :8080
   ```

3. Pare processos antigos:
   ```bash
   aztec stop
   docker ps -a | grep aztec
   docker rm <container_id>
   ```

### Erro de versão incompatível

1. Atualize tudo:
   ```bash
   aztec-up
   cd packages/aztec/contracts
   aztec update . --contract src/ad_targeting --contract src/ad_auction
   ```

2. Verifique se as versões estão alinhadas:
   - Aztec CLI: `aztec --version`
   - Nargo.toml: tag no git
   - package.json: versão dos pacotes @aztec

### Contratos não compilam

1. Limpe e recompile:
   ```bash
   cd packages/aztec/contracts
   yarn clean
   yarn compile-prevdl
   yarn codegen
   ```

### SDK não conecta ao sandbox

1. Verifique se o sandbox está rodando:
   ```bash
   curl http://localhost:8080/status
   ```

2. Verifique a URL no config:
   ```typescript
   aztecNodeUrl: 'http://localhost:8080'
   ```

## 📚 Referências

- [Documentação Oficial do Sandbox](https://docs.aztec.network/developers/docs/guides/local_env/sandbox)
- [Aztec Starter Repository](https://github.com/AztecProtocol/aztec-starter)
- [Aztec Monorepo](https://github.com/AztecProtocol/aztec-packages)

## 🎯 Checklist Rápido

- [ ] Aztec CLI instalado e atualizado (`aztec-up`)
- [ ] Sandbox rodando (`aztec start --sandbox`)
- [ ] Sandbox respondendo (`curl http://localhost:8080/status`)
- [ ] Dependências atualizadas (`aztec update`)
- [ ] Contratos compilados (`yarn compile-prevdl`)
- [ ] Artifacts gerados (`yarn codegen`)
- [ ] Contratos deployados (`yarn deploy-prevdl`)
- [ ] Endereços configurados no SDK
- [ ] SDK testado (`npm run example:sandbox`)

