import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import config from '../constants/config';

WebBrowser.maybeCompleteAuthSession();

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TutorialSlide {
  id: string;
  title: string;
  subtitle: string;
  image?: any;
}

const tutorialSlides: TutorialSlide[] = [
  {
    id: '1',
    title: '찰칵, 3초만에 끝내는\n식단 기록',
    subtitle: '사진 한 장이면 기록 완료예요.',
  },
  {
    id: '2',
    title: '가볍게, 하지만 똑똑하게\nAI 코치의 피드백을\n받아보세요!',
    subtitle: '부담 없는 코멘트로 오늘 식단을 바로 이해해요.',
  },
  {
    id: '3',
    title: '이번달은 어땠지?\n캘린더로 한눈에',
    subtitle: '식단은 물론 일상 기록까지 캘린더로 정리돼요.',
  },
  {
    id: '4',
    title: '리포트로 유용하고\n재밌는 인사이트 파악',
    subtitle: '리포트로 흥미로운 인사이트를 알려드려요.',
  },
];

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { login, isAuthenticated } = useAuth();
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => {
      subscription.remove();
    };
  }, [isAuthenticated]);

  const handleDeepLink = ({ url }: { url: string }) => {
    if (isAuthenticated) {
      return;
    }

    const { queryParams } = Linking.parse(url);

    if (queryParams?.token && queryParams?.user) {
      void handleLoginSuccess(
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
      await login(accessToken, user);
    } catch (error) {
      Alert.alert('로그인 실패', '로그인 정보 저장 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGooglePress = async () => {
    try {
      setIsLoading(true);
      const loginUrl = `${config.apiUrl}/oauth2/authorization/google?state=mobile&prompt=select_account`;

      const result = await WebBrowser.openAuthSessionAsync(
        loginUrl,
        'bloomi://auth/callback',
        {
          preferEphemeralSession: true,
        }
      );

      if (result.type === 'success' && result.url) {
        handleDeepLink({ url: result.url });
      } else if (result.type === 'cancel') {
        setIsLoading(false);
      }
    } catch (error) {
      Alert.alert('로그인 실패', '로그인 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideIndex = Math.round(
      event.nativeEvent.contentOffset.x / SCREEN_WIDTH
    );
    if (slideIndex !== currentIndex) {
      setCurrentIndex(slideIndex);
    }
  };

  const renderSlide = ({ item }: { item: TutorialSlide }) => (
    <View style={styles.slide}>
      {/* 텍스트 영역: 중앙 정렬 */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
      {/* 이미지 영역: 절대 위치 top 337px */}
      <View style={styles.imageContainer}>
        {item.image ? (
          <Image source={item.image} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={styles.imagePlaceholder} />
        )}
      </View>
    </View>
  );

  const renderIndicator = () => (
    <View style={[styles.indicatorWrapper, { top: 623 + insets.top }]}>
      {tutorialSlides.map((_, index) => (
        <View
          key={index}
          style={[
            styles.indicator,
            index === currentIndex ? styles.indicatorActive : styles.indicatorInactive,
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={tutorialSlides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: insets.top }}
      />

      {/* 인디케이터: 고정 위치 */}
      {renderIndicator()}

      {/* 버튼: top 709px (bottom 135px), 358x52 */}
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 20 }]}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#88DC00" />
        ) : (
          <>
            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGooglePress}
            >
              <Image
                source={require('../../assets/google_logo.png')}
                style={styles.googleLogo}
                resizeMode="contain"
              />
              <Text style={styles.buttonText}>Google 계정으로 로그인</Text>
            </TouchableOpacity>

            {/* 링크: top 775px (bottom 49px) */}
            <View style={styles.linksContainer}>
              <TouchableOpacity>
                <Text style={styles.linkText}>아이디 찾기</Text>
              </TouchableOpacity>
              <View style={styles.linkDivider} />
              <TouchableOpacity>
                <Text style={styles.linkText}>문의</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  slide: {
    width: SCREEN_WIDTH,
    height: '100%',
    paddingHorizontal: 16,
  },
  // 텍스트 영역: top 104px (152 - 48 status bar), gap 24px, 중앙 정렬
  textContainer: {
    position: 'absolute',
    top: 104,
    left: 16,
    right: 16,
    gap: 24,
    alignItems: 'center',
  },
  // 제목: 32px, line-height 40px, Medium weight, 중앙 정렬
  title: {
    fontSize: 32,
    fontWeight: '500',
    color: '#000000',
    lineHeight: 40,
    letterSpacing: 0,
    textAlign: 'center',
  },
  // 부제목: 16px, line-height 24px, Regular, rgba(0,0,0,0.7), 중앙 정렬
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.7)',
    lineHeight: 24,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  // 이미지 영역: 절대 위치 top 289px (337 - 48 status bar), 358x320
  imageContainer: {
    position: 'absolute',
    top: 289,
    left: 16,
    width: 358,
    height: 320,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  // 점선 테두리: 4px dashed rgba(0,0,0,0.3)
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    borderWidth: 4,
    borderColor: 'rgba(0, 0, 0, 0.3)',
    borderStyle: 'dashed',
    backgroundColor: '#FFFFFF',
  },
  // 인디케이터 래퍼: 절대 위치 top 623px (671 - 48 status bar)
  indicatorWrapper: {
    position: 'absolute',
    top: 623,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    padding: 1,
  },
  indicator: {
    height: 6,
    borderRadius: 4,
  },
  // 활성: 18x6, #a9e600
  indicatorActive: {
    width: 18,
    backgroundColor: '#A9E600',
  },
  // 비활성: 6x6, #d1d1d6
  indicatorInactive: {
    width: 6,
    backgroundColor: '#D1D1D6',
  },
  // 하단 영역
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  // 버튼: 358x52, border 1px solid black, borderRadius 4px
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 358,
    height: 52,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#000000',
    alignSelf: 'center',
    gap: 12,
    marginBottom: 14,
  },
  // 구글 로고: 20x20
  googleLogo: {
    width: 20,
    height: 20,
  },
  // 버튼 텍스트: 16px, SemiBold
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    lineHeight: 20,
  },
  // 링크 영역: gap 12px
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 29,
  },
  // 링크 텍스트: 12px, Medium, rgba(60,60,67,0.6)
  linkText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(60, 60, 67, 0.6)',
    lineHeight: 20,
  },
  // 구분선: 12px height
  linkDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(60, 60, 67, 0.6)',
  },
});
