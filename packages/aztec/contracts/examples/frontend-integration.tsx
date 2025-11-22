/**
 * EXEMPLO DE INTEGRAÇÃO FRONTEND
 * 
 * Este arquivo mostra como integrar o contrato Aztec no seu React/Next.js
 */

import { 
  createPXEClient, 
  Contract, 
  AccountWallet,
  Fr 
} from '@aztec/aztec.js';
import { AdTargetingContract } from '../src/artifacts/AdTargeting';

// ============================================================================
// CONFIGURAÇÃO INICIAL
// ============================================================================

// URL do nó Aztec (sandbox local ou devnet)
const AZTEC_RPC_URL = process.env.NEXT_PUBLIC_AZTEC_RPC_URL || 'http://localhost:8080';

// Endereço do contrato (você obtém isso após o deploy)
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_AD_CONTRACT_ADDRESS || '';

// URL do seu backend
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

// ============================================================================
// TIPOS
// ============================================================================

interface UserProfile {
  age: number;
  interests: [number, number, number]; // Máximo 3 interesses
  location: number;
  gender: number;
}

interface Ad {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  // Critérios de segmentação
  minAge: number;
  maxAge: number;
  requiredInterest: number;
  targetLocation: number;
  targetGender: number;
}

// ============================================================================
// SERVIÇO AZTEC
// ============================================================================

class AztecAdService {
  private pxe: any;
  private wallet: AccountWallet | null = null;
  private contract: Contract | null = null;

  /**
   * Conecta ao nó Aztec
   */
  async connect() {
    this.pxe = createPXEClient(AZTEC_RPC_URL);
    console.log('✅ Conectado ao Aztec PXE:', AZTEC_RPC_URL);
  }

  /**
   * Conecta a carteira do usuário
   */
  async connectWallet(wallet: AccountWallet) {
    this.wallet = wallet;
    
    // Carrega o contrato
    this.contract = await Contract.at(
      CONTRACT_ADDRESS,
      AdTargetingContract.artifact,
      wallet
    );
    
    console.log('✅ Carteira conectada:', await wallet.getAddress());
    console.log('✅ Contrato carregado:', CONTRACT_ADDRESS);
  }

  /**
   * Verifica se o anúncio é compatível com o perfil do usuário
   * 
   * IMPORTANTE: Esta função mantém os dados do usuário PRIVADOS
   * Apenas o resultado (compatível ou não) é revelado
   */
  async checkAdCompatibility(
    userProfile: UserProfile,
    ad: Ad
  ): Promise<boolean> {
    if (!this.contract) {
      throw new Error('Contrato não carregado. Chame connectWallet() primeiro.');
    }

    console.log('🔒 Verificando compatibilidade (privado)...');
    console.log('   Anúncio:', ad.id);
    console.log('   Seus dados permanecem privados!');

    try {
      // Chama função PRIVADA do contrato
      // Os dados do usuário NÃO vão para blockchain publicamente
      const result = await this.contract.methods
        .check_ad_compatibility(
          Fr.fromString(ad.id),
          userProfile.age,
          userProfile.interests[0],
          userProfile.interests[1],
          userProfile.interests[2],
          userProfile.location,
          userProfile.gender,
          ad.minAge,
          ad.maxAge,
          ad.requiredInterest,
          ad.targetLocation,
          ad.targetGender
        )
        .send()
        .wait();

      const isCompatible = result.value === 1n;
      
      console.log(isCompatible ? '✅ Compatível!' : '❌ Não compatível');
      
      return isCompatible;
    } catch (error) {
      console.error('❌ Erro ao verificar compatibilidade:', error);
      throw error;
    }
  }

  /**
   * Consulta estatísticas públicas de um anúncio
   */
  async getAdStats(adId: string): Promise<{ impressions: bigint; conversions: bigint }> {
    if (!this.contract) {
      throw new Error('Contrato não carregado');
    }

    const stats = await this.contract.methods
      .get_ad_stats(Fr.fromString(adId))
      .view();

    return {
      impressions: stats[0],
      conversions: stats[1]
    };
  }

  /**
   * Consulta taxa de conversão de um anúncio
   */
  async getConversionRate(adId: string): Promise<number> {
    if (!this.contract) {
      throw new Error('Contrato não carregado');
    }

    const rate = await this.contract.methods
      .get_conversion_rate(Fr.fromString(adId))
      .view();

    // Converte de base 10000 para porcentagem (ex: 2500 = 25%)
    return Number(rate) / 100;
  }
}

// ============================================================================
// SERVIÇO BACKEND (Off-Chain)
// ============================================================================

