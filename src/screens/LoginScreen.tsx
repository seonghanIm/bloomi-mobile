import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useAuth } from '../contexts/AuthContext';
import config from '../constants/config';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  React.useEffect(() => {
    // Deep link 리스너 등록
    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, []);

  const handleDeepLink = ({ url }: { url: string }) => {
    // bloomi://auth/callback?token=xxx&user=xxx
    const { queryParams } = Linking.parse(url);

    if (queryParams?.token && queryParams?.user) {
      handleLoginSuccess(
        queryParams.token as string,
        JSON.parse(decodeURIComponent(queryParams.user as string))
      );
    } else if (queryParams?.error) {
      Alert.alert('로그인 실패', queryParams.error as string);
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = async (accessToken: string, user: any) => {
    try {
      console.log('✅ Login success! Token:', accessToken.substring(0, 20) + '...');
      console.log('✅ User info:', user);
      await login(accessToken, user);
      console.log('✅ Login completed, should navigate to HomeScreen');
    } catch (error) {
      console.error('❌ Failed to save login info:', error);
      Alert.alert('로그인 실패', '로그인 정보 저장 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGooglePress = async () => {
    try {
      setIsLoading(true);

      // 백엔드 OAuth 로그인 페이지 URL (state에 mobile 포함)
      const loginUrl = `${config.apiUrl}/oauth2/authorization/google?state=mobile`;

      console.log('🚀 Opening OAuth login:', loginUrl);

      // WebBrowser로 백엔드 로그인 페이지 열기
      const result = await WebBrowser.openAuthSessionAsync(
        loginUrl,
        'bloomi://auth/callback'
      );

      console.log('📱 WebBrowser result:', result);

      if (result.type === 'success' && result.url) {
        // Deep link가 반환된 경우 직접 처리
        handleDeepLink({ url: result.url });
      } else if (result.type === 'cancel') {
        console.log('❌ User cancelled login');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Google login error:', error);
      Alert.alert('로그인 실패', '로그인 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/bloomi-logo-full.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.subtitle}>AI 기반 식단 분석</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>
          음식 사진을 찍으면{'\n'}
          자동으로 칼로리와 영양 정보를{'\n'}
          분석해드려요
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#4CAF50" />
        ) : (
          <>
            <TouchableOpacity
              style={[styles.button, styles.googleButton]}
              onPress={handleGooglePress}
            >
              <Text style={styles.buttonText}>Google로 시작하기</Text>
            </TouchableOpacity>

            <Text style={styles.terms}>
              계속 진행하면{' '}
              <Text style={styles.link}>서비스 이용약관</Text>과{'\n'}
              <Text style={styles.link}>개인정보 처리방침</Text>에 동의하는 것으로 간주됩니다
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
  },
  logoContainer: {
    marginTop: 100,
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 80,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    lineHeight: 28,
  },
  buttonContainer: {
    marginBottom: 50,
  },
  button: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  googleButton: {
    backgroundColor: '#4285F4',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  terms: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
  link: {
    color: '#4CAF50',
    textDecorationLine: 'underline',
  },
});