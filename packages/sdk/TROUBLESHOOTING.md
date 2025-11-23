# PREVDL SDK - Troubleshooting Guide

Guia de solução de problemas comuns do PREVDL SDK.

## 🔴 Erro: "Insufficient fee payer balance"

### Problema
```
Error: Invalid tx: Insufficient fee payer balance
```

### Causa
Este erro ocorre quando você tenta enviar transações para contratos Aztec mas a conta não tem saldo suficiente para pagar as taxas.

### Soluções

#### Solução 1: Usar Modo Local (Recomendado para Desenvolvimento)

O modo `local` usa apenas dados mock e **não requer conexão com Aztec**:

```tsx
<PrevDLProvider
  config={{
    clientId: 'your-app',
    environment: 'local', // ✅ Sem taxas, sem Aztec
  }}
>
  <Ads userProfile={userProfile} />
</PrevDLProvider>
```

**Vantagens:**
- ✅ Sem necessidade de sandbox Aztec
- ✅ Sem taxas de transação
- ✅ Desenvolvimento rápido
- ✅ Funciona offline

#### Solução 2: Usar Sponsored FPC (Sandbox)

Se você precisa testar com Aztec real, use o Sponsored FPC que oferece taxas gratuitas no sandbox:

```typescript
// O SDK já está configurado para usar Sponsored FPC automaticamente
// Certifique-se de que o sandbox está rodando:

// 1. Iniciar sandbox
docker run -p 8080:8080 aztecprotocol/aztec:latest

// 2. Verificar se está rodando
curl http://localhost:8080/status
```

#### Solução 3: Verificar Configuração do Sandbox

```bash
# Parar containers existentes
docker stop $(docker ps -q --filter ancestor=aztecprotocol/aztec:latest)

# Limpar dados antigos
docker system prune -f

# Iniciar sandbox limpo
cd packages/aztec/contracts
npm run sandbox:start
```

## 🔴 Tela Branca no React

### Problema
A aplicação React mostra apenas uma tela branca.

### Soluções

#### Verificar Console do Browser
1. Abra DevTools (F12)
2. Vá para a aba Console
3. Procure por erros em vermelho

#### Usar Versão Simplificada
O exemplo React tem duas versões:

**App-Simple.tsx** (Recomendado):
- ✅ Funciona sem Aztec
- ✅ Apenas React puro
- ✅ Sem dependências complexas

```tsx
// src/main.tsx
import App from './App-Simple'; // ✅ Use esta versão
```

**App.tsx** (Avançado):
- Requer SDK compilado
- Requer configuração Aztec
- Para produção

#### Verificar Importações
```tsx
// ✅ Correto (com aliases do Vite)
import { Ads } from '@prevdl/sdk/components';

// ❌ Errado
import { Ads } from '../../../dist/sdk/components';
```

## 🔴 Erro: "Cannot find module '@prevdl/sdk'"

### Problema
```
Cannot find module '@prevdl/sdk' or its corresponding type declarations
```

### Solução

#### 1. Compilar o SDK
```bash
cd packages/sdk
bun run build
```

#### 2. Verificar aliases no vite.config.ts
```typescript
resolve: {
  alias: {
    '@prevdl/sdk': path.resolve(__dirname, '../../src'),
    '@prevdl/sdk/components': path.resolve(__dirname, '../../src/components'),
  },
}
```

#### 3. Usar App-Simple.tsx
Esta versão não depende de imports externos:
```bash
cd examples/react-app-example
# Certifique-se de que main.tsx usa App-Simple
bun run dev
```

## 🔴 Erro: PostCSS Plugin Invalid

### Problema
```
Invalid PostCSS Plugin found at: plugins[0]
```

### Solução
Criar `postcss.config.js` local:

```javascript
// examples/react-app-example/postcss.config.js
export default {
  plugins: {},
};
```

Ou desabilitar no vite.config.ts:
```typescript
css: {
  postcss: {
    plugins: [],
  },
}
```

## 🔴 Contratos Não Encontrados

### Problema
```
Contract instance not found at address 0x...
```

### Soluções

#### 1. Verificar se Sandbox está Rodando
```bash
docker ps | grep aztec
```

