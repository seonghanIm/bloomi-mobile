import apiClient from './client';
import { ApiResponse, AuthResponse } from '../types/api';

export const authApi = {
  // 현재 사용자 정보 조회
  getCurrentUser: async (): Promise<AuthResponse> => {
    const response = await apiClient.get<ApiResponse<AuthResponse>>(
      '/auth/me'
    );
    return response.data.data;
  },

  // 로그아웃
  logout: async (): Promise<void> => {
    // 서버 측 로그아웃 로직
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // 로그아웃 실패해도 클라이언트는 로그아웃 처리
      console.log('Logout from server failed, but client will logout anyway');
    }
  },

  // 회원 탈퇴
  deleteAccount: async (): Promise<void> => {
    await apiClient.delete('/auth/me');
  },
};