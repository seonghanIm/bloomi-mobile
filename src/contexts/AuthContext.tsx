import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { storage } from '../utils/storage';
import { authApi } from '../api/authApi';
import { User } from '../types/api';
import { setUnauthorizedHandler } from '../api/client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (accessToken: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const appState = useRef(AppState.currentState);

  // 앱 시작 시 저장된 사용자 정보 로드
  useEffect(() => {
    void loadStoredUser();

    // 401 에러 발생 시 자동 로그아웃 핸들러 등록
    setUnauthorizedHandler(() => {
      console.log('🔒 Unauthorized handler triggered - logging out');
      void logout();
    });
  }, []);

  // 앱 포그라운드 복귀 시 토큰 유효성 검사
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [user]);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    // 백그라운드에서 포그라운드로 복귀 시
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      console.log('📱 App became active - validating token');

      // 로그인된 사용자가 있으면 토큰 유효성 검사
      if (user) {
        await validateToken();
      }
    }
    appState.current = nextAppState;
  };

  const validateToken = async () => {
    try {
      console.log('🔍 Validating token...');
      // 현재 사용자 정보를 가져와서 토큰이 유효한지 확인
      await authApi.getCurrentUser();
      console.log('✅ Token is valid');
    } catch (error: any) {
      console.log('❌ Token validation failed:', error.response?.status);
      // 401 에러는 interceptor에서 이미 로그아웃 처리됨
      // 다른 에러는 무시 (네트워크 오류 등)
      if (error.response?.status !== 401) {
        console.log('ℹ️ Token validation failed due to network or other error - keeping user logged in');
      }
    }
  };

  const loadStoredUser = async () => {
    try {
      console.log('🔍 Checking stored user...');
      const storedUser = await storage.getUser();
      const storedToken = await storage.getAccessToken();

      console.log('📦 Stored user:', storedUser ? storedUser.name : 'None');
      console.log('🔑 Stored token:', storedToken ? storedToken.substring(0, 20) + '...' : 'None');

      if (storedUser && storedToken) {
        setUser(storedUser);
        // client.ts의 interceptor가 자동으로 토큰을 추가하므로 별도 설정 불필요
        console.log('✅ Auto-login successful');
      } else {
        console.log('ℹ️ No stored credentials found');
      }
    } catch (error) {
      console.error('❌ Failed to load stored user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (accessToken: string, userData: User) => {
    try {
      await storage.saveAccessToken(accessToken);
      await storage.saveUser(userData);
      // client.ts의 interceptor가 자동으로 토큰을 추가하므로 별도 설정 불필요
      setUser(userData);
    } catch (error) {
      console.error('Failed to login:', error);
      throw error;
    }
  };

  const logout = async () => {
    console.log('🚪 Logout started...');

    // 먼저 로컬 저장소와 상태를 지움
    await storage.clearAll();
    console.log('✅ Storage cleared');

    // client.ts의 interceptor가 다음 요청 시 토큰이 없음을 감지하므로 별도 제거 불필요
    setUser(null);
    console.log('✅ User state cleared');

    // WebBrowser 쿠키 및 세션 초기화
    try {
      const WebBrowser = require('expo-web-browser');
      await WebBrowser.maybeCompleteAuthSession();
      console.log('✅ WebBrowser session cleared');
    } catch (error) {
      console.error('❌ Failed to clear WebBrowser session:', error);
    }

    // 그 다음 백엔드에 로그아웃 요청 (실패해도 로컬은 이미 지워짐)
    try {
      await authApi.logout();
      console.log('✅ Server logout successful');
    } catch (error) {
      console.error('❌ Failed to logout from server:', error);
      // 백엔드 호출 실패해도 이미 로컬은 정리됨
    }

    console.log('🚪 Logout completed');
  };

  const deleteAccount = async () => {
    try {
      await authApi.deleteAccount();
      await storage.clearAll();
      setUser(null);
    } catch (error) {
      console.error('Failed to delete account:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};