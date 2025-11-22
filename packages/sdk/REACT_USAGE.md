# PREVDL SDK - React Usage Guide

Guia completo para usar o PREVDL SDK em aplicações React.

## 📦 Instalação

```bash
npm install @prevdl/sdk react react-dom
# ou
yarn add @prevdl/sdk react react-dom
# ou
bun add @prevdl/sdk react react-dom
```

## 🚀 Quick Start

### 1. Configurar o Provider

Envolva sua aplicação com o `PrevDLProvider`:

```tsx
import React from 'react';
import { PrevDLProvider } from '@prevdl/sdk/components';

function App() {
  return (
    <PrevDLProvider
      config={{
        clientId: 'your-client-id',
        environment: 'sandbox', // 'local' | 'sandbox' | 'devnet' | 'production'
      }}
    >
      <YourApp />
    </PrevDLProvider>
  );
}

export default App;
```

### 2. Usar o Componente Ads

```tsx
import React from 'react';
import { Ads } from '@prevdl/sdk/components';
import { Location, Profession, Interest } from '@prevdl/sdk';

function HomePage() {
  // Perfil do usuário (dados privados)
  const userProfile = {
    age: 28,
    location: Location.SAO_PAULO,
    profession: Profession.SOFTWARE_ENGINEER,
    interests: [Interest.TECH, Interest.CRYPTO, Interest.TRAVEL],
  };

  return (
    <div>
      <h1>Bem-vindo!</h1>
      
      {/* Anúncios segmentados */}
      <Ads 
        userProfile={userProfile} 
        maxAds={3}
      />
    </div>
  );
}
```

## 📚 Exemplos Completos

### Exemplo 1: Uso Básico

```tsx
import React from 'react';
import { PrevDLProvider, Ads } from '@prevdl/sdk/components';
import { Location, Profession, Interest } from '@prevdl/sdk';

function App() {
  const userProfile = {
    age: 28,
    location: Location.SAO_PAULO,
    profession: Profession.SOFTWARE_ENGINEER,
    interests: [Interest.TECH, Interest.CRYPTO],
  };

  return (
    <PrevDLProvider config={{ clientId: 'my-app', environment: 'local' }}>
      <div className="app">
        <h1>Minha Aplicação</h1>
        <Ads userProfile={userProfile} maxAds={3} />
      </div>
    </PrevDLProvider>
  );
}

export default App;
```

### Exemplo 2: Renderização Customizada

```tsx
import React from 'react';
import { Ads } from '@prevdl/sdk/components';
import type { Ad } from '@prevdl/sdk';

function CustomAdsSection({ userProfile }) {
  return (
    <Ads
      userProfile={userProfile}
      maxAds={5}
      className="my-ads-container"
      renderAd={(ad: Ad) => (
        <div className="custom-ad-card">
          {ad.imageUrl && (
            <img 
              src={ad.imageUrl} 
              alt={ad.title}
              className="ad-image"
            />
          )}
          <div className="ad-content">
            <h3>{ad.title}</h3>
            <p>{ad.description}</p>
            <button className="ad-button">
              {ad.ctaText || 'Saiba Mais'}
            </button>
          </div>
          <span className="privacy-badge">🔒 Privado</span>
        </div>
      )}
    />
  );
}
```

### Exemplo 3: Com Event Handlers

```tsx
import React from 'react';
import { Ads } from '@prevdl/sdk/components';
import type { Ad } from '@prevdl/sdk';

function AdsWithTracking({ userProfile }) {
  const handleAdClick = (ad: Ad) => {
    console.log('Anúncio clicado:', ad.id);
    
    // Enviar para seu analytics
    window.gtag?.('event', 'ad_click', {
      ad_id: ad.id,
      ad_title: ad.title,
    });
  };

  const handleAdImpression = (ad: Ad) => {
    console.log('Impressão registrada:', ad.id);
    
    // Enviar para seu analytics
    window.gtag?.('event', 'ad_impression', {
      ad_id: ad.id,
    });
  };

  return (
    <Ads
      userProfile={userProfile}
      maxAds={3}
      onAdClick={handleAdClick}
      onAdImpression={handleAdImpression}
    />
  );
}
```

### Exemplo 4: Com Loading e Error States

```tsx
import React from 'react';
import { Ads } from '@prevdl/sdk/components';

function AdsWithStates({ userProfile }) {
  return (
    <Ads
      userProfile={userProfile}
      maxAds={3}
      loading={
        <div className="loading-state">
          <div className="spinner" />
          <p>Carregando anúncios...</p>
        </div>
      }
      error={
        <div className="error-state">
          <p>❌ Erro ao carregar anúncios</p>
          <button onClick={() => window.location.reload()}>
            Tentar novamente
          </button>
        </div>
      }
    />
  );
}
```

### Exemplo 5: Usando os Hooks Diretamente

