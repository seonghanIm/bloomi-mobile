import apiClient from './client';
import { ApiResponse, AnalyzeMealResponse, MonthlyMealStatisticsResponse } from '../types/api';

export const mealApi = {
  // 식단 이미지 분석
  analyzeMeal: async (formData: FormData): Promise<AnalyzeMealResponse> => {
    const response = await apiClient.post<ApiResponse<AnalyzeMealResponse>>(
      '/api/v1/meal/analyze',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  // 날짜별 식단 조회
  findDailyMeals: async (date: string): Promise<AnalyzeMealResponse[]> => {
    const response = await apiClient.get<ApiResponse<AnalyzeMealResponse[]>>(
      `/api/v1/meal/${date}`
    );
    return response.data.data;
  },

  // 월별 통계 조회
  getMonthlyStatistics: async (yearMonth: string): Promise<MonthlyMealStatisticsResponse> => {
    const response = await apiClient.get<ApiResponse<MonthlyMealStatisticsResponse>>(
      `/api/v1/meal/monthly/${yearMonth}`
    );
    return response.data.data;
  },
};