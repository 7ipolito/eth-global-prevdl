/**
 * Ads Component - React component for displaying targeted ads
 * 
 * Privacy-preserving ad display using PREVDL SDK
 */

import React, { useEffect, useState, useCallback } from 'react';
import type { Ad, UserProfile } from '../types';
import { usePrevDLAds } from './PrevDLProvider';

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

  // Fetch targeted ads
  const fetchAds = useCallback(async () => {
    if (!prevdlAds) {
      setError('PrevDL Ads SDK not initialized');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const matchedAds = await prevdlAds.getTargetedAds(userProfile);
      const limitedAds = matchedAds.slice(0, maxAds);
      
      setAds(limitedAds);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Error fetching ads:', err);
      setError(err.message || 'Failed to load ads');
      setIsLoading(false);
    }
  }, [prevdlAds, userProfile, maxAds]);

  // Track impression when ad becomes visible
  const trackImpression = useCallback((ad: Ad) => {
    if (impressionTracked.has(ad.id)) return;

    setImpressionTracked(prev => new Set(prev).add(ad.id));
    
    if (onAdImpression) {
      onAdImpression(ad);
    }

    if (devHighlights) {
      console.log(`👁️  Impression tracked for ad: ${ad.id}`);
    }
  }, [impressionTracked, onAdImpression, devHighlights]);

  // Handle ad click
  const handleAdClick = useCallback((ad: Ad) => {
    if (onAdClick) {
      onAdClick(ad);
    }

    if (devHighlights) {
      console.log(`🖱️  Click tracked for ad: ${ad.id}`);
    }

    // Open ad link
    if (ad.ctaLink) {
      window.open(ad.ctaLink, '_blank', 'noopener,noreferrer');
    }
  }, [onAdClick, devHighlights]);

  // Fetch ads on mount and when user profile changes
  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  // Track impressions when ads are loaded
  useEffect(() => {
    if (ads.length > 0) {
      ads.forEach(ad => trackImpression(ad));
    }
  }, [ads, trackImpression]);

  // Loading state
  if (isLoading) {
    return loading || (
      <div className={`prevdl-ads-loading ${className}`}>
        <p>Loading ads...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return errorComponent || (
      <div className={`prevdl-ads-error ${className}`}>
        <p>Error: {error}</p>
      </div>
    );
  }

  // No ads state
  if (ads.length === 0) {
    return (
      <div className={`prevdl-ads-empty ${className}`}>
        <p>No ads available</p>
      </div>
    );
  }

  // Render ads
  return (
    <div className={`prevdl-ads-container ${className}`}>
      {ads.map((ad) => (
        <div
          key={ad.id}
          className={`prevdl-ad ${devHighlights ? 'prevdl-dev-highlight' : ''}`}
          onClick={() => handleAdClick(ad)}
          style={{
            cursor: 'pointer',
            border: devHighlights ? '2px solid #00ff00' : 'none',
          }}
        >
          {renderAd ? (
            renderAd(ad)
          ) : (
            <DefaultAdRender ad={ad} />
          )}
        </div>
      ))}
    </div>
  );
};

// Default ad renderer
const DefaultAdRender: React.FC<{ ad: Ad }> = ({ ad }) => {
  return (
    <div className="prevdl-ad-default">
      <div className="prevdl-ad-content">
        <h3>{ad.title}</h3>
        <p>{ad.description}</p>
        {ad.imageUrl && (
          <img 
            src={ad.imageUrl} 
            alt={ad.title}
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        )}
        {ad.ctaText && (
          <button className="prevdl-ad-cta">
            {ad.ctaText}
          </button>
        )}
      </div>
      <div className="prevdl-ad-privacy-badge">
        <small>🔒 Privacy-preserving ad</small>
      </div>
    </div>
  );
};

// Export default styles
export const defaultStyles = `
.prevdl-ads-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.prevdl-ad {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  transition: box-shadow 0.3s ease;
}

.prevdl-ad:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.prevdl-ad-default {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.prevdl-ad-content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
}

.prevdl-ad-content p {
  margin: 0 0 1rem 0;
  color: #666;
}

.prevdl-ad-cta {
  background-color: #0070f3;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.prevdl-ad-cta:hover {
  background-color: #0051cc;
}

.prevdl-ad-privacy-badge {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e0e0e0;
  text-align: center;
  color: #999;
}

.prevdl-dev-highlight {
  border: 2px solid #00ff00 !important;
  background-color: rgba(0, 255, 0, 0.05);
}

.prevdl-ads-loading,
.prevdl-ads-error,
.prevdl-ads-empty {
  padding: 2rem;
  text-align: center;
  color: #666;
}
`;

