import apiClient from '../api/client';
import config from '../constants/config';
import {
  AnalyzeMealRequest,
  AnalyzeMealResponse,
  SaveMealRequest,
  MealRecord,
} from '../types/meal';
import { formatLocalDate } from '../utils/dateUtils';

/**
 * 1단계: 식단 이미지 분석 (저장 X)
 * - 이미지를 업로드하고 AI 분석 결과만 받음
 */
export const analyzeMeal = async (request: AnalyzeMealRequest): Promise<AnalyzeMealResponse> => {
  const formData = new FormData();

  // 이미지 추가
  formData.append('image', {
    uri: request.image.uri,
    type: request.image.type,
    name: request.image.name,
  } as any);

  // 선택적 힌트 추가
  if (request.name) {
    formData.append('name', request.name);
  }
  if (request.weight) {
    formData.append('weight', request.weight.toString());
  }

  const response = await apiClient.post<{ code: string; message: string; data: AnalyzeMealResponse }>(
    '/api/v1/meal/analyze',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  console.log('📡 Analyze Response:', JSON.stringify(response.data, null, 2));

  if (!response.data?.data) {
    throw new Error('서버 응답 형식이 올바르지 않습니다.');
  }

  return response.data.data;
};

/**
 * 2단계: 식단 저장 (분석 결과 + 사용자 메타데이터)
 */
export const saveMeal = async (request: SaveMealRequest): Promise<MealRecord> => {
  const response = await apiClient.post<{ code: string; message: string; data: MealRecord }>(
    '/api/v1/meal/save',
    request
  );

  console.log('📡 Save Response:', JSON.stringify(response.data, null, 2));

  if (!response.data?.data) {
    throw new Error('서버 응답 형식이 올바르지 않습니다.');
  }

  return response.data.data;
};

/**
 * 오늘 식단 조회
 */
export const getTodayMeals = async (): Promise<MealRecord[]> => {
  try {
    const today = formatLocalDate();
    console.log('📡 API Request: GET /api/v1/meal/' + today);

    const response = await apiClient.get<{ code: string; message: string; data: MealRecord[] }>(
      `/api/v1/meal/${today}`
    );

    console.log('✅ API Response received:', response.status);
    return response.data.data || [];
  } catch (error: any) {
    console.error('❌ Failed to fetch today meals:', error.message);
    return [];
  }
};

/**
 * 특정 날짜 식단 조회
 */
export const getMealsByDate = async (date: string): Promise<MealRecord[]> => {
  try {
    const response = await apiClient.get<{ code: string; message: string; data: MealRecord[] }>(
      `/api/v1/meal/${date}`
    );
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch meals by date:', error);
    return [];
  }
};

/**
 * 월별 통계 조회
 */
export const getMonthlyStatistics = async (yearMonth: string): Promise<Record<string, number>> => {
  try {
    console.log('📡 API Request: GET /api/v1/meal/monthly/' + yearMonth);

    const response = await apiClient.get<{
      code: string;
      message: string;
      data: {
        yearMonth: string;
        dailyCounts: Record<string, number>;
        totalCount: number;
        traceId: string;
      };
    }>(`/api/v1/meal/monthly/${yearMonth}`);

    console.log('✅ API Response received');
    return response.data.data?.dailyCounts || {};
  } catch (error: any) {
    console.error('❌ Failed to fetch monthly statistics:', error.message);
    return {};
  }
};

export default apiClient;