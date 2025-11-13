import axios from 'axios';
import config from '../constants/config';
import { storage } from '../utils/storage';

const apiClient = axios.create({
  baseURL: config.apiUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 401 에러 발생 시 호출할 콜백 (AuthContext에서 등록)
let onUnauthorized: (() => void) | null = null;

export const setUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler;
};

// Request interceptor - JWT 토큰 추가
apiClient.interceptors.request.use(
  async (config) => {
    const token = await storage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - 에러 처리
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 시 자동 로그아웃
      console.log('🔒 Token expired (401) - triggering logout');
      console.log('⚠️ 토큰이 만료되었습니다. 다시 로그인해주세요.');

      // AuthContext의 logout 호출
      if (onUnauthorized) {
        onUnauthorized();
      } else {
        // Fallback: Context가 아직 등록되지 않은 경우
        await storage.clearAll();
        console.log('⚠️ Unauthorized handler not set - cleared storage only');
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;