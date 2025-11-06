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

  console.log('📡 Full API Response:', JSON.stringify(response.data, null, 2));

  // 응답 데이터 검증
  if (!response.data) {
    throw new Error('서버 응답이 비어있습니다.');
  }

  // data 필드가 없을 경우 처리
  if (!response.data.data) {
    console.error('❌ Invalid response structure:', response.data);
    throw new Error('서버 응답 형식이 올바르지 않습니다.');
  }

  return response.data.data;
};

/**
 * 오늘 식단 조회
 */
export const getTodayMeals = async (): Promise<MealAnalysis[]> => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const response = await api.get<{ code: string; message: string; data: MealAnalysis[] }>(
      `/api/v1/meal/${today}`
    );
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch today meals:', error);
    // 에러 발생 시 빈 배열 반환
    return [];
  }
};

/**
 * 특정 날짜 식단 조회
 */
export const getMealsByDate = async (date: string): Promise<MealAnalysis[]> => {
  try {
    const response = await api.get<{ code: string; message: string; data: MealAnalysis[] }>(
      `/api/v1/meal/${date}`
    );
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch meals by date:', error);
    // 에러 발생 시 빈 배열 반환
    return [];
  }
};

/**
 * 월별 통계 조회
 */
export const getMonthlyStatistics = async (yearMonth: string): Promise<Record<string, number>> => {
  try {
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

    // dailyCounts를 그대로 반환 (없으면 빈 객체)
    return response.data.data?.dailyCounts || {};
  } catch (error) {
    console.error('Failed to fetch monthly statistics:', error);
    // 에러 발생 시 빈 객체 반환
    return {};
  }
};

export default api;