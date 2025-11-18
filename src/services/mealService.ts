import apiClient from '../api/client';
import config from '../constants/config';
import { MealAnalysis, AnalyzeMealRequest } from '../types/meal';
import { formatLocalDate } from '../utils/dateUtils';

// client.ts의 apiClient를 사용하여 401 에러 처리를 통합
// (setAuthToken은 더 이상 필요 없음 - client.ts의 interceptor가 자동으로 토큰 추가)

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

  const response = await apiClient.post<{ code: string; message: string; data: MealAnalysis }>(
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
    const today = formatLocalDate(); // 로컬 시간대 기준 YYYY-MM-DD
    console.log('📡 API Request: GET /api/v1/meal/' + today);
    console.log('🌐 API URL:', config.apiUrl);

    const response = await apiClient.get<{ code: string; message: string; data: MealAnalysis[] }>(
      `/api/v1/meal/${today}`
    );

    console.log('✅ API Response received:', response.status);
    return response.data.data || [];
  } catch (error: any) {
    console.error('❌ Failed to fetch today meals:', error.message);
    if (error.code === 'ECONNABORTED') {
      console.error('⏱️ Request timeout');
    } else if (error.code === 'ERR_NETWORK') {
      console.error('🌐 Network error - check if server is running');
    }
    // 에러 발생 시 빈 배열 반환
    return [];
  }
};

/**
 * 특정 날짜 식단 조회
 */
export const getMealsByDate = async (date: string): Promise<MealAnalysis[]> => {
  try {
    const response = await apiClient.get<{ code: string; message: string; data: MealAnalysis[] }>(
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
    // dailyCounts를 그대로 반환 (없으면 빈 객체)
    return response.data.data?.dailyCounts || {};
  } catch (error: any) {
    console.error('❌ Failed to fetch monthly statistics:', error.message);
    // 에러 발생 시 빈 객체 반환
    return {};
  }
};

export default apiClient;