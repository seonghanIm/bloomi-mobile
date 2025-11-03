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

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: string;
  membership: 'FREE' | 'TIER1';
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