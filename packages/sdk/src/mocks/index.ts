/**
 * MOCK DATA for Development
 * Simulates ads and user profiles for local testing
 */

import { Ad, UserProfile, Location, Profession, Interest, Gender } from '../types';

// ============================================
// MOCK USER PROFILES
// ============================================

export const mockUsers: Record<string, UserProfile> = {
  developer: {
    age: 28,
    location: Location.SAO_PAULO,
    profession: Profession.SOFTWARE_ENGINEER,
    interests: [Interest.TECH, Interest.CRYPTO, Interest.TRAVEL],
    gender: Gender.MALE
  },
  
  designer: {
    age: 26,
    location: Location.RIO_DE_JANEIRO,
    profession: Profession.DESIGNER,
    interests: [Interest.FASHION, Interest.ART, Interest.MUSIC],
    gender: Gender.FEMALE
  },
  
  student: {
    age: 22,
    location: Location.BRASILIA,
    profession: Profession.STUDENT,
    interests: [Interest.TECH, Interest.GAMING, Interest.SPORTS],
    gender: Gender.MALE
  },
  
  entrepreneur: {
    age: 35,
    location: Location.SAO_PAULO,
    profession: Profession.ENTREPRENEUR,
    interests: [Interest.BUSINESS, Interest.TECH, Interest.TRAVEL],
    gender: Gender.FEMALE
  },
  
  freelancer: {
    age: 30,
    location: Location.PORTO_ALEGRE,
    profession: Profession.FREELANCER,
    interests: [Interest.TECH, Interest.FOOD, Interest.MUSIC],
    gender: Gender.OTHER
  }
};

// ============================================
// MOCK ADS / CAMPAIGNS
// ============================================

