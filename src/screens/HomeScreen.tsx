import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  TextInput,
  RefreshControl,
  AppState,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import { getTodayMeals, analyzeMeal, getMonthlyStatistics } from '../services/mealService';
import { MealAnalysis } from '../types/meal';
import { getCurrentYearMonth } from '../utils/dateUtils';
import InlineCalendar from '../components/InlineCalendar';
import MealCardNew from '../components/MealCardNew';
import SideDrawer from '../components/SideDrawer';
import EatpyLogo from '../components/EatpyLogo';
import BottomTabBar from '../components/BottomTabBar';

// 영양소 목표 (하드코딩 - 추후 API에서 가져오기)
const NUTRITION_GOALS = {
  calories: 2000,
  carbs: 300,
  protein: 60,
  fat: 65,
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [meals, setMeals] = useState<MealAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showInputModal, setShowInputModal] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [foodName, setFoodName] = useState('');
  const [foodWeight, setFoodWeight] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [monthlyStats, setMonthlyStats] = useState<Record<string, { dots: number }>>({});
  const [showMenu, setShowMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const appState = useRef(AppState.currentState);

  // 초기 로드
  useEffect(() => {
    const loadInitialData = async () => {
      console.log('HomeScreen: Initial data load started');
      try {
        await Promise.all([loadTodayMeals(), loadMonthlyStats()]);
        console.log('HomeScreen: Initial data load completed');
      } catch (error) {
        console.error('HomeScreen: Initial data load failed:', error);
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // 앱이 다시 활성화될 때 새로고침
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        loadTodayMeals();
        loadMonthlyStats();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const loadMonthlyStats = async () => {
    try {
      const yearMonth = getCurrentYearMonth();
      const stats = await getMonthlyStatistics(yearMonth);
      // 형식 변환: { "2025-01-15": 3 } -> { "2025-01-15": { dots: 3 } }
      const formattedStats: Record<string, { dots: number }> = {};
      Object.entries(stats).forEach(([date, count]) => {
        formattedStats[date] = { dots: count as number };
      });
      setMonthlyStats(formattedStats);
    } catch (error) {
      console.error('Failed to load monthly stats:', error);
    }
  };

  const loadTodayMeals = async () => {
    try {
      const todayMeals = await getTodayMeals();
      setMeals(todayMeals);
    } catch (error) {
      console.error('Failed to load today meals:', error);
      setMeals([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadTodayMeals(), loadMonthlyStats()]);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleAddMeal = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '카메라 권한이 필요합니다.');
      return;
    }

    Alert.alert(
      '식단 추가',
      '사진을 선택해주세요',
      [
        { text: '카메라', onPress: () => takePicture() },
        { text: '갤러리', onPress: () => pickImage() },
        { text: '취소', style: 'cancel' },
      ]
    );
  };

  const takePicture = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImageUri(result.assets[0].uri);
        setShowInputModal(true);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('오류', '사진 촬영 중 오류가 발생했습니다.');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImageUri(result.assets[0].uri);
        setShowInputModal(true);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('오류', '이미지 선택 중 오류가 발생했습니다.');
    }
  };

  const handleAnalyzeSubmit = async () => {
    if (!selectedImageUri) return;

    setShowInputModal(false);
    await analyzeImage(selectedImageUri, foodName, foodWeight);

    setSelectedImageUri(null);
    setFoodName('');
    setFoodWeight('');
  };

  const handleModalCancel = () => {
    setShowInputModal(false);
    setSelectedImageUri(null);
    setFoodName('');
    setFoodWeight('');
  };

  const analyzeImage = async (uri: string, name?: string, weight?: string) => {
    try {
      setIsAnalyzing(true);

      const filename = uri.split('/').pop() || 'meal.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      const result = await analyzeMeal({
        image: { uri, type, name: filename },
        name: name || undefined,
        weight: weight ? parseFloat(weight) : undefined,
      });

      Alert.alert(
        '분석 완료!',
        `칼로리: ${Math.round(result.calories)}kcal\n신뢰도: ${Math.round(result.confidence * 100)}%\n\n${result.advice}`,
        [{ text: '확인', onPress: () => loadTodayMeals() }]
      );
    } catch (error: any) {
      console.error('Analysis error:', error);
      Alert.alert(
        '분석 실패',
        error.response?.data?.message || '식단 분석 중 오류가 발생했습니다.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 오늘 총 영양소 계산
  const totalCalories = meals?.reduce((sum, meal) => sum + meal.calories, 0) || 0;
  const totalCarbs = meals?.reduce((sum, meal) => sum + meal.macros.carbs, 0) || 0;
  const totalProtein = meals?.reduce((sum, meal) => sum + meal.macros.protein, 0) || 0;
  const totalFat = meals?.reduce((sum, meal) => sum + meal.macros.fat, 0) || 0;

  // 목표 대비 퍼센트
  const carbsPercent = Math.round((totalCarbs / NUTRITION_GOALS.carbs) * 100);
  const proteinPercent = Math.round((totalProtein / NUTRITION_GOALS.protein) * 100);
  const fatPercent = Math.round((totalFat / NUTRITION_GOALS.fat) * 100);

  // 감정 메시지 결정
  const getEmotionMessage = () => {
    const caloriePercent = (totalCalories / NUTRITION_GOALS.calories) * 100;
    if (caloriePercent < 30) return '식사를 시작해볼까요?';
    if (caloriePercent < 60) return '잘 하고 있어요!';
    if (caloriePercent < 90) return '아주 행복해요!';
    if (caloriePercent < 110) return '완벽해요!';
    return '조금 과식했어요';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#88DC00" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <EatpyLogo width={60} height={19} />
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.headerButton}>
            <Text style={styles.headerButtonText}>알림</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={() => setShowMenu(true)}>
            <Text style={styles.headerButtonText}>메뉴</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#88DC00']}
            tintColor="#88DC00"
          />
        }
      >
        {/* 인사말 */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingText}>
            {user?.name || '사용자'}님,{'\n'}
            아주 행복한 식단 생활중이에요. 😋
          </Text>
        </View>

        {/* 캘린더 */}
        <InlineCalendar
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          markedDates={monthlyStats}
        />

        {/* 구분선 */}
        <View style={styles.divider} />

        {/* 오늘 식단 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>오늘 식단</Text>

          {/* 영양 요약 카드 */}
          <View style={styles.nutritionCard}>
            <View style={styles.nutritionHeader}>
              <View style={styles.calorieRow}>
                <Text style={styles.calorieValue}>
                  {Math.round(totalCalories).toLocaleString()}
                </Text>
                <Text style={styles.calorieUnit}>kcal</Text>
              </View>
              <Text style={styles.emotionText}>{getEmotionMessage()} 😋</Text>
            </View>

            <View style={styles.macrosBreakdown}>
              <View style={styles.macroRow}>
                <Text style={styles.macroLabel}>탄수화물</Text>
                <Text style={styles.macroValue}>
                  {Math.round(totalCarbs)}/ {NUTRITION_GOALS.carbs}g
                </Text>
                <Text style={styles.macroPercent}>{carbsPercent}%</Text>
              </View>
              <View style={styles.macroRow}>
                <Text style={styles.macroLabel}>단백질</Text>
                <Text style={styles.macroValue}>
                  {Math.round(totalProtein)}/ {NUTRITION_GOALS.protein}g
                </Text>
                <Text style={styles.macroPercent}>{proteinPercent}%</Text>
              </View>
              <View style={styles.macroRow}>
                <Text style={styles.macroLabel}>지방</Text>
                <Text style={styles.macroValue}>
                  {Math.round(totalFat)}/ {NUTRITION_GOALS.fat}g
                </Text>
                <Text style={styles.macroPercent}>{fatPercent}%</Text>
              </View>
            </View>
          </View>

          {/* 식단 목록 */}
          {!meals || meals.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>아직 기록이 없어요</Text>
              <Text style={styles.emptySubtext}>
                음식 사진을 찍어서 칼로리를 분석해보세요!
              </Text>
            </View>
          ) : (
            [...meals].reverse().map((meal, index) => (
              <MealCardNew key={index} meal={meal} mealIndex={index} />
            ))
          )}
        </View>

        {/* 하단 여백 (바텀 탭바 공간 확보) */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 바텀 탭바 */}
      <BottomTabBar
        activeTab="home"
        onTabPress={(tab) => {
          if (tab === 'add') {
            handleAddMeal();
          } else if (tab === 'menu') {
            setShowMenu(true);
          }
          // home 탭은 이미 현재 화면이므로 별도 처리 불필요
        }}
      />

      {/* 분석 중 인디케이터 */}
      {isAnalyzing && (
        <View style={styles.analyzingOverlay}>
          <ActivityIndicator size="large" color="#88DC00" />
          <Text style={styles.analyzingText}>분석 중...</Text>
        </View>
      )}

      {/* 음식 정보 입력 모달 */}
      <Modal
        visible={showInputModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleModalCancel}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>음식 정보 입력 (선택)</Text>
                  <Text style={styles.modalSubtitle}>
                    더 정확한 분석을 위해 정보를 입력해주세요
                  </Text>

                  {selectedImageUri && (
                    <Image
                      source={{ uri: selectedImageUri }}
                      style={styles.previewImage}
                    />
                  )}

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>음식 이름</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="예: 닭가슴살 샐러드"
                      value={foodName}
                      onChangeText={setFoodName}
                      placeholderTextColor="#999"
                      returnKeyType="next"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>중량 (g)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="예: 350"
                      value={foodWeight}
                      onChangeText={setFoodWeight}
                      keyboardType="numeric"
                      placeholderTextColor="#999"
                      returnKeyType="done"
                      onSubmitEditing={Keyboard.dismiss}
                    />
                  </View>

                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.skipButton]}
                      onPress={() => handleAnalyzeSubmit()}
                    >
                      <Text style={styles.skipButtonText}>건너뛰기</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.submitButton]}
                      onPress={handleAnalyzeSubmit}
                    >
                      <Text style={styles.submitButtonText}>분석하기</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleModalCancel}
                  >
                    <Text style={styles.cancelButtonText}>취소</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {/* 사이드 메뉴 드로어 */}
      <SideDrawer visible={showMenu} onClose={() => setShowMenu(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    backgroundColor: '#D9D9D9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  headerButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  greetingSection: {
    marginBottom: 8,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#000',
    lineHeight: 28,
  },
  divider: {
    height: 12,
    backgroundColor: '#F2F2F7',
    marginHorizontal: -16,
    marginVertical: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  nutritionCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    padding: 16,
    gap: 16,
  },
  nutritionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  calorieRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  calorieValue: {
    fontSize: 20,
    fontWeight: '500',
    color: '#000',
  },
  calorieUnit: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 1,
  },
  emotionText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#000',
  },
  macrosBreakdown: {
    gap: 4,
  },
  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
    width: 100,
  },
  macroValue: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
    textAlign: 'right',
  },
  macroPercent: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
    width: 50,
    textAlign: 'right',
  },
  emptyState: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  analyzingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  analyzingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  skipButton: {
    backgroundColor: '#F5F5F5',
  },
  skipButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#88DC00',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#999',
    fontSize: 15,
  },
});