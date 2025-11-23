/**
 * PrevDL Provider - React Context Provider for PrevDL Ads SDK
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { PrevDLAds } from '../core/PrevDLAds';
import type { PrevDLAdsConfig } from '../types';

interface PrevDLContextValue {
  prevdlAds: PrevDLAds | null;
  isInitialized: boolean;
  error: string | null;
}

const PrevDLContext = createContext<PrevDLContextValue>({
  prevdlAds: null,
  isInitialized: false,
  error: null,
});

export interface PrevDLProviderProps {
  config: PrevDLAdsConfig;
  children: React.ReactNode;
}

export const PrevDLProvider: React.FC<PrevDLProviderProps> = ({ config, children }) => {
  const [prevdlAds, setPrevdlAds] = useState<PrevDLAds | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeSDK = async () => {
      try {
        const sdk = new PrevDLAds(config);
        await sdk.initialize();
        setPrevdlAds(sdk);
        setIsInitialized(true);
      } catch (err: any) {
        console.error('Failed to initialize PrevDL SDK:', err);
        setError(err.message || 'Failed to initialize SDK');
      }
    };

    initializeSDK();
  }, [config]);

  // Show error state if initialization failed
  if (error) {
    return (
      <div style={{ padding: '2rem', color: '#ff0000', background: '#000000', minHeight: '100vh' }}>
        <h1>SDK Initialization Error</h1>
        <p>{error}</p>
        <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#888' }}>
          Check the browser console for more details.
        </p>
      </div>
    );
  }

  // Show loading state while initializing (optional - can be removed if you want to show children immediately)
  // if (!isInitialized) {
  //   return (
  //     <div style={{ padding: '2rem', color: '#ffffff', background: '#000000', minHeight: '100vh' }}>
  //       <p>Initializing SDK...</p>
  //     </div>
  //   );
  // }

  return (
    <PrevDLContext.Provider value={{ prevdlAds, isInitialized, error }}>
      {children}
    </PrevDLContext.Provider>
  );
};

export const usePrevDLAds = (): PrevDLAds | null => {
  const context = useContext(PrevDLContext);
  return context.prevdlAds;
};

export const usePrevDLContext = (): PrevDLContextValue => {
  return useContext(PrevDLContext);
};

