import React, { useEffect, useState, useCallback } from 'react';
import type { Ad, UserProfile } from '../types';
import { usePrevDLAds } from './PrevDLProvider';

const convertBigIntToNumber = (value: any): any => {
  if (typeof value === 'bigint') {
    return Number(value);
  }
  if (typeof value === 'object' && value !== null) {
    if (Array.isArray(value)) {
      return value.map(convertBigIntToNumber);
    }
    const converted: any = {};
    for (const key in value) {
      converted[key] = convertBigIntToNumber(value[key]);
    }
    return converted;
  }
  return value;
};

export interface AdsProps {
  userProfile: UserProfile;
  maxAds?: number;
  className?: string;
  onAdClick?: (ad: Ad) => void;
  onAdImpression?: (ad: Ad) => void;
  renderAd?: (ad: Ad) => React.ReactNode;
  loading?: React.ReactNode;
  error?: React.ReactNode;
  devHighlights?: boolean;
}

export const Ads: React.FC<AdsProps> = ({
  userProfile,
  maxAds = 3,
  className = '',
  onAdClick,
  onAdImpression,
  renderAd,
  loading,
  error: errorComponent,
  devHighlights = false,
}) => {
  const prevdlAds = usePrevDLAds();
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [impressionTracked, setImpressionTracked] = useState<Set<string>>(new Set());

  const fetchAds = useCallback(async () => {
    if (!prevdlAds) {
      setError('PrevDL Ads SDK not initialized');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let userAddress: string | undefined;
      if (prevdlAds.oasisAdapter) {
        try {
          userAddress = await prevdlAds.oasisAdapter.getWalletAddress();
          
          const hasUserProfile = await prevdlAds.hasProfile(userAddress);
          if (!hasUserProfile) {
            await prevdlAds.setUserProfile(userProfile, userAddress);
            await new Promise(resolve => setTimeout(resolve, 3000));
          } else {
            try {
              const savedProfile = await prevdlAds.getUserProfile(userAddress);
              const needsUpdate = 
                savedProfile.age !== userProfile.age ||
                savedProfile.location !== userProfile.location ||
                savedProfile.profession !== userProfile.profession ||
                JSON.stringify(savedProfile.interests.sort()) !== JSON.stringify(userProfile.interests.sort()) ||
                savedProfile.gender !== userProfile.gender;
              
              if (needsUpdate) {
                await prevdlAds.setUserProfile(userProfile, userAddress);
                await new Promise(resolve => setTimeout(resolve, 3000));
              }
            } catch {
              await prevdlAds.setUserProfile(userProfile, userAddress);
              await new Promise(resolve => setTimeout(resolve, 3000));
            }
          }

        } catch (err) {
        }
      }

      const matchedAds = await prevdlAds.getTargetedAds(userProfile, userAddress);
      
      const limitedAds = matchedAds.slice(0, maxAds);
      
      setAds(limitedAds);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load ads');
      setIsLoading(false);
    }
  }, [prevdlAds, userProfile, maxAds]);

  const trackImpression = useCallback((ad: Ad) => {
    if (impressionTracked.has(ad.id)) return;

    setImpressionTracked(prev => new Set(prev).add(ad.id));
    
    if (onAdImpression) {
      onAdImpression(ad);
    }

    if (devHighlights) {
    }
  }, [impressionTracked, onAdImpression, devHighlights]);

  const handleAdClick = useCallback((ad: Ad) => {
    if (onAdClick) {
      onAdClick(ad);
    }

    if (devHighlights) {
    }

    if (ad.ctaLink) {
      window.open(ad.ctaLink, '_blank', 'noopener,noreferrer');
    }
  }, [onAdClick, devHighlights]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  useEffect(() => {
    if (ads.length > 0) {
      ads.forEach(ad => trackImpression(ad));
    }
  }, [ads, trackImpression]);

  if (isLoading) {
    return loading || (
      <div className={`prevdl-ads-loading ${className}`}>
        <div className="prevdl-spinner"></div>
        <p>Loading ads...</p>
      </div>
    );
  }

  if (error) {
    return errorComponent || (
      <div className={`prevdl-ads-error ${className}`}>
        <p>Error: {error}</p>
      </div>
    );
  }

  if (ads.length === 0) {
    return (
      <div className={`prevdl-ads-empty ${className}`}>
        <p>No ads available</p>
      </div>
    );
  }

  const isSandbox = prevdlAds?.getEnvironment() === 'sandbox';

  return (
    <div className={`prevdl-ads-container ${className}`}>
      {ads.map((ad) => (
        <div
          key={ad.id}
          className={`prevdl-ad ${devHighlights ? 'prevdl-dev-highlight' : ''}`}
          onClick={() => handleAdClick(ad)}
        >
          {renderAd ? (
            renderAd(ad)
          ) : (
            <DefaultAdRender ad={ad} isSandbox={isSandbox} />
          )}
        </div>
      ))}
    </div>
  );
};

const DefaultAdRender: React.FC<{ ad: Ad; isSandbox?: boolean }> = ({ ad, isSandbox = false }) => {
  const campaignUrl = isSandbox ? (ad.ctaLink || ad.ctaUrl) : null;
  
  return (
    <div className="prevdl-ad-default">
      {ad.imageUrl && (
        <div className="prevdl-ad-image">
          <img 
            src={ad.imageUrl} 
            alt={ad.title}
          />
        </div>
      )}
      <div className="prevdl-ad-content">
        <h3 className="prevdl-ad-title">{ad.title || 'Anúncio'}</h3>
        <p className="prevdl-ad-description">{ad.description || 'Anúncio personalizado baseado no seu perfil'}</p>
        {isSandbox && campaignUrl && (
          <div className="prevdl-ad-url-info" style={{ 
            fontSize: '0.8rem', 
            color: '#888', 
            marginTop: '0.75rem',
            padding: '0.5rem',
            background: '#0a0a0a',
            border: '1px solid #333',
            borderRadius: '4px',
            wordBreak: 'break-all',
            fontFamily: 'monospace'
          }}>
            <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: '0.25rem' }}>
              🔗 URL da Campanha (Sandbox):
            </div>
            <a 
              href={campaignUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{ 
                color: '#4a9eff', 
                textDecoration: 'none',
                wordBreak: 'break-all'
              }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
            >
              {campaignUrl}
            </a>
          </div>
        )}
        <div className="prevdl-ad-footer">
          {ad.ctaText && (
            <button 
              className="prevdl-ad-cta"
              onClick={(e) => {
                e.stopPropagation();
                if (isSandbox && campaignUrl) {
                  window.open(campaignUrl, '_blank', 'noopener,noreferrer');
                }
              }}
            >
              {ad.ctaText}
            </button>
          )}
          {!ad.ctaText && isSandbox && campaignUrl && (
            <button 
              className="prevdl-ad-cta"
              onClick={(e) => {
                e.stopPropagation();
                window.open(campaignUrl, '_blank', 'noopener,noreferrer');
              }}
            >
              Acessar URL
            </button>
          )}
          <div className="prevdl-ad-privacy-badge">
            <small>🔒 Privacy-preserving</small>
            {isSandbox && <small style={{ marginLeft: '0.5rem', color: '#4a9eff' }}>🌊 Sandbox</small>}
          </div>
        </div>
      </div>
    </div>
  );
};

