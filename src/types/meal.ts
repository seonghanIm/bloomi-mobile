// Meal 관련 타입 정의

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

export interface MealAnalysis {
  name: string; // 음식명 (사용자 입력 또는 AI 추정)
  calories: number;
  macros: Macros;
  serving: Serving;
  items: FoodItem[];
  confidence: number;
  advice: string;
  traceId: string;
}

export interface AnalyzeMealRequest {
  image: {
    uri: string;
    type: string;
    name: string;
  };
  name?: string;
  weight?: number;
  notes?: string;
}