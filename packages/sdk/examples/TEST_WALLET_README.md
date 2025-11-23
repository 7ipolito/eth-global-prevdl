# 🧪 Teste de Interação com Contrato - Wallet Específica

Este teste interage com o contrato PrevDLAds usando a wallet `0x323446c4ad69ff1f85bbd9d62b3fbe522998f438`.

## 📋 Pré-requisitos

1. **Node.js** instalado (versão 18 ou superior)
2. **Private Key** da wallet configurada no arquivo `.env`
3. **Saldo de ROSE** na wallet para pagar gas (Sapphire Testnet)

## 🚀 Como Executar

### Passo 1: Configurar Private Key

Crie um arquivo `.env` na raiz do projeto `packages/sdk` com sua private key:

```bash
PRIVATE_KEY=0x...
```

⚠️ **IMPORTANTE**: Nunca commite o arquivo `.env` com sua private key!

### Passo 2: Instalar Dependências

```bash
cd packages/sdk
npm install
```

### Passo 3: Executar o Teste

```bash
npm run test:wallet
```

Ou diretamente:

```bash
npx tsx examples/test-wallet-interaction.ts
```

## ✅ O que o Teste Faz

O teste executa os seguintes cenários:

1. **Verificar Estado do Contrato**
   - Total de campanhas
   - Campanhas ativas

2. **Verificar Perfil do Usuário**
   - Verifica se o usuário já tem perfil cadastrado

3. **Criar ou Obter Perfil**
   - Se não tiver perfil, cria um novo (criptografado)
   - Se já tiver, obtém o perfil existente

4. **Testar Criptografia Localmente**
   - Valida a criptografia antes de enviar
   - Mostra tamanho dos dados criptografados

5. **Obter Ads Matching**
   - Busca ads que correspondem ao perfil do usuário
   - Mostra lista de ads encontrados

6. **Verificar Match de Ad Específico**
   - Verifica se um ad específico corresponde ao perfil
   - Mostra detalhes do matching (idade, localização, etc.)

7. **Obter Estatísticas de Campanha**
   - Impressões, clicks, matches
   - Match rate e CTR

8. **Obter Detalhes de Campanha**
   - Informações completas da campanha
   - Targeting, bids, estatísticas

9. **Registrar Impressão** (opcional)
   - Registra uma impressão para uma campanha

## 📊 Informações do Contrato

- **Endereço**: `0x8a7d416e2fb2eedc3a547cadb3f21dd0dcff19e0`
- **Network**: Sapphire Testnet (Chain ID: 23295)
- **RPC**: `https://testnet.sapphire.oasis.io`
- **Explorer**: https://explorer.oasis.io/testnet/sapphire/address/0x8a7d416e2fb2eedc3a547cadb3f21dd0dcff19e0

## 🔐 Segurança

- Todos os dados são **criptografados** antes de serem enviados
- A criptografia usa AES-256-GCM
- A chave de criptografia é derivada da wallet do usuário
- Os dados são descriptografados **somente no TEE** (Trusted Execution Environment)

## ⚠️ Troubleshooting

### Erro: "PRIVATE_KEY não encontrada"
- Verifique se o arquivo `.env` existe na raiz de `packages/sdk`
- Verifique se a variável `PRIVATE_KEY` está configurada corretamente

### Erro: "insufficient funds"
- Você precisa de ROSE na wallet para pagar gas
- Obtenha ROSE no faucet da Sapphire Testnet

### Erro: "Wallet conectada não corresponde"
- O teste verifica se a wallet corresponde à esperada
- Se não corresponder, o teste continua com a wallet conectada

## 📝 Exemplo de Saída

```
🧪 PREVDL ADS - TESTE DE INTERAÇÃO COM CONTRATO
======================================================================
📋 Contrato: 0x8a7d416e2fb2eedc3a547cadb3f21dd0dcff19e0
🌐 Network: Sapphire Testnet
👤 Wallet: 0x323446c4ad69ff1f85bbd9d62b3fbe522998f438

✅ Wallet verificada: 0x323446c4ad69ff1f85bbd9d62b3fbe522998f438
💰 Saldo: 0.5 ROSE

🔧 Inicializando SDK...
✅ SDK inicializado!

📊 TESTE 1: Verificando estado do contrato...
   ✅ Total de campanhas: 5
   ✅ Campanhas ativas: 3
   📋 IDs ativos: 1, 2, 3
...
```

## 🔗 Links Úteis

- [Oasis Sapphire Explorer](https://explorer.oasis.io/testnet/sapphire)
- [Oasis Sapphire Faucet](https://faucet.testnet.oasis.dev/)
- [Documentação do SDK](../README.md)

