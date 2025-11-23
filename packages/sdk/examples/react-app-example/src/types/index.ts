export enum Location {
  SAO_PAULO = 1,
  RIO_DE_JANEIRO = 2,
  BRASILIA = 3,
}

export enum Profession {
  SOFTWARE_ENGINEER = 1,
  DESIGNER = 2,
  PRODUCT_MANAGER = 3,
}

export enum Interest {
  TECH = 1,
  CRYPTO = 2,
  GAMING = 3,
  SPORTS = 4,
  FASHION = 5,
  TRAVEL = 6,
}

export enum Gender {
  MALE = 1,
  FEMALE = 2,
  OTHER = 3,
}

export interface UserProfile {
  id?: string;
  age: number;
  location: Location;
  profession: Profession;
  interests: Interest[];
  gender?: Gender;
}

export interface Ad {
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

