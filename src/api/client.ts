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
      await storage.clearAll();
      console.log('Unauthorized - token cleared');
    }
    return Promise.reject(error);
  }
);

export default apiClient;