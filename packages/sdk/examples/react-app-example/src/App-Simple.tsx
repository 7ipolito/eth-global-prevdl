import { useState, useEffect } from 'react';
import { Lock, User, Megaphone, Info, Shield, Target, Zap, ArrowRight, Heart } from 'lucide-react';
import './App.css';

// Tipos simplificados (copiados do SDK)
enum Location {
  SAO_PAULO = 1,
  RIO_DE_JANEIRO = 2,
  BRASILIA = 3,
}

enum Profession {
  SOFTWARE_ENGINEER = 1,
  DESIGNER = 2,
  PRODUCT_MANAGER = 3,
}

enum Interest {
  TECH = 1,
  CRYPTO = 2,
  GAMING = 3,
  SPORTS = 4,
  FASHION = 5,
  TRAVEL = 6,
}

enum Gender {
  MALE = 1,
  FEMALE = 2,
  OTHER = 3,
}

interface UserProfile {
  age: number;
  location: Location;
  profession: Profession;
  interests: Interest[];
  gender?: Gender;
}

interface Ad {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  ctaUrl: string;
  ctaText?: string;
  targetAgeMin: number;
  targetAgeMax: number;
  targetLocation: Location;
  targetProfession: Profession;
  targetInterest: Interest;
  rankingScore: number;
}

// Mock ads (dados de exemplo)
const mockAds: Ad[] = [
  // Anúncios para pessoas mais jovens (18-30 anos)
  {
    id: '1',
    title: 'Bootcamp Fullstack - Primeira Turma',
    description: 'Aprenda desenvolvimento web do zero em 12 semanas. Garantia de emprego ou seu dinheiro de volta!',
    ctaUrl: 'https://example.com/bootcamp',
    ctaText: 'Inscreva-se Agora',
    targetAgeMin: 18,
    targetAgeMax: 28,
    targetLocation: Location.SAO_PAULO,
    targetProfession: Profession.SOFTWARE_ENGINEER,
    targetInterest: Interest.TECH,
    rankingScore: 2.8,
  },
  {
    id: '2',
    title: 'Cripto para Iniciantes - Curso Gratuito',
    description: 'Descubra como investir em Bitcoin e Ethereum com segurança. Aulas ao vivo toda semana.',
    ctaUrl: 'https://example.com/crypto-young',
    ctaText: 'Começar Agora',
    targetAgeMin: 20,
    targetAgeMax: 30,
    targetLocation: Location.SAO_PAULO,
    targetProfession: Profession.SOFTWARE_ENGINEER,
    targetInterest: Interest.CRYPTO,
    rankingScore: 2.5,
  },
  {
    id: '3',
    title: 'Mochilão pela América do Sul',
    description: 'Pacote completo para 3 meses viajando por 8 países. Hospedagem em hostels e transporte inclusos.',
    ctaUrl: 'https://example.com/backpack',
    ctaText: 'Ver Roteiro',
    targetAgeMin: 20,
    targetAgeMax: 28,
    targetLocation: Location.SAO_PAULO,
    targetProfession: Profession.SOFTWARE_ENGINEER,
    targetInterest: Interest.TRAVEL,
    rankingScore: 2.3,
  },
  {
    id: '4',
    title: 'Gaming Setup Completo - 30% OFF',
    description: 'Monte seu setup gamer profissional com PC, monitor 144Hz, teclado mecânico e mouse. Parcele em 12x sem juros.',
    ctaUrl: 'https://example.com/gaming',
    ctaText: 'Montar Setup',
    targetAgeMin: 18,
    targetAgeMax: 25,
    targetLocation: Location.SAO_PAULO,
    targetProfession: Profession.SOFTWARE_ENGINEER,
    targetInterest: Interest.GAMING,
    rankingScore: 2.2,
  },

  // Anúncios para pessoas mais velhas (35-55 anos)
  {
    id: '5',
    title: 'Planejamento de Aposentadoria Inteligente',
    description: 'Consultoria financeira personalizada para garantir sua aposentadoria tranquila. Primeira consulta gratuita.',
    ctaUrl: 'https://example.com/retirement',
    ctaText: 'Agendar Consulta',
    targetAgeMin: 40,
    targetAgeMax: 55,
    targetLocation: Location.SAO_PAULO,
    targetProfession: Profession.SOFTWARE_ENGINEER,
    targetInterest: Interest.CRYPTO,
    rankingScore: 2.7,
  },
  {
    id: '6',
    title: 'Cruzeiro Executivo - Caribe Premium',
    description: 'Viagem all-inclusive de 15 dias pelos melhores destinos do Caribe. Cabines de luxo e gastronomia internacional.',
    ctaUrl: 'https://example.com/cruise',
    ctaText: 'Ver Pacotes',
    targetAgeMin: 40,
    targetAgeMax: 60,
    targetLocation: Location.SAO_PAULO,
    targetProfession: Profession.SOFTWARE_ENGINEER,
    targetInterest: Interest.TRAVEL,
    rankingScore: 2.6,
  },
  {
    id: '7',
    title: 'MBA em Gestão de TI - Noturno',
    description: 'Especialize-se em liderança e gestão de equipes de tecnologia. Aulas 2x por semana, certificado reconhecido pelo MEC.',
    ctaUrl: 'https://example.com/mba',
    ctaText: 'Saiba Mais',
    targetAgeMin: 35,
    targetAgeMax: 50,
    targetLocation: Location.SAO_PAULO,
    targetProfession: Profession.SOFTWARE_ENGINEER,
    targetInterest: Interest.TECH,
    rankingScore: 2.4,
  },
  {
    id: '8',
    title: 'Investimentos em Renda Fixa - Baixo Risco',
    description: 'Diversifique seu portfólio com CDBs, LCIs e Tesouro Direto. Rentabilidade acima da poupança com segurança.',
    ctaUrl: 'https://example.com/investments',
    ctaText: 'Começar a Investir',
    targetAgeMin: 38,
    targetAgeMax: 55,
    targetLocation: Location.SAO_PAULO,
    targetProfession: Profession.SOFTWARE_ENGINEER,
    targetInterest: Interest.CRYPTO,
    rankingScore: 2.3,
  },

  // Anúncios para faixa intermediária (28-40 anos)
  {
    id: '9',
    title: 'Curso de React Avançado',
    description: 'Domine React, Next.js e TypeScript. Aprenda arquitetura de software e boas práticas com projetos reais.',
    ctaUrl: 'https://example.com/react',
    ctaText: 'Inscreva-se',
    targetAgeMin: 25,
    targetAgeMax: 40,
    targetLocation: Location.SAO_PAULO,
    targetProfession: Profession.SOFTWARE_ENGINEER,
    targetInterest: Interest.TECH,
    rankingScore: 2.5,
  },
  {
    id: '10',
    title: 'Viagem em Família - Disney Orlando',
    description: 'Pacote completo para 7 dias em Orlando. Ingressos para todos os parques, hotel e traslados inclusos.',
    ctaUrl: 'https://example.com/disney',
    ctaText: 'Ver Ofertas',
    targetAgeMin: 30,
    targetAgeMax: 45,
    targetLocation: Location.SAO_PAULO,
    targetProfession: Profession.SOFTWARE_ENGINEER,
    targetInterest: Interest.TRAVEL,
    rankingScore: 2.1,
  },
];

