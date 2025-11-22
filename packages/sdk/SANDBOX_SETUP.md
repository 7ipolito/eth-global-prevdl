# 🐳 Aztec Sandbox Setup Guide

Guia completo para rodar o PREVDL SDK com Aztec Sandbox (Docker).

## 📋 Pré-requisitos

1. **Docker instalado e rodando**
   ```bash
   docker ps  # Verificar se Docker está funcionando
   ```

2. **Node.js 20+ e Bun instalados**

3. **Contratos Aztec compilados**

## 🚀 Passo a Passo

### 1. Iniciar Aztec Sandbox

```bash
cd packages/aztec/contracts

# Iniciar sandbox (cria blockchain Aztec local)
aztec sandbox

# OU via yarn
yarn sandbox
```

Isso vai:
- ✅ Criar containers Docker
- ✅ Iniciar Aztec node em `http://localhost:8080`
- ✅ Criar L1 Ethereum local em `http://localhost:8545`

**Aguarde até ver:** `Aztec Sandbox is ready!`

### 2. Compilar e Deploy Contratos

Em **outro terminal**:

```bash
cd packages/aztec/contracts

# Compilar contratos Noir
yarn compile

# Gerar TypeScript artifacts
yarn codegen

# Deploy contratos no Sandbox
# (Você precisa criar o script deploy_ad_contracts.ts primeiro)
yarn deploy-prevdl
```

**Salve os endereços dos contratos** que aparecerem no output!

### 3. Configurar SDK

```bash
cd packages/sdk

# Set environment variables
export AD_TARGETING_ADDRESS=0x...  # Endereço do deploy
export AD_AUCTION_ADDRESS=0x...    # Endereço do deploy
export PREVDL_MODE=sandbox
export AZTEC_NODE_URL=http://localhost:8080
```

### 4. Instalar Dependências do SDK

```bash
cd packages/sdk
bun install
```

### 5. Rodar Exemplo Sandbox

```bash
bun run example:sandbox
```

## 🔍 Verificar se Está Funcionando

### Check 1: Docker Containers

```bash
docker ps | grep aztec
```

Deve mostrar containers do Aztec rodando.

### Check 2: Aztec Node

```bash
curl http://localhost:8080/status
```

Deve retornar status do node.

### Check 3: SDK Connection

O exemplo `sandbox-example.ts` vai tentar conectar e mostrar:
- ✅ `Connected to Aztec node`
- ✅ `Wallet created`
- ✅ `Contracts loaded`

## 🐛 Troubleshooting

### "Cannot connect to Aztec node"

**Solução:**
```bash
# Verificar se sandbox está rodando
docker ps

# Reiniciar sandbox
cd packages/aztec/contracts
aztec sandbox --reset
```

### "Contract not found"

**Solução:**
1. Verificar se contratos foram deployados
2. Verificar se addresses estão corretos nas env vars
3. Verificar se `yarn codegen` foi executado

### "Artifacts not found"

**Solução:**
```bash
cd packages/aztec/contracts
yarn compile
yarn codegen
```

### "Docker permission denied"

**Solução:**
```bash
# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER
# Fazer logout e login novamente
```

## 📊 Fluxo Completo

```
1. Docker → Aztec Sandbox (localhost:8080)
2. Deploy → Contratos AdTargeting + AdAuction
3. SDK → Conecta ao Sandbox
4. User → Cria perfil privado
5. SDK → Chama check_ad_compatibility (ZK proof)
6. Aztec → Verifica match sem revelar dados
7. Result → Apenas boolean (match sim/não) é público
```

## 🎯 Próximos Passos

Depois que Sandbox estiver funcionando:

1. **Testar com dados reais** - Criar diferentes perfis de usuário
2. **Deploy no Devnet** - Para testar em rede pública
3. **Integrar Substance Labs** - Para bridge Polygon → Aztec
4. **Build Frontend** - Dashboard para anunciantes e usuários

## 📚 Referências

- [Aztec Docs](https://docs.aztec.network/)
- [Substance Labs Bridge](https://substance-labs.gitbook.io/aztec-evm-bridge/)
- [Aztec Sandbox Guide](https://docs.aztec.network/developers/sandbox)