export const mockAds: Ad[] = [
  {
    id: '1',
    title: 'Curso de Blockchain - Web3 Brasil',
    description: 'Aprenda desenvolvimento blockchain do zero ao avancado. Solidity, Smart Contracts e DeFi.',
    imageUrl: 'https://via.placeholder.com/400x200?text=Web3+Course',
    ctaUrl: 'https://web3brasil.com/curso',
    
    // Targeting: Devs jovens interessados em Tech/Crypto
    targetAgeMin: 20,
    targetAgeMax: 35,
    targetLocation: Location.ANY, // Qualquer localizacao
    targetProfession: Profession.SOFTWARE_ENGINEER,
    targetInterest: Interest.CRYPTO,
    targetGender: Gender.ANY,
    
    // Bidding
    bidPerImpression: 0.02, // $0.02 por impressao
    bidPerClick: 0.25,      // $0.25 por clique
    
    // Stats (mockados)
    impressions: 1543,
    clicks: 89,
    matches: 432,
    
    rankingScore: 0.02 * 100 // bid * quality (assumindo quality = 100%)
  },
  
  {
    id: '2',
    title: 'Design System Bootcamp',
    description: 'Domine Figma, Component Libraries e Design Tokens. Ideal para designers que querem evoluir.',
    imageUrl: 'https://via.placeholder.com/400x200?text=Design+Bootcamp',
    ctaUrl: 'https://designbootcamp.com',
    
    // Targeting: Designers interessados em Art/Fashion
    targetAgeMin: 22,
    targetAgeMax: 40,
    targetLocation: Location.RIO_DE_JANEIRO,
    targetProfession: Profession.DESIGNER,
    targetInterest: Interest.ART,
    targetGender: Gender.ANY,
    
    bidPerImpression: 0.015,
    bidPerClick: 0.20,
    
    impressions: 892,
    clicks: 45,
    matches: 267,
    
    rankingScore: 0.015 * 100
  },
  
  {
    id: '3',
    title: 'Startup Weekend SP',
    description: 'Evento para empreendedores em Sao Paulo. Networking, pitch e mentoria com investidores.',
    imageUrl: 'https://via.placeholder.com/400x200?text=Startup+Weekend',
    ctaUrl: 'https://startupweekendsp.com',
    
    // Targeting: Empreendedores em SP interessados em Business
    targetAgeMin: 25,
    targetAgeMax: 45,
    targetLocation: Location.SAO_PAULO,
    targetProfession: Profession.ENTREPRENEUR,
    targetInterest: Interest.BUSINESS,
    targetGender: Gender.ANY,
    
    bidPerImpression: 0.03,
    bidPerClick: 0.50,
    
    impressions: 2145,
    clicks: 178,
    matches: 589,
    
    rankingScore: 0.03 * 100
  },
  
  {
    id: '4',
    title: 'Gaming Tournament - R$ 50k em Premios',
    description: 'Campeonato de e-sports. Jogos: CS2, Valorant, League of Legends. Inscricoes abertas!',
    imageUrl: 'https://via.placeholder.com/400x200?text=Gaming+Tournament',
    ctaUrl: 'https://gamingtournament.gg',
    
    // Targeting: Estudantes interessados em Gaming
    targetAgeMin: 18,
    targetAgeMax: 28,
    targetLocation: Location.ANY,
    targetProfession: Profession.STUDENT,
    targetInterest: Interest.GAMING,
    targetGender: Gender.ANY,
    
    bidPerImpression: 0.01,
    bidPerClick: 0.15,
    
    impressions: 5432,
    clicks: 876,
    matches: 1234,
    
    rankingScore: 0.01 * 100
  },
  
  {
    id: '5',
    title: 'Remote Jobs for Devs - US Companies',
    description: 'Vagas remotas em empresas americanas. Salario em USD. Trabalhe de qualquer lugar.',
    imageUrl: 'https://via.placeholder.com/400x200?text=Remote+Jobs',
    ctaUrl: 'https://remotejobs.tech',
    
    // Targeting: Devs de qualquer lugar interessados em Tech
    targetAgeMin: 23,
    targetAgeMax: 40,
    targetLocation: Location.ANY,
    targetProfession: Profession.SOFTWARE_ENGINEER,
    targetInterest: Interest.TECH,
    targetGender: Gender.ANY,
    
    bidPerImpression: 0.025,
    bidPerClick: 0.40,
    
    impressions: 3456,
    clicks: 234,
    matches: 892,
    
    rankingScore: 0.025 * 100
  },
  
  {
    id: '6',
    title: 'Fashion Week RJ - Ingressos',
    description: 'Semana de moda no Rio. Shows, desfiles e networking. Ultimos ingressos!',
    imageUrl: 'https://via.placeholder.com/400x200?text=Fashion+Week',
    ctaUrl: 'https://fashionweekrj.com',
    
    // Targeting: Pessoas no Rio interessadas em Fashion
    targetAgeMin: 20,
    targetAgeMax: 50,
    targetLocation: Location.RIO_DE_JANEIRO,
    targetProfession: Profession.ANY,
    targetInterest: Interest.FASHION,
    targetGender: Gender.ANY,
    
    bidPerImpression: 0.018,
    bidPerClick: 0.30,
    
    impressions: 1876,
    clicks: 123,
    matches: 445,
    
    rankingScore: 0.018 * 100
  }
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get a random mock user
 */
export function getRandomUser(): UserProfile {
  const users = Object.values(mockUsers);
  return users[Math.floor(Math.random() * users.length)];
}

/**
 * Get ads that match a user profile (client-side matching simulation)
 */
export function getMatchingAds(userProfile: UserProfile): Ad[] {
  return mockAds.filter(ad => {
    // Age check
    const ageMatch = userProfile.age >= ad.targetAgeMin && userProfile.age <= ad.targetAgeMax;
    
    // Location check (0 = any location)
    const locationMatch = ad.targetLocation === Location.ANY || userProfile.location === ad.targetLocation;
    
    // Profession check (0 = any profession)
    const professionMatch = ad.targetProfession === Profession.ANY || userProfile.profession === ad.targetProfession;
    
    // Interest check (user has up to 3 interests)
    const interestMatch = userProfile.interests.includes(ad.targetInterest);
    
    // Gender check (0 = any gender)
    const genderMatch = !ad.targetGender || ad.targetGender === Gender.ANY || userProfile.gender === ad.targetGender;
    
    return ageMatch && locationMatch && professionMatch && interestMatch && genderMatch;
  }).sort((a, b) => b.rankingScore - a.rankingScore); // Sort by ranking score (highest bid first)
}

/**
 * Simulate a match check with details
 */
export function simulateMatch(userProfile: UserProfile, ad: Ad) {
  const ageMatch = userProfile.age >= ad.targetAgeMin && userProfile.age <= ad.targetAgeMax;
  const locationMatch = ad.targetLocation === Location.ANY || userProfile.location === ad.targetLocation;
  const professionMatch = ad.targetProfession === Profession.ANY || userProfile.profession === ad.targetProfession;
  const interestMatch = userProfile.interests.includes(ad.targetInterest);
  const genderMatch = !ad.targetGender || ad.targetGender === Gender.ANY || userProfile.gender === ad.targetGender;
  
  const isMatch = ageMatch && locationMatch && professionMatch && interestMatch && genderMatch;
  
  return {
    adId: ad.id,
    isMatch,
    matchDetails: {
      ageMatch,
      locationMatch,
      professionMatch,
      interestMatch,
      genderMatch
    }
  };
}

