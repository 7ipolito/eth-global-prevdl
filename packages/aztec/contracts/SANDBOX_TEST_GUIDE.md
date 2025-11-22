# 🧪 Guia Completo: Testar PREVDL no Aztec Sandbox

## 📋 Pré-requisitos

1. **Docker instalado e rodando**
   ```bash
   docker ps  # Verificar
   ```

2. **Node.js 20+ e Bun instalados**

3. **Dependências instaladas**
   ```bash
   cd packages/aztec/contracts
   yarn install
   ```

## 🚀 Passo a Passo Completo

### PASSO 1: Iniciar Aztec Sandbox

```bash
cd packages/aztec/contracts

# Iniciar sandbox (cria blockchain Aztec local)
aztec sandbox

# Aguarde até ver: "Aztec Sandbox is ready!"
# O sandbox roda em: http://localhost:8080
```

**Deixe este terminal aberto!** O sandbox precisa continuar rodando.

### PASSO 2: Compilar Contratos

Em **outro terminal**:

```bash
cd packages/aztec/contracts

# Compilar contratos Noir
yarn compile

# Isso deve compilar:
# - PrivateVoting (já existe)
# - AdTargeting (nosso contrato)
# - AdAuction (nosso contrato)
```

**Verificar se compilou:**
```bash
ls -la target/*.json
# Deve mostrar arquivos .json dos contratos
```

### PASSO 3: Gerar TypeScript Artifacts

```bash
# Gerar wrappers TypeScript
yarn codegen

# Isso cria:
# - src/artifacts/AdTargeting.ts
# - src/artifacts/AdAuction.ts
```

**Verificar:**
```bash
ls -la src/artifacts/
# Deve ter AdTargeting.ts e AdAuction.ts
```

### PASSO 4: Deploy Contratos no Sandbox

```bash
# Deploy AdTargeting e AdAuction
yarn deploy-prevdl

# Isso vai:
# 1. Conectar ao sandbox (localhost:8080)
# 2. Criar wallet
# 3. Deploy AdTargeting
# 4. Deploy AdAuction
# 5. Salvar endereços em config/deployed.json
```

**IMPORTANTE:** Copie os endereços que aparecerem no output!

Exemplo de output:
```
✅ AdTargeting deployed: 0x1234...
✅ AdAuction deployed: 0x5678...
```

### PASSO 5: Configurar SDK

```bash
cd ../../sdk

# Set environment variables com os endereços do deploy
export AD_TARGETING_ADDRESS=0x1234...  # Endereço do AdTargeting
export AD_AUCTION_ADDRESS=0x5678...    # Endereço do AdAuction
export PREVDL_MODE=sandbox
export AZTEC_NODE_URL=http://localhost:8080
```

**OU criar arquivo `.env` no diretório sdk:**
```bash
cat > .env << EOF
AD_TARGETING_ADDRESS=0x1234...
AD_AUCTION_ADDRESS=0x5678...
PREVDL_MODE=sandbox
AZTEC_NODE_URL=http://localhost:8080
EOF
```

### PASSO 6: Testar com SDK

```bash
cd packages/sdk

# Instalar dependências (se ainda não fez)
bun install

# Rodar exemplo sandbox
bun run example:sandbox
```

## 🔍 Verificar se Está Funcionando

### Check 1: Sandbox Rodando

```bash
curl http://localhost:8080/status
# Deve retornar status do node
```

### Check 2: Contratos Deployados

O script de deploy salva em `packages/aztec/contracts/config/deployed.json`:

```bash
cat packages/aztec/contracts/config/deployed.json
```

### Check 3: SDK Conecta

O exemplo `sandbox-example.ts` vai mostrar:
- ✅ `Connected to Aztec node`
- ✅ `Wallet created`
- ✅ `AdTargeting contract loaded: 0x...`
- ✅ `AdAuction contract loaded: 0x...`

## 🐛 Troubleshooting

### Erro: "Cannot connect to Aztec node"

**Solução:**
```bash
# Verificar se sandbox está rodando
docker ps | grep aztec

# Se não estiver, iniciar:
cd packages/aztec/contracts
aztec sandbox
```

### Erro: "Contract not found"

**Solução:**
1. Verificar se deploy foi feito: `yarn deploy-prevdl`
2. Verificar endereços nas env vars
3. Verificar se `yarn codegen` foi executado

### Erro: "Artifacts not found"

**Solução:**
```bash
cd packages/aztec/contracts
yarn compile
yarn codegen
```

### Erro: "Could not import AdTargetingContract"

**Solução:**
```bash
# Verificar se artifacts foram gerados
ls -la src/artifacts/AdTargeting.ts

# Se não existir:
yarn codegen
```

## 📊 Fluxo Completo de Teste

```
1. Terminal 1: aztec sandbox (deixar rodando)
2. Terminal 2: yarn compile && yarn codegen && yarn deploy-prevdl
3. Copiar endereços dos contratos
4. Terminal 3: export AD_TARGETING_ADDRESS=... && bun run example:sandbox
5. Ver resultado: matching funcionando com ZK proofs!
```

## 🎯 O Que Deve Acontecer

Quando rodar `bun run example:sandbox`, você deve ver:

1. ✅ SDK conecta ao sandbox
2. ✅ Wallet criada
3. ✅ Contratos carregados
4. ✅ Perfil de usuário criado (privado)
5. ✅ Matching de anúncios (ZK proof)
6. ✅ Impressões e cliques registrados
7. ✅ Estatísticas consultadas

## 📝 Exemplo de Output Esperado

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

## 🚀 Próximos Passos

Depois que sandbox estiver funcionando:

1. **Testar diferentes perfis** - Modificar userProfile no exemplo
2. **Criar campanhas reais** - Usar createCampaign()
3. **Integrar Substance Labs** - Para bridge Polygon → Aztec
4. **Deploy no Devnet** - Para testar em rede pública