class BackendService {
  /**
   * Registra um like no backend
   */
  async recordLike(userId: string, adId: string) {
    const response = await fetch(`${BACKEND_API_URL}/api/likes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({
        userId,
        adId,
        timestamp: Date.now()
      })
    });

    if (!response.ok) {
      throw new Error('Erro ao registrar like');
    }

    return response.json();
  }

  /**
   * Registra um clique no backend
   */
  async recordClick(userId: string, adId: string, targetUrl: string) {
    const response = await fetch(`${BACKEND_API_URL}/api/clicks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({
        userId,
        adId,
        targetUrl,
        timestamp: Date.now()
      })
    });

    if (!response.ok) {
      throw new Error('Erro ao registrar clique');
    }

    return response.json();
  }

  /**
   * Registra uma impressão no backend
   */
  async recordImpression(
    userId: string, 
    adId: string, 
    wasCompatible: boolean,
    metadata?: any
  ) {
    const response = await fetch(`${BACKEND_API_URL}/api/impressions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({
        userId,
        adId,
        wasCompatible,
        timestamp: Date.now(),
        deviceType: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
        browserType: navigator.userAgent.includes('Chrome') ? 'chrome' : 'other',
        ...metadata
      })
    });

    if (!response.ok) {
      throw new Error('Erro ao registrar impressão');
    }

    return response.json();
  }

  /**
   * Busca anúncios disponíveis
   */
  async getAvailableAds(): Promise<Ad[]> {
    const response = await fetch(`${BACKEND_API_URL}/api/ads/active`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar anúncios');
    }

    return response.json();
  }
}

// ============================================================================
// COMPONENTE REACT DE EXEMPLO
// ============================================================================

export function AdDisplay() {
  const [ads, setAds] = React.useState<Ad[]>([]);
  const [compatibleAds, setCompatibleAds] = React.useState<Ad[]>([]);
  const [loading, setLoading] = React.useState(true);

  const aztecService = React.useRef(new AztecAdService());
  const backendService = React.useRef(new BackendService());

  // Perfil do usuário (você obteria isso do seu sistema de auth)
  const userProfile: UserProfile = {
    age: 25,
    interests: [1, 3, 5], // Tecnologia, Moda, Gastronomia
    location: 1,          // São Paulo
    gender: 1             // Masculino
  };

  const userId = "user_123"; // ID do seu sistema

  React.useEffect(() => {
    loadAds();
  }, []);

  /**
   * Carrega anúncios e verifica compatibilidade
   */
  async function loadAds() {
    try {
      setLoading(true);

      // 1. Conecta ao Aztec
      await aztecService.current.connect();
      // await aztecService.current.connectWallet(wallet); // Você precisaria conectar a wallet

      // 2. Busca anúncios do backend
      const availableAds = await backendService.current.getAvailableAds();
      setAds(availableAds);

      // 3. Verifica compatibilidade de cada anúncio (ON-CHAIN)
      const compatible: Ad[] = [];

      for (const ad of availableAds) {
        try {
          const isCompatible = await aztecService.current.checkAdCompatibility(
            userProfile,
            ad
          );

          // 4. Registra impressão no BACKEND (OFF-CHAIN)
          await backendService.current.recordImpression(
            userId,
            ad.id,
            isCompatible
          );

          if (isCompatible) {
            compatible.push(ad);
          }
        } catch (error) {
          console.error(`Erro ao processar anúncio ${ad.id}:`, error);
        }
      }

      setCompatibleAds(compatible);
      setLoading(false);

    } catch (error) {
      console.error('Erro ao carregar anúncios:', error);
      setLoading(false);
    }
  }

  /**
   * Usuário dá like no anúncio
   */
  async function handleLike(ad: Ad) {
    try {
      await backendService.current.recordLike(userId, ad.id);
      alert('Like registrado! ❤️');
    } catch (error) {
      console.error('Erro ao dar like:', error);
    }
  }

  /**
   * Usuário clica no anúncio
   */
  async function handleClick(ad: Ad) {
    try {
      await backendService.current.recordClick(userId, ad.id, ad.targetUrl);
      window.open(ad.targetUrl, '_blank');
    } catch (error) {
      console.error('Erro ao registrar clique:', error);
    }
  }

  if (loading) {
    return <div>Carregando anúncios...</div>;
  }

  return (
    <div className="ad-container">
      <h2>Anúncios para Você</h2>
      <p>Encontramos {compatibleAds.length} anúncios compatíveis com seu perfil!</p>
      
      {compatibleAds.map(ad => (
        <div key={ad.id} className="ad-card">
          <img src={ad.imageUrl} alt={ad.title} />
          <h3>{ad.title}</h3>
          <p>{ad.description}</p>
          
          <div className="ad-actions">
            <button onClick={() => handleLike(ad)}>
              ❤️ Like
            </button>
            <button onClick={() => handleClick(ad)}>
              🔗 Visitar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

export const aztecAdService = new AztecAdService();
export const backendService = new BackendService();


