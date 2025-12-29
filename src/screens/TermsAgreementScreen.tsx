import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import CheckboxIcon from '../components/icons/CheckboxIcon';
import Svg, { Path } from 'react-native-svg';
import { termsContent, privacyContent } from '../constants/termsContent';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// 화살표 아이콘 컴포넌트
const ArrowRightIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M7.5 15L12.5 10L7.5 5"
      stroke="rgba(60, 60, 67, 0.3)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

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

// X 닫기 아이콘
const CloseIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6L18 18"
      stroke="#000000"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

interface TermItem {
  id: string;
  label: string;
  required: boolean;
  hasDetail?: boolean;
  detailType?: 'terms' | 'privacy';
}

const termItems: TermItem[] = [
  { id: 'age', label: '만 14세 이상입니다.', required: true },
  {
    id: 'terms',
    label: '서비스 이용 약관',
    required: true,
    hasDetail: true,
    detailType: 'terms',
  },
  {
    id: 'privacy',
    label: '개인정보 수집 및 이용 동의',
    required: true,
    hasDetail: true,
    detailType: 'privacy',
  },
  { id: 'marketing', label: '마케팅 정보 수신 동의', required: false },
];

// 바텀시트 모달 컴포넌트
interface BottomSheetModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  type: 'terms' | 'privacy';
}

const BottomSheetModal = ({ visible, onClose, title, type }: BottomSheetModalProps) => {
  const insets = useSafeAreaInsets();
  const content = type === 'terms' ? termsContent : privacyContent;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.modalBackdrop} />
        </TouchableWithoutFeedback>
        <View style={[styles.bottomSheet, { paddingBottom: insets.bottom }]}>
          {/* 핸들 바 */}
          <View style={styles.handleBar} />

          {/* 헤더 */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <CloseIcon />
            </TouchableOpacity>
          </View>

          {/* 컨텐츠 */}
          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={true}
          >
            <Text style={styles.mainTitle}>{content.title}</Text>

            {type === 'privacy' && 'intro' in content && (
              <Text style={styles.introText}>{content.intro}</Text>
            )}

            {content.sections.map((section, index) => (
              <View key={index} style={styles.section}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionContent}>{section.content}</Text>
              </View>
            ))}

            {type === 'privacy' && 'footer' in content && (
              <Text style={styles.footerText}>{content.footer}</Text>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default function TermsAgreementScreen() {
  const { agreeToTerms, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'terms' | 'privacy'>('terms');

  // 각 약관 동의 상태
  const [agreements, setAgreements] = useState<Record<string, boolean>>({
    age: false,
    terms: false,
    privacy: false,
    marketing: false,
  });

  // 전체 동의 여부
  const isAllAgreed = Object.values(agreements).every((v) => v);

  // 필수 약관 동의 여부
  const isRequiredAgreed = termItems
    .filter((item) => item.required)
    .every((item) => agreements[item.id]);

  // 전체 동의 토글
  const handleToggleAll = () => {
    const newValue = !isAllAgreed;
    setAgreements({
      age: newValue,
      terms: newValue,
      privacy: newValue,
      marketing: newValue,
    });
  };

  // 개별 항목 토글
  const handleToggleItem = (id: string) => {
    setAgreements((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // 상세 보기 (바텀시트 열기)
  const handleViewDetail = (detailType?: 'terms' | 'privacy') => {
    if (detailType) {
      setModalType(detailType);
      setModalVisible(true);
    }
  };

  // 바텀시트 닫기
  const handleCloseModal = () => {
    setModalVisible(false);
  };

  // 완료 버튼
  const handleSubmit = async () => {
    if (!isRequiredAgreed) {
      Alert.alert('알림', '필수 약관에 모두 동의해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      await agreeToTerms({
        termsAgreed: agreements.terms && agreements.age,
        privacyAgreed: agreements.privacy,
        marketingAgreed: agreements.marketing,
      });
    } catch (error) {
      Alert.alert('오류', '약관 동의 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 뒤로가기 (로그아웃)
  const handleBack = () => {
    Alert.alert(
      '로그아웃',
      '약관에 동의하지 않으면 서비스를 이용할 수 없습니다.\n로그아웃 하시겠습니까?',
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

  const getModalTitle = () => {
    return modalType === 'terms' ? '서비스 이용약관' : '개인정보 수집 및 이용 동의';
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <BackArrowIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>약관 동의</Text>
        <View style={styles.headerRight} />
      </View>
      {/* 헤더 아래 구분선 */}
      <View style={styles.headerDivider} />

      {/* 본문 */}
      <View style={styles.content}>
        {/* 제목 */}
        <Text style={styles.title}>서비스 이용 약관을 확인해주세요.</Text>

        {/* 약관 목록 */}
        <View style={styles.termsContainer}>
          {/* 전체 동의 */}
          <TouchableOpacity style={styles.termRow} onPress={handleToggleAll}>
            <CheckboxIcon checked={isAllAgreed} />
            <Text style={styles.termLabelAll}>전체 동의</Text>
          </TouchableOpacity>

          {/* 구분선 */}
          <View style={styles.divider} />

          {/* 개별 항목 */}
          {termItems.map((item) => (
            <View key={item.id} style={styles.termRow}>
              <TouchableOpacity
                style={styles.termCheckArea}
                onPress={() => handleToggleItem(item.id)}
              >
                <CheckboxIcon checked={agreements[item.id]} />
                <Text style={styles.termLabel}>
                  {item.label}
                  {item.required ? ' (필수)' : ''}
                </Text>
              </TouchableOpacity>
              {item.hasDetail && (
                <TouchableOpacity
                  style={styles.detailButton}
                  onPress={() => handleViewDetail(item.detailType)}
                >
                  <ArrowRightIcon />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* 하단 버튼 */}
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            !isRequiredAgreed && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!isRequiredAgreed || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text
              style={[
                styles.submitButtonText,
                !isRequiredAgreed && styles.submitButtonTextDisabled,
              ]}
            >
              다음으로
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* 바텀시트 모달 */}
      <BottomSheetModal
        visible={modalVisible}
        onClose={handleCloseModal}
        title={getModalTitle()}
        type={modalType}
      />
    </View>
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
    justifyContent: 'space-between',
    height: 68,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  headerRight: {
    width: 24,
  },
  headerDivider: {
    height: 1,
    backgroundColor: '#D1D1D6',
  },
  // 본문
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    lineHeight: 28,
    marginBottom: 68,
  },
  // 약관 목록
  termsContainer: {
    gap: 16,
  },
  termRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 24,
  },
  termCheckArea: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  termLabelAll: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 8,
  },
  termLabel: {
    fontSize: 15,
    fontWeight: '400',
    color: '#000000',
    marginLeft: 8,
  },
  detailButton: {
    padding: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#D1D1D6',
    marginVertical: 8,
  },
  // 하단 버튼
  bottomContainer: {
    paddingHorizontal: 16,
  },
  submitButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#88DC00',
    borderRadius: 4,
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
  // 모달 스타일
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.9,
    minHeight: SCREEN_HEIGHT * 0.7,
  },
  handleBar: {
    width: 36,
    height: 4,
    backgroundColor: '#D1D1D6',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2A2A2A',
    marginTop: 20,
    marginBottom: 16,
  },
  introText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#2A2A2A',
    lineHeight: 20,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2A2A2A',
    lineHeight: 20,
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 14,
    fontWeight: '400',
    color: '#2A2A2A',
    lineHeight: 20,
    letterSpacing: -0.3,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2A2A2A',
    lineHeight: 20,
    marginTop: 16,
    letterSpacing: -0.3,
  },
});