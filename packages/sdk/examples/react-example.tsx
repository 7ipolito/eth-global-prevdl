/**
 * React Example - Using PrevDL Ads SDK with React components
 * 
 * This example shows how to use the Ads component in a React application
 */

import React from 'react';
import { PrevDLProvider, Ads } from '../src/components';
import { Location, Profession, Interest } from '../src/types';
import type { UserProfile, Ad } from '../src/types';

// Example user profile (this would come from your app's user data)
const userProfile: UserProfile = {
  age: 28,
  location: Location.SAO_PAULO,
  profession: Profession.SOFTWARE_ENGINEER,
  interests: [Interest.TECH, Interest.CRYPTO, Interest.TRAVEL],
};

// App component
function App() {
  return (
    <PrevDLProvider
      config={{
        clientId: 'your-client-id',
        environment: 'sandbox',
        aztecNodeUrl: 'http://localhost:8080',
      }}
    >
      <div className="app">
        <h1>PREVDL Ads Example</h1>
        
        <div className="ads-section">
          <h2>Targeted Ads (Privacy-Preserving)</h2>
          
          <Ads
            userProfile={userProfile}
            maxAds={3}
            devHighlights={true}
            onAdClick={(ad) => {
              console.log('Ad clicked:', ad.id);
            }}
            onAdImpression={(ad) => {
              console.log('Ad impression:', ad.id);
            }}
            renderAd={(ad: Ad) => (
              <div className="custom-ad">
                <h3>{ad.title}</h3>
                <p>{ad.description}</p>
                {ad.imageUrl && <img src={ad.imageUrl} alt={ad.title} />}
                <button>{ad.ctaText || 'Learn More'}</button>
                <small>🔒 Your data stays private</small>
              </div>
            )}
          />
        </div>
      </div>
    </PrevDLProvider>
  );
}

export default App;

// ============================================
// USAGE EXAMPLES
// ============================================

// Example 1: Basic usage with default rendering
export function BasicExample() {
  return (
    <PrevDLProvider
      config={{
        clientId: 'your-client-id',
        environment: 'sandbox',
      }}
    >
      <Ads userProfile={userProfile} maxAds={3} />
    </PrevDLProvider>
  );
}

// Example 2: Custom ad rendering
export function CustomRenderExample() {
  return (
    <PrevDLProvider
      config={{
        clientId: 'your-client-id',
        environment: 'sandbox',
      }}
    >
      <Ads
        userProfile={userProfile}
        maxAds={5}
        renderAd={(ad) => (
          <div className="my-custom-ad-card">
            <img src={ad.imageUrl} alt={ad.title} />
            <div className="content">
              <h4>{ad.title}</h4>
              <p>{ad.description}</p>
              <a href={ad.ctaUrl} target="_blank" rel="noopener noreferrer">
                {ad.ctaText || 'Click here'}
              </a>
            </div>
          </div>
        )}
      />
    </PrevDLProvider>
  );
}

// Example 3: With event handlers
export function EventHandlersExample() {
  const handleAdClick = (ad: Ad) => {
    // Track click in your analytics
    console.log('Ad clicked:', ad.id);
    // Send to your backend
    fetch('/api/track-click', {
      method: 'POST',
      body: JSON.stringify({ adId: ad.id }),
    });
  };

  const handleAdImpression = (ad: Ad) => {
    // Track impression in your analytics
    console.log('Ad impression:', ad.id);
  };

  return (
    <PrevDLProvider
      config={{
        clientId: 'your-client-id',
        environment: 'production',
      }}
    >
      <Ads
        userProfile={userProfile}
        maxAds={3}
        onAdClick={handleAdClick}
        onAdImpression={handleAdImpression}
      />
    </PrevDLProvider>
  );
}

// Example 4: Using the SDK directly (without React components)
import { PrevDLAds } from '../src/core/PrevDLAds';

export async function DirectSDKExample() {
  const prevdlAds = new PrevDLAds({
    clientId: 'your-client-id',
    environment: 'sandbox',
  });

  await prevdlAds.initialize();

  // Get targeted ads
  const ads = await prevdlAds.getTargetedAds(userProfile);
  console.log('Matched ads:', ads);

  // Check specific ad
  const matchResult = await prevdlAds.checkAdMatch(userProfile, '1');
  console.log('Match result:', matchResult);

  // Get stats
  const stats = await prevdlAds.getCampaignStats('1');
  console.log('Campaign stats:', stats);
}

