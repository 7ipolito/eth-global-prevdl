import { Ad } from './index';

export interface AdMetrics {
  adId: string;
  clicks: number;
  impressions: number;
  date: string;
  amountPaid: number;
  imageUrl?: string;
  status?: string;
}

export interface DashboardAd extends Ad {
  metrics: AdMetrics;
}

