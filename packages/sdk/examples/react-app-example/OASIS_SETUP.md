# 🌊 Configuração Oasis Sapphire - React App

Este guia explica como configurar a aplicação React para usar o contrato Oasis Sapphire.

## 📋 Informações do Contrato

- **Endereço do Contrato**: `0x8a7d416E2fb2EEdC3a547Cadb3F21dD0dcFF19e0`
- **Rede**: Sapphire Testnet
- **RPC URL**: `https://testnet.sapphire.oasis.io`
- **Chain ID**: `23295`

## 🔧 Opções de Configuração

### Opção 1: MetaMask (Recomendado para Produção)

1. **Instale o MetaMask** no seu navegador
2. **Adicione a rede Sapphire Testnet**:
   - Network Name: `Oasis Sapphire Testnet`
   - RPC URL: `https://testnet.sapphire.oasis.io`
   - Chain ID: `23295`
   - Currency Symbol: `TEST`
   - Block Explorer: `https://testnet.explorer.sapphire.oasis.io`

3. **Conecte sua wallet** quando a aplicação solicitar

A aplicação detectará automaticamente o MetaMask e usará a wallet conectada.

### Opção 2: Private Key (Apenas para Desenvolvimento)

⚠️ **ATENÇÃO**: Nunca use private keys em produção ou compartilhe-as publicamente!

1. **Crie um arquivo `.env`** na raiz do projeto `react-app-example`:

```env
VITE_PRIVATE_KEY=0x...sua_private_key_aqui...
```

2. **Obtenha uma private key**:
   - Crie uma nova wallet no MetaMask
   - Exporte a private key (Settings > Security & Privacy > Show Private Key)
   - OU use uma wallet de teste gerada

3. **Certifique-se de ter fundos** na wallet na rede Sapphire Testnet para pagar gas fees

## 🚀 Como Funciona

A aplicação tenta conectar na seguinte ordem:

1. **MetaMask** (se disponível) → Solicita conexão automaticamente
2. **Private Key do .env** (se `VITE_PRIVATE_KEY` estiver configurada)
3. **Modo Local** (fallback) → Usa dados mock se nenhuma wallet estiver disponível

## 🔐 Segurança e Criptografia

O SDK está configurado para **forçar criptografia obrigatória** (`requireEncryption: true`). Isso significa que:

- ✅ Todos os dados do usuário são criptografados antes de serem enviados
- ✅ Apenas o contrato pode descriptografar os dados
- ✅ Dados nunca aparecem em texto plano no blockchain
- ✅ Proteção contra interceptação e vazamento de dados

## 📝 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto `react-app-example`:

```env
# Oasis Sapphire Configuration
VITE_PRIVATE_KEY=0x...sua_private_key_aqui...

# Opcional: Se quiser sobrescrever os valores padrão
# VITE_OASIS_CONTRACT_ADDRESS=0x8a7d416E2fb2EEdC3a547Cadb3F21dD0dcFF19e0
# VITE_OASIS_RPC_URL=https://testnet.sapphire.oasis.io
```

## 🧪 Testando

1. **Inicie a aplicação**:
   ```bash
   npm run dev
   # ou
   bun run dev
   ```

2. **Verifique o console** do navegador:
   - Deve aparecer: `✅ Using Oasis Sapphire with mandatory encryption (sandbox mode)`
   - Deve aparecer: `🔐 Encryption is MANDATORY - all data will be encrypted`
   - Deve aparecer: `✅ Connected to Oasis Sapphire (Wallet: 0x...)`

3. **Teste a funcionalidade**:
   - Navegue até a página de anúncios
   - Crie um perfil de usuário
   - Veja os anúncios correspondentes

## 🐛 Troubleshooting

### "MetaMask não encontrada"

**Solução**: Instale a extensão MetaMask ou configure `VITE_PRIVATE_KEY` no `.env`

### "Failed to initialize PrevDL SDK"

**Possíveis causas**:
1. Wallet não tem fundos na Sapphire Testnet
2. Contrato não está deployado no endereço especificado
3. RPC URL incorreta

**Solução**:
- Verifique se a wallet tem fundos (obtenha tokens de teste se necessário)
- Verifique o endereço do contrato no arquivo `deployments/sapphire-testnet-deployment.json`
- Verifique se a rede está acessível

### "Encryption not supported"

**Solução**: O navegador precisa suportar Web Crypto API. Use um navegador moderno (Chrome, Firefox, Safari, Edge).

### Modo Local sendo usado ao invés de Oasis

**Causa**: Nenhuma wallet foi configurada ou houve erro na inicialização.

**Solução**:
- Verifique o console para erros
- Configure MetaMask ou `VITE_PRIVATE_KEY`
- Verifique se `ethers` está instalado: `npm list ethers`

## 📚 Referências

- [Oasis Sapphire Documentation](https://docs.oasis.io/dapp/sapphire/)
- [Oasis Testnet Explorer](https://testnet.explorer.sapphire.oasis.io)
- [Ethers.js Documentation](https://docs.ethers.org/)

## ✅ Checklist

- [ ] MetaMask instalado OU `VITE_PRIVATE_KEY` configurada
- [ ] Rede Sapphire Testnet adicionada ao MetaMask (se usando MetaMask)
- [ ] Wallet tem fundos na Sapphire Testnet
- [ ] `ethers` está instalado (`npm list ethers`)
- [ ] Aplicação inicia sem erros
- [ ] Console mostra "✅ Using Oasis Sapphire"
- [ ] Console mostra "🔐 Encryption is MANDATORY"