```tsx
import React, { useEffect, useState } from 'react';
import { usePrevDLAds, usePrevDLContext } from '@prevdl/sdk/components';
import type { Ad } from '@prevdl/sdk';

function CustomAdsComponent({ userProfile }) {
  const prevdlAds = usePrevDLAds();
  const { isInitialized, error } = usePrevDLContext();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!prevdlAds || !isInitialized) return;

    const fetchAds = async () => {
      try {
        const matchedAds = await prevdlAds.getTargetedAds(userProfile);
        setAds(matchedAds);
      } catch (err) {
        console.error('Erro ao buscar anúncios:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [prevdlAds, isInitialized, userProfile]);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div className="ads-grid">
      {ads.map(ad => (
        <div key={ad.id} className="ad-card">
          <h3>{ad.title}</h3>
          <p>{ad.description}</p>
        </div>
      ))}
    </div>
  );
}
```

## 🎨 Estilos Padrão

O SDK inclui estilos padrão que você pode importar:

```tsx
import { defaultStyles } from '@prevdl/sdk/components';

// No seu componente ou arquivo CSS global
const styleTag = document.createElement('style');
styleTag.innerHTML = defaultStyles;
document.head.appendChild(styleTag);
```

Ou crie seus próprios estilos:

```css
.prevdl-ads-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.prevdl-ad {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.prevdl-ad:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.prevdl-ad-privacy-badge {
  background: #f0f0f0;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  color: #666;
}
```

## 🔧 Props do Componente Ads

| Prop | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| `userProfile` | `UserProfile` | ✅ | Perfil do usuário (dados privados) |
| `maxAds` | `number` | ❌ | Número máximo de anúncios (padrão: 3) |
| `className` | `string` | ❌ | Classe CSS customizada |
| `onAdClick` | `(ad: Ad) => void` | ❌ | Callback quando anúncio é clicado |
| `onAdImpression` | `(ad: Ad) => void` | ❌ | Callback quando anúncio é exibido |
| `renderAd` | `(ad: Ad) => ReactNode` | ❌ | Função de renderização customizada |
| `loading` | `ReactNode` | ❌ | Componente de loading customizado |
| `error` | `ReactNode` | ❌ | Componente de erro customizado |
| `devHighlights` | `boolean` | ❌ | Mostrar highlights de desenvolvimento |

## 🔐 Tipos e Enums

### UserProfile

```typescript
interface UserProfile {
  age: number;
  location: Location;
  profession: Profession;
  interests: Interest[]; // Máximo 3
  gender?: Gender;
}
```

### Enums Disponíveis

```typescript
// Localização
enum Location {
  SAO_PAULO = 1,
  RIO_DE_JANEIRO = 2,
  BRASILIA = 3,
  // ... outros
}

// Profissão
enum Profession {
  SOFTWARE_ENGINEER = 1,
  DESIGNER = 2,
  PRODUCT_MANAGER = 3,
  // ... outros
}

// Interesses
enum Interest {
  TECH = 1,
  CRYPTO = 2,
  GAMING = 3,
  SPORTS = 4,
  // ... outros
}

// Gênero (opcional)
enum Gender {
  ANY = 0,
  MALE = 1,
  FEMALE = 2,
  OTHER = 3,
}
```

## 🎯 Hooks Disponíveis

### `usePrevDLAds()`

Retorna a instância do SDK:

```tsx
const prevdlAds = usePrevDLAds();

// Usar métodos do SDK
const ads = await prevdlAds?.getTargetedAds(userProfile);
const stats = await prevdlAds?.getCampaignStats('ad-id');
```

### `usePrevDLContext()`

Retorna o contexto completo:

```tsx
const { prevdlAds, isInitialized, error } = usePrevDLContext();

if (!isInitialized) {
  return <div>Inicializando SDK...</div>;
}

if (error) {
  return <div>Erro: {error}</div>;
}
```

## 🌍 Ambientes

### Local (Desenvolvimento)

```tsx
<PrevDLProvider config={{ clientId: 'dev', environment: 'local' }}>
  {/* Usa dados mock, sem conexão Aztec */}
</PrevDLProvider>
```

### Sandbox (Testes)

```tsx
<PrevDLProvider 
  config={{ 
    clientId: 'test-app',
    environment: 'sandbox',
    aztecNodeUrl: 'http://localhost:8080'
  }}
>
  {/* Conecta ao sandbox Aztec local */}
</PrevDLProvider>
```

### Production

```tsx
<PrevDLProvider 
  config={{ 
    clientId: 'prod-app-id',
    environment: 'production',
    aztecNodeUrl: 'https://api.aztec.network',
    adTargetingAddress: '0x...',
    adAuctionAddress: '0x...'
  }}
>
  {/* Conecta à rede Aztec de produção */}
</PrevDLProvider>
```

## 🔒 Garantias de Privacidade

✅ **Dados do usuário nunca saem do dispositivo**
- Idade, localização, profissão, interesses permanecem privados
- Apenas o resultado do match (sim/não) é revelado

✅ **Zero-knowledge proofs**
- Aztec Network garante privacidade
- Anunciantes não podem ver dados do usuário

✅ **Targeting transparente**
- Usuários veem por que receberam um anúncio
- Sem tracking escondido

## 📱 Exemplo Completo de App

Veja o exemplo completo em `examples/react-app-example/` para uma aplicação React funcional usando o SDK.

## 🐛 Debug

Ative highlights de desenvolvimento:

```tsx
<Ads 
  userProfile={userProfile}
  devHighlights={true}
/>
```

Isso adiciona bordas verdes e logs no console para facilitar o debug.

## 📄 Licença

MIT

