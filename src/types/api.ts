// Common API Response
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Auth Types
export interface AuthResponse {
  accessToken: string;
  user: User;
}

// Gender enum
export type Gender = 'MALE' | 'FEMALE' | 'NONE';

// Age Range enum
export type AgeRange = 'TEENS' | 'TWENTIES' | 'THIRTIES' | 'FORTIES_FIFTIES' | 'SIXTIES_PLUS';

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: string;
  membership: 'FREE' | 'TIER1';
  isNewUser?: boolean;
  termsAgreed?: boolean;
  privacyAgreed?: boolean;
  marketingAgreed?: boolean;
  // Onboarding fields
  nickname?: string;
  gender?: Gender;
  ageRange?: AgeRange;
  onboardingCompleted?: boolean;
}

// Terms Agreement Types
export interface TermsAgreementRequest {
  termsAgreed: boolean;
  privacyAgreed: boolean;
  marketingAgreed: boolean;
}

// Onboarding Types
export interface OnboardingRequest {
  nickname: string;
  gender: Gender;
  ageRange: AgeRange;
}

export interface NicknameCheckResponse {
  available: boolean;
  message: string;
}

// Meal Analysis Types
export interface AnalyzeMealRequest {
  image: File | Blob;
  name?: string;
  weight?: number;
  notes?: string;
}

export interface AnalyzeMealResponse {
  calories: number;
  macros: Macros;
  serving: Serving;
  items: FoodItem[];
  confidence: number;
  advice: string;
  traceId: string;
}

export interface Macros {
  carbs: number;
  protein: number;
  fat: number;
}

export interface Serving {
  unit: string;
  amount: number;
}

export interface FoodItem {
  name: string;
  amount: number;
  unit: string;
  calories: number;
}

// Monthly Statistics Types
export interface MonthlyMealStatisticsResponse {
  yearMonth: string;
  dailyCounts: Record<string, number>; // date -> count
  totalCount: number;
  traceId: string;
}