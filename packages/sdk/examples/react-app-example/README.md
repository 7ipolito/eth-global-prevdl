# PREVDL SDK - React Example App

Exemplo completo de aplicação React usando o PREVDL SDK em modo **local** (com dados mock).

## 🚀 Quick Start

### 1. Instalar dependências

```bash
cd packages/sdk/examples/react-app-example
bun install
# ou
npm install
```

### 2. Rodar o projeto

```bash
bun run dev
# ou
npm run dev
```

### 3. Abrir no navegador

Acesse: http://localhost:5173

## 📁 Estrutura do Projeto

```
react-app-example/
├── src/
│   ├── App.tsx          # Componente principal
│   ├── App.css          # Estilos do app
│   ├── main.tsx         # Entry point
│   └── index.css        # Estilos globais
├── index.html           # HTML base
├── package.json         # Dependências
├── vite.config.ts       # Configuração do Vite
└── tsconfig.json        # Configuração TypeScript
```

## 🎯 Funcionalidades Demonstradas

### 1. **Provider Setup**
```tsx
<PrevDLProvider
  config={{
    clientId: 'react-example-app',
    environment: 'local',
  }}
>
  {/* Sua aplicação */}
</PrevDLProvider>
```

### 2. **Componente Ads**
```tsx
<Ads
  userProfile={userProfile}
  maxAds={6}
  onAdClick={handleAdClick}
  onAdImpression={handleAdImpression}
  renderAd={showCustomRender ? renderCustomAd : undefined}
  devHighlights={devMode}
/>
```

### 3. **Event Handlers**
- Click em anúncios
- Tracking de impressões
- Logs no console

### 4. **Renderização Customizada**
- Modo padrão
- Modo customizado com estilos próprios
- Toggle entre os modos

### 5. **Dev Mode**
- Highlights visuais
- Logs detalhados
- Debug facilitado

## 🔧 Configuração

### Ambiente Local (Mock Data)

O exemplo usa `environment: 'local'`, que:
- ✅ Não requer conexão com Aztec
- ✅ Usa dados mock para desenvolvimento rápido
- ✅ Perfeito para testar UI e UX
- ✅ Sem necessidade de setup complexo

### Mudar para Sandbox/Production

Para usar com Aztec real, altere em `App.tsx`:

```tsx
<PrevDLProvider
  config={{
    clientId: 'your-app-id',
    environment: 'sandbox', // ou 'devnet' ou 'production'
    aztecNodeUrl: 'http://localhost:8080', // URL do node Aztec
    adTargetingAddress: '0x...', // Endereço do contrato
    adAuctionAddress: '0x...', // Endereço do contrato
  }}
>
```

## 🎨 Customização

### Estilos

Edite `src/App.css` para customizar:
- Cores do tema
- Layout dos anúncios
- Animações
- Responsividade

### Renderização de Anúncios

Crie sua própria função `renderAd`:

```tsx
const renderCustomAd = (ad: Ad) => (
  <div className="my-custom-ad">
    <h3>{ad.title}</h3>
    <p>{ad.description}</p>
    {/* Seu layout customizado */}
  </div>
);
```

### Perfil do Usuário

Modifique o `userProfile` para testar diferentes segmentações:

```tsx
const [userProfile, setUserProfile] = useState<UserProfile>({
  age: 35,
  location: Location.RIO_DE_JANEIRO,
  profession: Profession.DESIGNER,
  interests: [Interest.ART, Interest.FASHION, Interest.MUSIC],
});
```

## 📊 Dados Mock

O ambiente local usa dados mock definidos em:
- `packages/sdk/src/mocks/index.ts`

Você verá 6 anúncios de exemplo com diferentes segmentações.

## 🔍 Debug

### Console Logs

Abra o DevTools Console para ver:
- Inicialização do SDK
- Matching de anúncios
- Clicks e impressões
- Erros (se houver)

### Dev Mode

Ative o checkbox "Modo desenvolvedor" para:
- Ver bordas verdes nos anúncios
- Logs mais detalhados
- Informações de debug

## 🚀 Build para Produção

```bash
bun run build
# ou
npm run build
```

Os arquivos otimizados estarão em `dist/`.

## 📱 Responsivo

O exemplo é totalmente responsivo e funciona em:
- 💻 Desktop
- 📱 Mobile
- 📲 Tablet

## 🔗 Links Úteis

- [PREVDL SDK Documentation](../../README.md)
- [React Usage Guide](../../REACT_USAGE.md)
- [SDK API Reference](../../SDK_USAGE.md)

## 🐛 Troubleshooting

### Erro: "Cannot find module '@prevdl/sdk'"

Certifique-se de que o SDK foi compilado:

```bash
cd ../../
bun run build
```

### Anúncios não aparecem

1. Verifique o console por erros
2. Ative o "Modo desenvolvedor"
3. Verifique se o `userProfile` está correto

### Vite não inicia

```bash
# Limpe node_modules e reinstale
rm -rf node_modules
bun install
```

## 📄 Licença

MIT