// Função de matching simplificada
function getMatchingAds(userProfile: UserProfile, ads: Ad[]): Ad[] {
  return ads.filter(ad => {
    const ageMatch = userProfile.age >= ad.targetAgeMin && userProfile.age <= ad.targetAgeMax;
    const locationMatch = userProfile.location === ad.targetLocation;
    const professionMatch = userProfile.profession === ad.targetProfession;
    const interestMatch = userProfile.interests.includes(ad.targetInterest);
    
    return ageMatch && locationMatch && professionMatch && interestMatch;
  }).sort((a, b) => b.rankingScore - a.rankingScore);
}

function App() {
  const [userAge, setUserAge] = useState(28);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    age: 28,
    location: Location.SAO_PAULO,
    profession: Profession.SOFTWARE_ENGINEER,
    interests: [Interest.TECH, Interest.CRYPTO, Interest.TRAVEL, Interest.GAMING],
    gender: Gender.MALE,
  });

  const [matchedAds, setMatchedAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Atualizar perfil quando idade mudar
    setUserProfile(prev => ({ ...prev, age: userAge }));
  }, [userAge]);

  useEffect(() => {
    // Simular carregamento
    setLoading(true);
    setTimeout(() => {
      const ads = getMatchingAds(userProfile, mockAds);
      setMatchedAds(ads);
      setLoading(false);
    }, 300);
  }, [userProfile]);

  const handleAdClick = (ad: Ad) => {
    console.log('Ad clicked:', ad.id, ad.title);
    alert(`You clicked on the ad: ${ad.title}`);
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <h1>PREVDL SDK</h1>
            <p className="subtitle">Privacy-Preserving Ad Targeting</p>
          </div>
          <div className="header-right">
            <a href="#general" className="header-link">general</a>
            <a href="#ads" className="header-link">ads</a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {/* User Profile Section */}
        <section className="profile-section">
          <h2>
            <User size={24} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.5rem' }} />
            User Profile
          </h2>
          <div className="profile-card">
            {/* Age Selector */}
            <div className="age-selector">
              <label className="age-label">
                Adjust Age: {userAge} years
              </label>
              <input
                type="range"
                min="18"
                max="60"
                value={userAge}
                onChange={(e) => setUserAge(Number(e.target.value))}
                className="age-slider"
              />
              <div className="age-labels">
                <span>18 years (younger)</span>
                <span>60 years (older)</span>
              </div>
              <p className="age-hint">
                <strong>Test:</strong> Move the slider to see different ads for each age range!
              </p>
            </div>

            <div className="profile-info">
              <div className="profile-item">
                <strong>Age:</strong> {userProfile.age} years
              </div>
              <div className="profile-item">
                <strong>Location:</strong> {Location[userProfile.location]}
              </div>
              <div className="profile-item">
                <strong>Profession:</strong> {Profession[userProfile.profession]}
              </div>
              <div className="profile-item">
                <strong>Interests:</strong>{' '}
                {userProfile.interests.map(i => Interest[i]).join(', ')}
              </div>
            </div>
            <div className="privacy-note">
              <p>
                <Shield size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.5rem' }} />
                <strong>Your data is private!</strong>
                <br />
                Only you see this information. Advertisers only see
                if you match their profile (yes/no).
              </p>
            </div>
          </div>
        </section>

        {/* Ads Section */}
        <section className="ads-section" id="ads">
          <h2>
            <Megaphone size={24} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.5rem' }} />
            Targeted Ads
          </h2>
          <p className="ads-description">
            These ads were selected specifically for you based on
            your profile, maintaining your privacy.
          </p>
          {!loading && (
            <div className="ads-count">
              <p>
                Found <strong>{matchedAds.length}</strong> relevant ads for your profile!
              </p>
            </div>
          )}

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading personalized ads...</p>
            </div>
          ) : matchedAds.length === 0 ? (
            <div className="error-state">
              <p>No ads found for your profile</p>
            </div>
          ) : (
            <div className="ads-container">
              {matchedAds.map(ad => (
                <div
                  key={ad.id}
                  className="custom-ad-card"
                  onClick={() => handleAdClick(ad)}
                >
                  <div className="ad-content">
                    <h3 className="ad-title">{ad.title}</h3>
                    <p className="ad-description">{ad.description}</p>
                    <div className="ad-footer">
                      <button className="ad-cta-button">
                        {ad.ctaText || 'Learn More'} <ArrowRight size={16} />
                      </button>
                      <span className="privacy-badge">
                        <Lock size={14} /> Private
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Info Section */}
        <section className="info-section" id="general">
          <h2>
            <Info size={24} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.5rem' }} />
            How It Works
          </h2>
          <div className="info-grid">
            <div className="info-card">
              <div className="info-icon">
                <Lock size={32} />
              </div>
              <h3>Total Privacy</h3>
              <p>
                Your personal data never leaves your device. Only the
                match result is shared.
              </p>
            </div>
            <div className="info-card">
              <div className="info-icon">
                <Target size={32} />
              </div>
              <h3>Precise Targeting</h3>
              <p>
                Relevant ads based on age, location, profession
                and interests.
              </p>
            </div>
            <div className="info-card">
              <div className="info-icon">
                <Zap size={32} />
              </div>
              <h3>Zero-Knowledge</h3>
              <p>
                Powered by Aztec Network to ensure privacy with zero
                knowledge proofs.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>
          Made with <Heart size={14} style={{ display: 'inline-block', verticalAlign: 'middle' }} /> using{' '}
          <a
            href="https://github.com/your-repo"
            target="_blank"
            rel="noopener noreferrer"
          >
            PREVDL SDK
          </a>
        </p>
        <p className="footer-note">
          Environment: <strong>LOCAL</strong> (mock data) | Open the console to
          see the logs
        </p>
      </footer>
    </div>
  );
}

export default App;

