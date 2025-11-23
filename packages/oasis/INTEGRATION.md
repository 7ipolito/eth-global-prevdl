# Integração PrevDL Ads - Guia Completo

Este guia mostra como integrar os contratos Oasis Sapphire com o SDK TypeScript.

## 📦 Fluxo de Integração

```
┌─────────────────┐
│   React App     │
│   (Frontend)    │
└────────┬────────┘
         │
         │ Usa @prevdl/sdk
         ▼
┌─────────────────┐
│   PrevDL SDK    │  ◄── Você está aqui (packages/sdk)
│  (TypeScript)   │
└────────┬────────┘
         │
         │ Web3 Calls
         ▼
┌─────────────────┐
│ Oasis Sapphire  │  ◄── Este repositório (packages/oasis)
│   Smart         │
│   Contracts     │
└─────────────────┘
```

## 🔗 Conectando SDK aos Contratos

### 1. Deploy do Contrato

```bash
cd packages/oasis
make deploy-testnet
```

Anote o endereço do contrato em `deployments/latest.json`:

```json
{
  "contract": "PrevDLAds",
  "address": "0x1234...",
  "chainId": 23295
}
```

### 2. Atualizar SDK Config

Em `packages/sdk/src/sdk.ts`, configure o endereço:

```typescript
// sdk.ts
export class PrevDLSDK {
  private contractAddress: string;
  
  constructor(config: SDKConfig) {
    // Usar endereço do contrato deployado
    this.contractAddress = config.adTargetingAddress || 
                          process.env.NEXT_PUBLIC_OASIS_CONTRACT_ADDRESS ||
                          '0x...'; // endereço do deploy
  }
}
```

### 3. ABI Integration

Copie o ABI gerado pelo Foundry:

```bash
# Após compilar os contratos
cd packages/oasis
forge build

# O ABI estará em:
# out/PrevDLAds.sol/PrevDLAds.json
```

Copie para o SDK:

```bash
cp out/PrevDLAds.sol/PrevDLAds.json ../sdk/src/abis/PrevDLAds.json
```

### 4. Implementar Chamadas no SDK

Exemplo em `packages/sdk/src/sdk.ts`:

```typescript
import { ethers } from 'ethers';
import PrevDLAdsABI from './abis/PrevDLAds.json';

export class PrevDLSDK {
  private contract: ethers.Contract;
  
  async initialize() {
    const provider = new ethers.providers.JsonRpcProvider(
      'https://testnet.sapphire.oasis.io'
    );
    
    this.contract = new ethers.Contract(
      this.contractAddress,
      PrevDLAdsABI.abi,
      provider
    );
  }
  
  async getMatchingAds(userProfile: UserProfile): Promise<Ad[]> {
    // Primeiro, criar/atualizar perfil on-chain (com signer)
    const signer = this.getSigner();
    const contractWithSigner = this.contract.connect(signer);
    
    await contractWithSigner.setUserProfile(
      userProfile.age,
      userProfile.location,
      userProfile.profession,
      userProfile.interests,
      userProfile.gender || 0
    );
    
    // Obter ads matching
    const adInfos = await this.contract.getMatchingAds(
      await signer.getAddress()
    );
    
    // Converter para formato Ad[]
    return this.parseAdInfos(adInfos);
  }
}
```

## 🔐 Privacidade no Oasis Sapphire

### Como funciona:

1. **Dados criptografados**: Perfis de usuário são armazenados criptografados
2. **Computação confidencial**: Matching acontece dentro do TEE (Trusted Execution Environment)
3. **Zero vazamento**: Anunciantes nunca veem os dados dos usuários

```typescript
// No frontend, o usuário cria o perfil
const userProfile = {
  age: 25,
  location: Location.SAO_PAULO,
  profession: Profession.SOFTWARE_ENGINEER,
  interests: [Interest.TECH, Interest.CRYPTO],
  gender: Gender.MALE
};

// SDK envia para Sapphire (criptografado)
const ads = await prevdl.getTargetedAds(userProfile);

// ✅ Perfil fica criptografado on-chain
// ✅ Matching é privado
// ✅ Apenas ads relevantes são retornados
```

## 📊 Eventos e Analytics

### Escutar Eventos

