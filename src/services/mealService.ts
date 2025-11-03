import axios from 'axios';
import config from '../constants/config';
import { MealAnalysis, AnalyzeMealRequest } from '../types/meal';

const api = axios.create({
  baseURL: config.apiUrl,
});

// Axios 인터셉터: 요청에 JWT 토큰 자동 추가
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

/**
 * 식단 이미지 분석
 */
export const analyzeMeal = async (request: AnalyzeMealRequest): Promise<MealAnalysis> => {
  const formData = new FormData();

  // 이미지 추가
  formData.append('image', {
    uri: request.image.uri,
    type: request.image.type,
    name: request.image.name,
  } as any);

  // 선택적 필드 추가
  if (request.name) {
    formData.append('name', request.name);
  }
  if (request.weight) {
    formData.append('weight', request.weight.toString());
  }
  if (request.notes) {
    formData.append('notes', request.notes);
  }

  const response = await api.post<{ code: string; message: string; data: MealAnalysis }>(
    '/api/v1/meal/analyze',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data.data;
};

/**
 * 오늘 식단 조회
 */
export const getTodayMeals = async (): Promise<MealAnalysis[]> => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const response = await api.get<{ code: string; message: string; data: MealAnalysis[] }>(
    `/api/v1/meal/${today}`
  );
  return response.data.data;
};

/**
 * 특정 날짜 식단 조회
 */
export const getMealsByDate = async (date: string): Promise<MealAnalysis[]> => {
  const response = await api.get<{ code: string; message: string; data: MealAnalysis[] }>(
    `/api/v1/meal/${date}`
  );
  return response.data.data;
};

/**
 * 월별 통계 조회
 */
export const getMonthlyStatistics = async (yearMonth: string): Promise<Record<string, number>> => {
  const response = await api.get<{
    code: string;
    message: string;
    data: {
      yearMonth: string;
      dailyCounts: Record<string, number>;
      totalCount: number;
      traceId: string;
    };
  }>(`/api/v1/meal/monthly/${yearMonth}`);

  // dailyCounts를 그대로 반환
  return response.data.data.dailyCounts;
};

export default api;