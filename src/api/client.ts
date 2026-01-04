import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
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

// 토큰 갱신 중인지 여부
let isRefreshing = false;

// 토큰 갱신 대기 중인 요청들
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

export const setUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler;
};

// 대기 중인 요청들 처리
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
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

// Response interceptor - 토큰 갱신 및 에러 처리
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 401 에러이고, 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      // logout 요청이 401이면 그냥 무시 (이미 로그아웃 중)
      if (originalRequest.url?.includes('/auth/logout')) {
        console.log('🔒 Logout request got 401 - ignoring');
        return Promise.reject(error);
      }

      // refresh 요청이 401이면 로그아웃
      if (originalRequest.url?.includes('/auth/refresh')) {
        console.log('🔒 Refresh token expired - logging out');
        if (onUnauthorized) {
          onUnauthorized();
        } else {
          await storage.clearAll();
        }
        return Promise.reject(error);
      }

      // 이미 토큰 갱신 중이면 대기
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await storage.getRefreshToken();

        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        console.log('🔄 Attempting to refresh token...');

        // 토큰 갱신 요청
        const response = await axios.post(`${config.apiUrl}/auth/refresh`, {
          refreshToken: refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        // 새 토큰 저장
        await storage.saveAccessToken(accessToken);
        if (newRefreshToken) {
          await storage.saveRefreshToken(newRefreshToken);
        }

        console.log('✅ Token refreshed successfully');

        // 대기 중인 요청들 처리
        processQueue(null, accessToken);

        // 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);

      } catch (refreshError) {
        console.log('❌ Token refresh failed - logging out');
        processQueue(refreshError, null);

        // 토큰 갱신 실패 시 로그아웃
        if (onUnauthorized) {
          onUnauthorized();
        } else {
          await storage.clearAll();
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;