#### 2. Reimplantar Contratos
```bash
cd packages/aztec/contracts
npm run compile-prevdl
npm run deploy-prevdl
```

#### 3. Verificar deployed.json
```bash
cat packages/aztec/contracts/config/deployed.json
```

#### 4. Usar Modo Local
```typescript
// Não requer contratos implantados
environment: 'local'
```

## 🔴 Anúncios Não Aparecem

### Problema
Componente `<Ads>` não mostra nenhum anúncio.

### Soluções

#### 1. Verificar Perfil do Usuário
```tsx
const userProfile = {
  age: 28,
  location: Location.SAO_PAULO,
  profession: Profession.SOFTWARE_ENGINEER,
  interests: [Interest.TECH, Interest.CRYPTO], // Pelo menos 1 interesse
};
```

#### 2. Verificar Console
```tsx
<Ads 
  userProfile={userProfile}
  devHighlights={true} // ✅ Ativa logs de debug
/>
```

#### 3. Testar com Idade Diferente
Os anúncios mock têm faixas etárias específicas:
- 18-30 anos: Bootcamp, Gaming, Mochilão
- 35-55 anos: Aposentadoria, Cruzeiro, MBA
- 25-40 anos: React, Disney

## 🔴 Build Falha

### Problema
```
error TS6059: File is not under 'rootDir'
```

### Solução
O SDK inclui arquivos de fora do `src/`. Isso é normal e o build deve funcionar com a configuração atual:

```bash
cd packages/sdk
bun run build
```

Se ainda falhar, verifique `tsconfig.build.json`:
```json
{
  "include": [
    "src/**/*",
    "../aztec/contracts/src/artifacts/**/*",
    "../aztec/contracts/src/utils/**/*"
  ]
}
```

## 📚 Modos de Operação

### Local Mode (Desenvolvimento)
```typescript
environment: 'local'
```
- ✅ Sem Aztec
- ✅ Dados mock
- ✅ Sem taxas
- ✅ Rápido

### Sandbox Mode (Testes)
```typescript
environment: 'sandbox'
aztecNodeUrl: 'http://localhost:8080'
```
- ⚠️ Requer Docker
- ⚠️ Requer contratos implantados
- ✅ Taxas gratuitas (Sponsored FPC)
- ✅ Testa funcionalidade real

### Production Mode
```typescript
environment: 'production'
aztecNodeUrl: 'https://api.aztec.network'
adTargetingAddress: '0x...'
adAuctionAddress: '0x...'
```
- ⚠️ Requer contratos em produção
- ⚠️ Taxas reais
- ✅ Rede Aztec real

## 🆘 Ainda com Problemas?

### Checklist Rápido

1. ✅ Usar `App-Simple.tsx` para desenvolvimento
2. ✅ Usar `environment: 'local'` para evitar Aztec
3. ✅ Verificar console do browser (F12)
4. ✅ Limpar cache: `rm -rf node_modules && bun install`
5. ✅ Reiniciar dev server: `bun run dev`

### Logs Úteis

```bash
# Ver logs do sandbox
docker logs $(docker ps -q --filter ancestor=aztecprotocol/aztec:latest)

# Ver status do sandbox
curl http://localhost:8080/status

# Verificar contratos implantados
cat packages/aztec/contracts/config/deployed.json
```

## 📖 Documentação Adicional

- [React Usage Guide](./REACT_USAGE.md)
- [SDK Usage Guide](./SDK_USAGE.md)
- [Sandbox Setup](./SANDBOX_SETUP.md)
- [React Example README](./examples/react-app-example/README.md)

## 💡 Dicas

### Para Desenvolvimento Rápido
Use sempre `App-Simple.tsx` e `environment: 'local'`:
- Sem dependências externas
- Sem Docker
- Sem configuração complexa
- Apenas React + TypeScript

### Para Testes com Aztec
1. Inicie o sandbox
2. Implante os contratos
3. Use `environment: 'sandbox'`
4. O SDK cuida das taxas automaticamente

### Para Produção
1. Implante contratos na rede Aztec
2. Configure endereços no `.env`
3. Use `environment: 'production'`
4. Teste extensivamente antes de lançar

