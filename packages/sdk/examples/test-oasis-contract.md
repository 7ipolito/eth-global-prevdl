# 🧪 Testes do Contrato Oasis com PrevDLProvider

## 📋 Informações do Contrato

- **Endereço**: `0x8a7d416E2fb2EEdC3a547Cadb3F21dD0dcFF19e0`
- **Network**: Sapphire Testnet (Chain ID: 23295)
- **RPC**: `https://testnet.sapphire.oasis.io`
- **Explorer**: https://explorer.oasis.io/testnet/sapphire/address/0x8a7d416E2fb2EEdC3a547Cadb3F21dD0dcFF19e0

## 🚀 Como Rodar os Testes

### Opção 1: React App (Recomendado)

1. **Instalar dependências:**
   ```bash
   cd packages/sdk
   npm install
   ```

2. **Configurar wallet:**
   
   **Opção A: MetaMask (Recomendado)**
   - Instale MetaMask
   - Conecte à Sapphire Testnet
   - O app detectará automaticamente

   **Opção B: Private Key (Desenvolvimento)**
   - Crie arquivo `.env` na raiz do projeto React
   - Adicione: `REACT_APP_PRIVATE_KEY=0x...`
   - ⚠️ **NUNCA commite este arquivo!**

3. **Importar componente de teste:**
   ```tsx
   import OasisTestApp from './examples/react-oasis-test';
   
   function App() {
     return <OasisTestApp />;
   }
   ```

4. **Rodar aplicação:**
   ```bash
   npm start
   # ou
   yarn start
   ```

### Opção 2: Teste Manual com TypeScript

```bash
cd packages/oasis
npx ts-node examples/interact-contract.ts
```

## ✅ Testes Disponíveis

O componente de teste inclui os seguintes testes:

### 1. Estado do Contrato
- Verifica total de campanhas
- Lista campanhas ativas
- Valida que contrato está acessível

### 2. Criar Perfil
- Cria perfil de usuário criptografado
- Verifica se perfil já existe
- Obtém perfil existente se disponível

### 3. Obter Ads Matching
- Busca ads que correspondem ao perfil
- Mostra lista de ads encontrados
- Valida que matching funciona

### 4. Verificar Match
- Verifica match de ad específico
- Mostra detalhes do matching (idade, localização, etc.)
- Valida lógica de matching

### 5. Estatísticas
- Obtém estatísticas de campanha
- Mostra impressões, clicks, matches
- Calcula match rate e CTR

### 6. Obter Campanha
- Obtém detalhes de campanha específica
- Mostra informações completas
- Valida leitura de dados

## 🔍 Verificações Automáticas

O componente verifica automaticamente:
- ✅ SDK inicializado
- ✅ Wallet conectada
- ✅ Contrato acessível
- ✅ Perfil do usuário
- ✅ Campanhas disponíveis

## 📊 Resultados Esperados

### Estado Inicial
- Total de campanhas: 0 ou mais
- Campanhas ativas: Array de IDs

### Após Criar Perfil
- Perfil criado com sucesso
- TX hash confirmado
- Perfil acessível via `getUserProfile()`

### Após Buscar Ads
- Lista de ads matching (pode estar vazia se não houver campanhas)
- Cada ad com ID, CTA, bids, stats

### Após Verificar Match
- Resultado de match (true/false)
- Detalhes de cada critério
- Validação de lógica

## ⚠️ Troubleshooting

### Erro: "SDK não inicializado"
- Verifique se o Provider está configurado corretamente
- Verifique se a wallet está conectada
- Verifique se o RPC está acessível

### Erro: "Wallet não conectada"
- Instale MetaMask
- Conecte à Sapphire Testnet
- Ou configure `REACT_APP_PRIVATE_KEY`

### Erro: "Contract not found"
- Verifique o endereço do contrato
- Verifique se está na rede correta (Sapphire Testnet)
- Verifique se o contrato foi deployado

### Erro: "User has no profile"
- Execute o teste "Criar Perfil" primeiro
- Aguarde confirmação da transação

### Nenhum ad matching encontrado
- Crie uma campanha que corresponda ao perfil
- Use o script `create-test-campaign.sh` ou SDK

## 📝 Exemplo de Uso Completo

```tsx
import React from 'react';
import { PrevDLProvider } from '@prevdl/sdk/components';
import OasisTestApp from './examples/react-oasis-test';

function App() {
  return (
    <div>
      <h1>PrevDL Ads - Testes</h1>
      <OasisTestApp />
    </div>
  );
}

export default App;
```

## 🔐 Segurança

- ⚠️ **NUNCA** commite `REACT_APP_PRIVATE_KEY` no Git
- ⚠️ Use MetaMask em produção
- ⚠️ Private key apenas para desenvolvimento/testes
- ✅ Dados são criptografados automaticamente pelo SDK
- ✅ TEE garante privacidade no processamento

## 📚 Próximos Passos

1. ✅ Testar todas as funcionalidades
2. ✅ Criar campanhas de teste
3. ✅ Validar matching
4. ✅ Verificar estatísticas
5. ✅ Integrar em aplicação real

---

**Pronto para testar!** 🎉

