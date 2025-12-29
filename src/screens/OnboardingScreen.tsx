import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../api/authApi';
import { Gender, AgeRange } from '../types/api';

// 뒤로가기 화살표 아이콘
const BackArrowIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 19L8 12L15 5"
      stroke="#000000"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

interface GenderOption {
  value: Gender;
  label: string;
}

interface AgeRangeOption {
  value: AgeRange;
  label: string;
}

const genderOptions: GenderOption[] = [
  { value: 'MALE', label: '남성' },
  { value: 'FEMALE', label: '여성' },
  { value: 'NONE', label: '선택 안함' },
];

const ageRangeOptions: AgeRangeOption[] = [
  { value: 'TEENS', label: '10대' },
  { value: 'TWENTIES', label: '20대' },
  { value: 'THIRTIES', label: '30대' },
  { value: 'FORTIES_FIFTIES', label: '40-50대' },
  { value: 'SIXTIES_PLUS', label: '60대 이상' },
];

export default function OnboardingScreen() {
  const { completeOnboarding, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);

  // Form state
  const [nickname, setNickname] = useState('');
  const [nicknameChecked, setNicknameChecked] = useState(false);
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [nicknameValid, setNicknameValid] = useState(false);
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const [selectedAgeRange, setSelectedAgeRange] = useState<AgeRange | null>(null);

  // 닉네임 유효성 검사 (형식)
  const validateNicknameFormat = (value: string): string | null => {
    if (value.length === 0) {
      return '닉네임을 입력해주세요.';
    }
    if (value.length < 2) {
      return '닉네임은 2자 이상이어야 합니다.';
    }
    if (value.length > 12) {
      return '닉네임은 12자 이하여야 합니다.';
    }
    // 한글(가-힣), 영문(a-zA-Z)만 허용
    const regex = /^[가-힣a-zA-Z]+$/;
    if (!regex.test(value)) {
      return '한글 또는 영문만 사용 가능합니다.';
    }
    return null;
  };

  // 닉네임 입력 변경 시
  const handleNicknameChange = (value: string) => {
    setNickname(value);
    setNicknameChecked(false);
    setNicknameValid(false);
    setNicknameError(null);
  };

  // 중복 확인 버튼 클릭
  const handleCheckNickname = async () => {
    const formatError = validateNicknameFormat(nickname);
    if (formatError) {
      setNicknameError(formatError);
      setNicknameValid(false);
      setNicknameChecked(true);
      return;
    }

    setIsCheckingNickname(true);
    try {
      const result = await authApi.checkNickname(nickname);
      setNicknameChecked(true);
      if (result.available) {
        setNicknameError(null);
        setNicknameValid(true);
      } else {
        setNicknameError('이미 사용 중인 닉네임입니다.');
        setNicknameValid(false);
      }
    } catch (error) {
      console.error('Nickname check failed:', error);
      setNicknameError('닉네임 확인 중 오류가 발생했습니다.');
      setNicknameValid(false);
      setNicknameChecked(true);
    } finally {
      setIsCheckingNickname(false);
    }
  };

  // 모든 필드가 유효한지 확인
  const isFormValid = nicknameValid && selectedGender !== null && selectedAgeRange !== null;

  // 완료 버튼
  const handleSubmit = async () => {
    if (!isFormValid || !selectedGender || !selectedAgeRange) {
      return;
    }

    try {
      setIsLoading(true);
      await completeOnboarding({
        nickname,
        gender: selectedGender,
        ageRange: selectedAgeRange,
      });
    } catch (error: any) {
      const message = error.response?.data?.message || '온보딩 완료 중 오류가 발생했습니다.';
      Alert.alert('오류', message);
    } finally {
      setIsLoading(false);
    }
  };

  // 뒤로가기 (로그아웃)
  const handleBack = () => {
    Alert.alert(
      '로그아웃',
      '온보딩을 완료하지 않으면 서비스를 이용할 수 없습니다.\n로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  // 닉네임 상태 메시지 결정
  const getNicknameMessage = () => {
    if (nicknameError) {
      return { text: nicknameError, isError: true };
    }
    if (nicknameValid) {
      return { text: '사용 가능한 닉네임입니다.', isError: false };
    }
    if (!nicknameChecked && nickname.length > 0) {
      return { text: '중복 여부를 확인해주세요.', isError: true };
    }
    return null;
  };

  const nicknameMessage = getNicknameMessage();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <BackArrowIcon />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* 제목 */}
          <Text style={styles.title}>
            잇피의 AI 코치가{'\n'}뭐라고 불러드릴까요?
          </Text>

          {/* 닉네임 입력 */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>닉네임</Text>
            <View style={styles.nicknameInputRow}>
              <TextInput
                style={styles.nicknameInput}
                placeholder="2~12자 한글 또는 영문"
                placeholderTextColor="rgba(60, 60, 67, 0.3)"
                value={nickname}
                onChangeText={handleNicknameChange}
                maxLength={12}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={[
                  styles.checkButton,
                  isCheckingNickname && styles.checkButtonDisabled,
                ]}
                onPress={handleCheckNickname}
                disabled={isCheckingNickname || nickname.length === 0}
              >
                {isCheckingNickname ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.checkButtonText}>중복 확인</Text>
                )}
              </TouchableOpacity>
            </View>
            {nicknameMessage && (
              <Text
                style={[
                  styles.nicknameMessage,
                  nicknameMessage.isError ? styles.errorText : styles.validText,
                ]}
              >
                {nicknameMessage.text}
              </Text>
            )}
          </View>

          {/* 성별 선택 */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>성별</Text>
            <View style={styles.pillRow}>
              {genderOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.pillButton,
                    selectedGender === option.value && styles.pillButtonSelected,
                  ]}
                  onPress={() => setSelectedGender(option.value)}
                >
                  <Text
                    style={[
                      styles.pillText,
                      selectedGender === option.value && styles.pillTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 연령대 선택 */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>연령대</Text>
            <View style={styles.pillRow}>
              {ageRangeOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.pillButton,
                    selectedAgeRange === option.value && styles.pillButtonSelected,
                  ]}
                  onPress={() => setSelectedAgeRange(option.value)}
                >
                  <Text
                    style={[
                      styles.pillText,
                      selectedAgeRange === option.value && styles.pillTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* 하단 버튼 */}
        <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 20 }]}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              !isFormValid && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text
                style={[
                  styles.submitButtonText,
                  !isFormValid && styles.submitButtonTextDisabled,
                ]}
              >
                시작하기
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 24,
    height: 24,
  },
  // 스크롤뷰
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 20,
  },
  // 제목
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    lineHeight: 28,
    marginBottom: 40,
  },
  // 섹션
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 12,
  },
  // 닉네임 입력
  nicknameInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nicknameInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000000',
  },
  checkButton: {
    height: 48,
    paddingHorizontal: 16,
    backgroundColor: '#88DC00',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkButtonDisabled: {
    backgroundColor: '#D1D1D6',
  },
  checkButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  nicknameMessage: {
    fontSize: 12,
    marginTop: 8,
  },
  errorText: {
    color: '#FF3B30',
  },
  validText: {
    color: '#88DC00',
  },
  // Pill 버튼 (성별, 연령대)
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pillButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  pillButtonSelected: {
    borderColor: '#88DC00',
    backgroundColor: '#88DC00',
  },
  pillText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  pillTextSelected: {
    color: '#FFFFFF',
  },
  // 하단 버튼
  bottomContainer: {
    paddingHorizontal: 16,
  },
  submitButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#88DC00',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#E5E5EA',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  submitButtonTextDisabled: {
    color: 'rgba(60, 60, 67, 0.3)',
  },
});
