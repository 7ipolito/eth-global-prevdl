import { mockAds } from './mockData';
import { DashboardAd, AdMetrics } from '../types/dashboard';

function generateMockMetrics(adId: string): AdMetrics {
  return {
    adId,
    clicks: Math.floor(Math.random() * 1000) + 50,
    impressions: Math.floor(Math.random() * 5000) + 200,
    date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    amountPaid: Math.floor(Math.random() * 500) + 10,
  };
}

export const dashboardAds: DashboardAd[] = mockAds.map(ad => ({
  ...ad,
  metrics: generateMockMetrics(ad.id),
}));