```typescript
// Escutar impressões
contract.on('AdImpression', (campaignId, user, matched, event) => {
  console.log(`Ad ${campaignId} impressão:`, matched);
});

// Escutar clicks
contract.on('AdClick', (campaignId, user, event) => {
  console.log(`Ad ${campaignId} clicked by ${user}`);
});
```

### Obter Stats

```typescript
async function getCampaignStats(campaignId: number) {
  const stats = await contract.getCampaignStats(campaignId);
  
  return {
    impressions: stats.impressions.toNumber(),
    clicks: stats.clicks.toNumber(),
    matches: stats.matches.toNumber(),
    matchRate: stats.matchRate.toNumber(),
    ctr: stats.ctr.toNumber()
  };
}
```

## 🎯 Exemplo Completo: React + SDK + Oasis

```typescript
// App.tsx
import { PrevDLAds } from '@prevdl/sdk';
import { useEffect, useState } from 'react';

function App() {
  const [prevdl, setPrevdl] = useState<PrevDLAds>();
  const [ads, setAds] = useState<Ad[]>([]);
  
  useEffect(() => {
    const initPrevDL = async () => {
      const client = new PrevDLAds({
        clientId: 'my-app',
        environment: 'production',
        // Endereço do contrato deployado no Oasis
        adTargetingAddress: process.env.NEXT_PUBLIC_OASIS_CONTRACT
      });
      
      await client.initialize();
      setPrevdl(client);
    };
    
    initPrevDL();
  }, []);
  
  const loadAds = async () => {
    if (!prevdl) return;
    
    // Perfil do usuário (vem do localStorage, etc)
    const userProfile = getUserProfile();
    
    // Obter ads matching (privacy-preserving)
    const matchedAds = await prevdl.getTargetedAds(userProfile);
    setAds(matchedAds);
  };
  
  return (
    <div>
      <h1>Privacy-Preserving Ads</h1>
      {ads.map(ad => (
        <AdCard 
          key={ad.id} 
          ad={ad}
          onImpression={() => prevdl?.recordImpression(ad.id)}
          onClick={() => prevdl?.recordClick(ad.id)}
        />
      ))}
    </div>
  );
}
```

## 🚀 Deploy End-to-End

### 1. Deploy Contratos

```bash
cd packages/oasis
make deploy-testnet
# Anote o endereço: 0x1234...
```

### 2. Configurar SDK

```bash
cd packages/sdk
echo "NEXT_PUBLIC_OASIS_CONTRACT=0x1234..." > .env.local
```

### 3. Build SDK

```bash
cd packages/sdk
pnpm build
```

### 4. Usar em App

```bash
cd packages/sdk/examples/react-app-example
pnpm install
pnpm dev
```

## 🔧 Troubleshooting

### Erro: "Cannot connect to Sapphire"

```typescript
// Verificar RPC URL
const provider = new ethers.providers.JsonRpcProvider(
  'https://testnet.sapphire.oasis.io'
);
await provider.getNetwork(); // Deve retornar chainId 23295
```

### Erro: "User has no profile"

```typescript
// Criar perfil antes de obter ads
await prevdl.setUserProfile(userProfile);
await prevdl.getTargetedAds(userProfile);
```

### Erro: "Campaign does not exist"

```typescript
// Verificar se campaignId existe
const exists = await contract.campaignExists(campaignId);
```

## 📚 Recursos

- [Oasis Sapphire Docs](https://docs.oasis.io/build/sapphire/)
- [Ethers.js Docs](https://docs.ethers.org/)
- [PrevDL SDK Docs](../sdk/README.md)

## 🔐 Segurança

### Melhores Práticas:

1. **Nunca exponha chaves privadas** no frontend
2. **Use MetaMask/WalletConnect** para assinatura de transações
3. **Valide dados** antes de enviar para blockchain
4. **Use HTTPS** sempre
5. **Implemente rate limiting** no backend

### Exemplo de Signer Seguro:

```typescript
// Usar MetaMask
const provider = new ethers.providers.Web3Provider(window.ethereum);
await provider.send("eth_requestAccounts", []);
const signer = provider.getSigner();

// Conectar contrato com signer
const contract = new ethers.Contract(address, abi, signer);
```

---

**Dúvidas?** Abra uma issue no GitHub ou entre no Discord da Oasis!


