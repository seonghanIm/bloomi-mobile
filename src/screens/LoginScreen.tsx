import React, {useState, useEffect, useRef} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Image,
    Animated,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import {useAuth} from '../contexts/AuthContext';
import config from '../constants/config';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
    const [isLoading, setIsLoading] = useState(false);
    const {login, isAuthenticated} = useAuth();

    // 애니메이션 값
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const logoTranslateY = useRef(new Animated.Value(-20)).current;
    const descOpacity = useRef(new Animated.Value(0)).current;
    const descTranslateY = useRef(new Animated.Value(20)).current;
    const buttonOpacity = useRef(new Animated.Value(0)).current;
    const buttonTranslateY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        // 순차적 애니메이션 (stagger effect) - 총 0.7초
        Animated.sequence([
            // 1. 로고 먼저
            Animated.parallel([
                Animated.timing(logoOpacity, {
                    toValue: 1,
                    duration: 350,
                    useNativeDriver: true,
                }),
                Animated.spring(logoTranslateY, {
                    toValue: 0,
                    tension: 60,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]),
            // 2. Description과 버튼 동시에 (0.05초 후)
            Animated.delay(50),
            Animated.parallel([
                // Description
                Animated.timing(descOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(descTranslateY, {
                    toValue: 0,
                    tension: 70,
                    friction: 9,
                    useNativeDriver: true,
                }),
                // 버튼
                Animated.timing(buttonOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(buttonTranslateY, {
                    toValue: 0,
                    tension: 70,
                    friction: 9,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, []);

    React.useEffect(() => {
        // 앱이 실행 중일 때만 Deep link 리스너 등록
        // 초기 URL은 처리하지 않음 (로그아웃 후 다시 로그인되는 문제 방지)
        const subscription = Linking.addEventListener('url', handleDeepLink);

        return () => {
            console.log('🧹 Cleaning up deep link listener');
            subscription.remove();
        };
    }, [isAuthenticated]); // isAuthenticated가 변경될 때마다 리스너 재등록

    const handleDeepLink = ({url}: { url: string }) => {
        // 이미 인증된 상태면 Deep Link 무시
        if (isAuthenticated) {
            console.log('⚠️ Already authenticated, ignoring deep link');
            return;
        }

        console.log('🔗 Deep link received:', url);

        // bloomi://auth/callback?token=xxx&user=xxx
        const {queryParams} = Linking.parse(url);

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
            // prompt=select_account 추가: 로그아웃 후 재로그인 시 계정 선택 화면 표시
            const loginUrl = `${config.apiUrl}/oauth2/authorization/google?state=mobile&prompt=select_account`;

            console.log('🚀 Opening OAuth login:', loginUrl);

            // WebBrowser로 백엔드 로그인 페이지 열기
            // preferEphemeralSession: true로 매번 새로운 세션 사용 (쿠키 공유 방지)
            const result = await WebBrowser.openAuthSessionAsync(
                loginUrl,
                'bloomi://auth/callback',
                {
                    preferEphemeralSession: true, // iOS: 쿠키를 저장하지 않는 임시 세션 사용
                }
            );

            if (result.type === 'success' && result.url) {
                // Deep link가 반환된 경우 직접 처리
                handleDeepLink({url: result.url});
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
            <View style={styles.centerContent}>
                <Animated.View
                    style={[
                        styles.logoContainer,
                        {
                            opacity: logoOpacity,
                            transform: [{ translateY: logoTranslateY }]
                        }
                    ]}
                >
                    <Image
                        source={require('../../assets/bloomi_full_logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </Animated.View>
            </View>

            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: descOpacity,
                        transform: [{ translateY: descTranslateY }]
                    }
                ]}
            >
                <Text style={styles.description}>
                    사진 한장으로, 오늘의 영양을 알아보세요.
                </Text>
            </Animated.View>

            <Animated.View style={[styles.buttonContainer, {
                opacity: buttonOpacity,
                transform: [{ translateY: buttonTranslateY }]
            }]}>
                {isLoading ? (
                    <ActivityIndicator size="large" color="#4CAF50"/>
                ) : (
                    <>
                        <TouchableOpacity
                            style={[styles.button, styles.googleButton]}
                            onPress={handleGooglePress}
                        >
                            <View style={styles.googleButtonContent}>
                                <Image
                                    source={require('../../assets/google_logo.png')}
                                    style={styles.googleLogo}
                                    resizeMode="contain"
                                />
                                <Text style={styles.buttonText}>Google로 시작하기</Text>
                            </View>
                        </TouchableOpacity>

                        <Text style={styles.terms}>
                            계속 진행하면{' '}
                            <Text style={styles.link}>서비스 이용약관</Text>과{'\n'}
                            <Text style={styles.link}>개인정보 처리방침</Text>에 동의하는 것으로 간주됩니다
                        </Text>
                    </>
                )}
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 24,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
    },
    logo: {
        width: 600,
        height: 300,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginTop: 16,
    },
    content: {
        alignItems: 'center',
        marginBottom: 24,
        paddingHorizontal: 24,
    },
    description: {
        fontSize: 17,
        color: '#7C7C7C',
        textAlign: 'center',
        lineHeight: 26,
        fontWeight: '300',
        letterSpacing: 0.2,
        opacity: 0.85,
    },
    buttonContainer: {
        paddingBottom: 50,
    },
    button: {
        height: 56,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    googleButton: {
        backgroundColor: '#ffffff',
        borderWidth: 3,
        borderColor: '#E0E0E0',
        borderStyle: 'solid',
    },
    googleButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    googleLogo: {
        width: 24,
        height: 24,
        marginRight: 12,
    },
    buttonText: {
        color: '#000000',
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