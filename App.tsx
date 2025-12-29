import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import TermsAgreementScreen from './src/screens/TermsAgreementScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

function AppContent() {
  const { isAuthenticated, isLoading, needsTermsAgreement, needsOnboarding } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return (
      <>
        <SplashScreen onFinish={() => setShowSplash(false)} />
        <StatusBar style="dark" />
      </>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#88DC00" />
      </View>
    );
  }

  // 로그인 안 됨 -> 로그인 화면
  if (!isAuthenticated) {
    return (
      <>
        <LoginScreen />
        <StatusBar style="auto" />
      </>
    );
  }

  // 로그인 됨 + 약관 미동의 -> 약관 동의 화면
  if (needsTermsAgreement) {
    return (
      <>
        <TermsAgreementScreen />
        <StatusBar style="dark" />
      </>
    );
  }

  // 로그인 됨 + 약관 동의 완료 + 온보딩 미완료 -> 온보딩 화면
  if (needsOnboarding) {
    return (
      <>
        <OnboardingScreen />
        <StatusBar style="dark" />
      </>
    );
  }

  // 로그인 됨 + 약관 동의 완료 + 온보딩 완료 -> 홈 화면
  return (
    <>
      <HomeScreen />
      <StatusBar style="auto" />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
