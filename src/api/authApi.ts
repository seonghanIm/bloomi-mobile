import apiClient from './client';
import { ApiResponse, AuthResponse, User, TermsAgreementRequest, OnboardingRequest, NicknameCheckResponse } from '../types/api';

export const authApi = {
  // 현재 사용자 정보 조회
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>(
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

  // 약관 동의
  agreeToTerms: async (request: TermsAgreementRequest): Promise<User> => {
    const response = await apiClient.post<ApiResponse<User>>(
      '/auth/terms',
      request
    );
    return response.data.data;
  },

  // 닉네임 중복 확인
  checkNickname: async (nickname: string): Promise<NicknameCheckResponse> => {
    const response = await apiClient.get<ApiResponse<NicknameCheckResponse>>(
      '/auth/nickname/check',
      { params: { nickname } }
    );
    return response.data.data;
  },

  // 온보딩 완료
  completeOnboarding: async (request: OnboardingRequest): Promise<User> => {
    const response = await apiClient.post<ApiResponse<User>>(
      '/auth/onboarding',
      request
    );
    return response.data.data;
  },
};