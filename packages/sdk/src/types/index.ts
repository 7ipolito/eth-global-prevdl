/**
 * PREVDL SDK Types
 * All TypeScript types for the SDK
 */

// ============================================
// ENUMS
// ============================================

export enum Location {
  ANY = 0,
  SAO_PAULO = 1,
  RIO_DE_JANEIRO = 2,
  BRASILIA = 3,
  BELO_HORIZONTE = 4,
  PORTO_ALEGRE = 5,
  CURITIBA = 6,
  SALVADOR = 7,
  FORTALEZA = 8,
  RECIFE = 9,
  MANAUS = 10,
  OTHER_BRAZIL = 99,
  INTERNATIONAL = 100
}

export enum Profession {
  ANY = 0,
  SOFTWARE_ENGINEER = 1,
  DESIGNER = 2,
  PRODUCT_MANAGER = 3,
  MARKETING = 4,
  SALES = 5,
  ENTREPRENEUR = 6,
  STUDENT = 7,
  FREELANCER = 8,
  EXECUTIVE = 9,
  HEALTHCARE = 10,
  EDUCATION = 11,
  FINANCE = 12,
  OTHER = 99
}

export enum Interest {
  TECH = 1,
  CRYPTO = 2,
  GAMING = 3,
  SPORTS = 4,
  FASHION = 5,
  TRAVEL = 6,
  FOOD = 7,
  MUSIC = 8,
  ART = 9,
  BUSINESS = 10
}

export enum Gender {
  ANY = 0,
  MALE = 1,
  FEMALE = 2,
  OTHER = 3
}

// ============================================
// USER PROFILE (PRIVATE DATA)
// ============================================

export interface UserProfile {
  age: number;
  location: Location;
  profession: Profession;
  interests: Interest[];  // Max 3 interests
  gender?: Gender;
}

// ============================================
// AD / CAMPAIGN TYPES
// ============================================

export interface Ad {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  ctaUrl: string;
  ctaLink?: string; // Alias for ctaUrl
  ctaText?: string; // Call-to-action button text
  
  // Targeting (public)
  targetAgeMin: number;
  targetAgeMax: number;
  targetLocation: Location;
  targetProfession: Profession;
  targetInterest: Interest;
  targetGender?: Gender;
  
  // Bidding
  bidPerImpression: number;
  bidPerClick: number;
  
  // Stats (public)
  impressions: number;
  clicks: number;
  matches: number;
  
  // Ranking score (for sorting)
  rankingScore: number;
}

export interface Campaign {
  id: string;
  advertiser: string;
  
  // Creative
  title: string;
  description: string;
  imageUrl?: string;
  ctaUrl: string;
  
  // Targeting
  targetAgeMin: number;
  targetAgeMax: number;
  targetLocation: Location;
  targetProfession: Profession;
  targetInterest: Interest;
  targetGender?: Gender;
  
  // Budget
  budgetUSDC: number;
  spentUSDC: number;
  dailyBudgetUSDC?: number;
  
  // Bidding
  bidPerImpression: number;
  bidPerClick: number;
  
  // Status
  status: CampaignStatus;
  
  // Timestamps
  createdAt: Date;
  activatedAt?: Date;
}

export type CampaignStatus = 
  | 'pending'
  | 'bridging'
  | 'active'
  | 'paused'
  | 'budget_exceeded'
  | 'completed';

// ============================================
// MATCHING RESULT
// ============================================

export interface MatchResult {
  adId: string;
  isMatch: boolean;
  matchDetails?: {
    ageMatch: boolean;
    locationMatch: boolean;
    professionMatch: boolean;
    interestMatch: boolean;
    genderMatch: boolean;
  };
}

// ============================================
// SDK CONFIG
// ============================================

export type PrevDLEnvironment = 'local' | 'sandbox' | 'devnet' | 'production';

export interface SDKConfig {
  mode: 'local' | 'sandbox' | 'devnet';
  aztecNodeUrl?: string;
  adTargetingAddress?: string;
  adAuctionAddress?: string;
  contracts?: {
    adTargeting?: string;
    adAuction?: string;
  };
}

export interface PrevDLAdsConfig {
  clientId: string;
  environment?: PrevDLEnvironment;
  aztecNodeUrl?: string;
  adTargetingAddress?: string;
  adAuctionAddress?: string;
}

// ============================================
// HELPER TYPES
// ============================================

export interface CreateCampaignParams {
  title: string;
  description: string;
  imageUrl?: string;
  ctaUrl: string;
  
  targetAgeMin: number;
  targetAgeMax: number;
  targetLocation: Location;
  targetProfession: Profession;
  targetInterest: Interest;
  targetGender?: Gender;
  
  budgetUSDC: number;
  bidPerImpression: number;
  bidPerClick: number;
}

