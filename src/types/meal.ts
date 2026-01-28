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

// 식사 타입
export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

// 감정 상태
export type MealEmotion = 'HAPPY' | 'SATISFIED' | 'NORMAL' | 'SAD' | 'STRESSED' | 'TIRED';

export interface MealAnalysis {
  name: string; // 음식명 (사용자 입력 또는 AI 추정)
  calories: number;
  macros: Macros;
  serving: Serving;
  items: FoodItem[];
  confidence: number;
  advice: string;
  imageUrl?: string; // 이미지 URL
  mealType?: MealType;
  emotion?: MealEmotion;
  location?: string; // 자유 텍스트
  participants?: string[]; // 참여자 목록
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
  mealType?: MealType;
  emotion?: MealEmotion;
  location?: string; // 자유 텍스트
  participants?: string[]; // 참여자 목록
}

// 표시용 레이블
export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  BREAKFAST: '아침',
  LUNCH: '점심',
  DINNER: '저녁',
  SNACK: '간식',
};

export const MEAL_EMOTION_LABELS: Record<MealEmotion, { label: string; emoji: string }> = {
  HAPPY: { label: '행복해요', emoji: '😊' },
  SATISFIED: { label: '만족해요', emoji: '😋' },
  NORMAL: { label: '보통이에요', emoji: '😐' },
  SAD: { label: '슬퍼요', emoji: '😢' },
  STRESSED: { label: '스트레스', emoji: '😤' },
  TIRED: { label: '피곤해요', emoji: '😴' },
};