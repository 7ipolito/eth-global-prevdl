import React, { useState } from 'react';
import { PrevDLProvider, Ads } from '@prevdl/sdk/components';
import { Location, Profession, Interest, Gender } from '@prevdl/sdk';
import type { UserProfile, Ad } from '@prevdl/sdk';
import './App.css';

function App() {
  // Estado do perfil do usuário (simulando dados do usuário logado)
  const [userProfile, setUserProfile] = useState<UserProfile>({
    age: 28,
    location: Location.SAO_PAULO,
    profession: Profession.SOFTWARE_ENGINEER,
    interests: [Interest.TECH, Interest.CRYPTO, Interest.TRAVEL],
    gender: Gender.MALE,
  });

  const [showCustomRender, setShowCustomRender] = useState(false);
  const [devMode, setDevMode] = useState(false);

  // Handler para clique em anúncio
  const handleAdClick = (ad: Ad) => {
    console.log('🖱️  Anúncio clicado:', ad.id, ad.title);
    alert(`Você clicou no anúncio: ${ad.title}`);
  };

  // Handler para impressão de anúncio
  const handleAdImpression = (ad: Ad) => {
    console.log('👁️  Impressão registrada:', ad.id);
  };

  // Renderização customizada de anúncio
  const renderCustomAd = (ad: Ad) => (
    <div className="custom-ad-card">
      {ad.imageUrl && (
        <div className="ad-image-container">
          <img src={ad.imageUrl} alt={ad.title} className="ad-image" />
        </div>
      )}
      <div className="ad-content">
        <h3 className="ad-title">{ad.title}</h3>
        <p className="ad-description">{ad.description}</p>
        <div className="ad-footer">
          <button className="ad-cta-button">
            {ad.ctaText || 'Saiba Mais'} →
          </button>
          <span className="privacy-badge">
            🔒 Privado
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
    <h1>OLAA</h1>
    <PrevDLProvider
      config={{
        clientId: 'react-example-app',
        environment: 'local', // Usando ambiente local (mock data)
      }}
    >
      <div className="app">
        {/* Header */}
        <header className="app-header">
          <div className="header-content">
            <h1>🔒 PREVDL SDK</h1>
            <p className="subtitle">Privacy-Preserving Ad Targeting</p>
          </div>
        </header>

        {/* Main Content */}
        <main className="app-main">
          {/* User Profile Section */}
          <section className="profile-section">
            <h2>👤 Perfil do Usuário</h2>
            <div className="profile-card">
              <div className="profile-info">
                <div className="profile-item">
                  <strong>Idade:</strong> {userProfile.age} anos
                </div>
                <div className="profile-item">
                  <strong>Localização:</strong> {Location[userProfile.location]}
                </div>
                <div className="profile-item">
                  <strong>Profissão:</strong> {Profession[userProfile.profession]}
                </div>
                <div className="profile-item">
                  <strong>Interesses:</strong>{' '}
                  {userProfile.interests.map(i => Interest[i]).join(', ')}
                </div>
              </div>
              <div className="privacy-note">
                <p>
                  🔐 <strong>Seus dados são privados!</strong>
                  <br />
                  Apenas você vê essas informações. Os anunciantes veem apenas
                  se você corresponde ao perfil deles (sim/não).
                </p>
              </div>
            </div>
          </section>

          {/* Controls */}
          <section className="controls-section">
            <h2>⚙️ Controles</h2>
            <div className="controls">
              <label className="control-item">
                <input
                  type="checkbox"
                  checked={showCustomRender}
                  onChange={(e) => setShowCustomRender(e.target.checked)}
                />
                <span>Usar renderização customizada</span>
              </label>
              <label className="control-item">
                <input
                  type="checkbox"
                  checked={devMode}
                  onChange={(e) => setDevMode(e.target.checked)}
                />
                <span>Modo desenvolvedor (highlights)</span>
              </label>
            </div>
          </section>

          {/* Ads Section */}
          <section className="ads-section">
            <h2>📢 Anúncios Segmentados</h2>
            <p className="ads-description">
              Estes anúncios foram selecionados especificamente para você com
              base no seu perfil, mantendo sua privacidade.
            </p>

            <Ads
              userProfile={userProfile}
              maxAds={6}
              className="ads-container"
              onAdClick={handleAdClick}
              onAdImpression={handleAdImpression}
              renderAd={showCustomRender ? renderCustomAd : undefined}
              devHighlights={devMode}
              loading={
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Carregando anúncios personalizados...</p>
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
          </section>

          {/* Info Section */}
          <section className="info-section">
            <h2>ℹ️ Como Funciona</h2>
            <div className="info-grid">
              <div className="info-card">
                <div className="info-icon">🔒</div>
                <h3>Privacidade Total</h3>
                <p>
                  Seus dados pessoais nunca saem do seu dispositivo. Apenas o
                  resultado do match é compartilhado.
                </p>
              </div>
              <div className="info-card">
                <div className="info-icon">🎯</div>
                <h3>Targeting Preciso</h3>
                <p>
                  Anúncios relevantes baseados em idade, localização, profissão
                  e interesses.
                </p>
              </div>
              <div className="info-card">
                <div className="info-icon">⚡</div>
                <h3>Zero-Knowledge</h3>
                <p>
                  Powered by Aztec Network para garantir privacidade com provas
                  de conhecimento zero.
                </p>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="app-footer">
          <p>
            Feito com ❤️ usando{' '}
            <a
              href="https://github.com/your-repo"
              target="_blank"
              rel="noopener noreferrer"
            >
              PREVDL SDK
            </a>
          </p>
          <p className="footer-note">
            Ambiente: <strong>LOCAL</strong> (dados mock) | Abra o console para
            ver os logs
          </p>
        </footer>
      </div>
    </PrevDLProvider>
    </>
  );
}

export default App;

