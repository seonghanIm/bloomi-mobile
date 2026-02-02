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

// 식사 타입 (Figma 기준 확장)
export type MealType =
  | 'BREAKFAST'   // 아침
  | 'BRUNCH'      // 아침 겸 점심
  | 'LUNCH'       // 점심
  | 'LINNER'      // 점심 겸 저녁
  | 'DINNER'      // 저녁
  | 'LATE_NIGHT'  // 야식
  | 'SNACK'       // 간식
  | 'COFFEE'      // 커피
  | 'ALCOHOL';    // 술

// 행복도 (5단계)
export type MealEmotion =
  | 'TERRIBLE'    // 1: 죽겠어요
  | 'HARD'        // 2: 조금 힘들어요
  | 'OKAY'        // 3: 할만해요
  | 'ENJOYABLE'   // 4: 즐거워요
  | 'VERY_HAPPY'; // 5: 아주 행복해요

/**
 * 1단계: 분석 요청 (이미지만)
 */
export interface AnalyzeMealRequest {
  image: {
    uri: string;
    type: string;
    name: string;
  };
  name?: string;
  weight?: number;
}

/**
 * 1단계: 분석 응답 (AI 분석 결과만)
 */
export interface AnalyzeMealResponse {
  imageUrl: string;
  name: string;
  calories: number;
  macros: Macros;
  serving: Serving;
  items: FoodItem[];
  confidence: number;
  advice: string;
  traceId: string;
}

/**
 * 2단계: 저장 요청 (분석 결과 + 사용자 메타데이터)
 */
export interface SaveMealRequest {
  // AI 분석 결과
  imageUrl: string;
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  servingUnit: string;
  servingAmount: number;
  confidence?: number;
  advice?: string;
  // 사용자 메타데이터
  analyzedAt: string; // YYYY-MM-DD
  mealTime?: string;  // HH:mm
  mealType?: MealType;
  emotion?: MealEmotion;
  notes?: string;
  participants?: string[];
  location?: string;
}

/**
 * 저장된 식단 (조회 응답)
 */
export interface MealRecord {
  id: string;
  imageUrl: string;
  name: string;
  calories: number;
  macros: Macros;
  serving: Serving;
  confidence: number;
  advice: string;
  analyzedAt: string;
  mealType?: MealType;
  emotion?: MealEmotion;
  notes?: string;
  participants?: string[];
  location?: string;
  traceId: string;
}

// 표시용 레이블
export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  BREAKFAST: '아침',
  BRUNCH: '아침 겸 점심',
  LUNCH: '점심',
  LINNER: '점심 겸 저녁',
  DINNER: '저녁',
  LATE_NIGHT: '야식',
  SNACK: '간식',
  COFFEE: '커피',
  ALCOHOL: '술',
};

export const MEAL_EMOTION_LABELS: Record<MealEmotion, { level: number; label: string }> = {
  TERRIBLE: { level: 1, label: '죽겠어요' },
  HARD: { level: 2, label: '조금 힘들어요' },
  OKAY: { level: 3, label: '할만해요' },
  ENJOYABLE: { level: 4, label: '즐거워요' },
  VERY_HAPPY: { level: 5, label: '아주 행복해요' },
};

// 행복도 레벨로 Emotion 찾기
export const getEmotionByLevel = (level: number): MealEmotion => {
  const emotions: MealEmotion[] = ['TERRIBLE', 'HARD', 'OKAY', 'ENJOYABLE', 'VERY_HAPPY'];
  return emotions[level - 1] || 'OKAY';
};