export const defaultStyles = `
.prevdl-ads-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.prevdl-ad {
  background: #000000;
  border: 1px solid #ffffff;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.1s;
  display: flex;
  flex-direction: column;
}

.prevdl-ad:hover {
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 0 #ffffff;
}

.prevdl-ad-default {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.prevdl-ad-image {
  width: 100%;
  overflow: hidden;
  background: #0f0f0f;
}

.prevdl-ad-image img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}

.prevdl-ad-content {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 0.75rem;
}

.prevdl-ad-title {
  margin: 0;
  font-size: 1.25rem;
  color: #ffffff;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: -0.01em;
  line-height: 1.3;
}

.prevdl-ad-description {
  margin: 0;
  color: #888888;
  line-height: 1.5;
  font-size: 0.95rem;
  flex: 1;
}

.prevdl-ad-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-top: auto;
  padding-top: 1rem;
}

.prevdl-ad-cta {
  flex: 1;
  background: #ffffff;
  color: #000000;
  border: 1px solid #ffffff;
  border-radius: 6px;
  padding: 0.75rem 1.5rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.1s;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-family: inherit;
}

.prevdl-ad-cta:hover {
  background: #000000;
  color: #ffffff;
  transform: translate(-2px, -2px);
  box-shadow: 2px 2px 0 #ffffff;
}

.prevdl-ad-privacy-badge {
  background: #000000;
  border: 1px solid #ffffff;
  border-radius: 4px;
  padding: 0.4rem 0.8rem;
  font-size: 0.75rem;
  color: #888888;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.prevdl-ad-privacy-badge small {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.prevdl-dev-highlight {
  border: 2px solid #00ff00 !important;
  background-color: rgba(0, 255, 0, 0.05);
}

.prevdl-ads-loading,
.prevdl-ads-error,
.prevdl-ads-empty {
  padding: 3rem 2rem;
  text-align: center;
  color: #888888;
  background: #000000;
  border: 1px solid #ffffff;
  border-radius: 8px;
}

.prevdl-ads-loading p,
.prevdl-ads-error p,
.prevdl-ads-empty p {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.prevdl-ads-error {
  color: #ffffff;
}

.prevdl-ads-error p {
  font-weight: 700;
}

.prevdl-spinner {
  width: 50px;
  height: 50px;
  border: 2px solid #ffffff;
  border-top: 4px solid #000000;
  border-radius: 50%;
  animation: prevdl-spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes prevdl-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .prevdl-ads-container {
    grid-template-columns: 1fr;
  }

  .prevdl-ad-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .prevdl-ad-cta {
    width: 100%;
  }

  .prevdl-ad-privacy-badge {
    width: 100%;
    text-align: center;
  }
}
`;

