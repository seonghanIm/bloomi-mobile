import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage } from '../utils/storage';
import { authApi } from '../api/authApi';
import { User } from '../types/api';
import { setAuthToken } from '../services/mealService';

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

  // 앱 시작 시 저장된 사용자 정보 로드
  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await storage.getUser();
      const storedToken = await storage.getAccessToken();

      if (storedUser && storedToken) {
        setUser(storedUser);
        setAuthToken(storedToken); // axios에 토큰 설정
      }
    } catch (error) {
      console.error('Failed to load stored user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (accessToken: string, userData: User) => {
    try {
      await storage.saveAccessToken(accessToken);
      await storage.saveUser(userData);
      setAuthToken(accessToken); // axios에 토큰 설정
      setUser(userData);
    } catch (error) {
      console.error('Failed to login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Failed to logout from server:', error);
    } finally {
      await storage.clearAll();
      setAuthToken(null); // axios 토큰 제거
      setUser(null);
    }
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