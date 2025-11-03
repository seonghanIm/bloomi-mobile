import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { getTodayMeals, analyzeMeal, getMonthlyStatistics } from '../services/mealService';
import { MealAnalysis } from '../types/meal';
import CalendarScreen from './CalendarScreen';
import MealCard from '../components/MealCard';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const [meals, setMeals] = useState<MealAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showInputModal, setShowInputModal] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [foodName, setFoodName] = useState('');
  const [foodWeight, setFoodWeight] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [monthlyStats, setMonthlyStats] = useState<Record<string, number>>({});

  useEffect(() => {
    loadTodayMeals();
    loadMonthlyStats();
  }, []);

  const loadMonthlyStats = async () => {
    try {
      const now = new Date();
      const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const stats = await getMonthlyStatistics(yearMonth);
      setMonthlyStats(stats);
    } catch (error) {
      console.error('Failed to load monthly stats:', error);
    }
  };

  const loadTodayMeals = async () => {
    try {
      setIsLoading(true);
      const todayMeals = await getTodayMeals();
      setMeals(todayMeals);
    } catch (error) {
      console.error('Failed to load today meals:', error);
      Alert.alert('오류', '식단 정보를 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMeal = async () => {
    // 권한 요청
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '카메라 권한이 필요합니다.');
      return;
    }

    // 카메라 or 갤러리 선택
    Alert.alert(
      '식단 추가',
      '사진을 선택해주세요',
      [
        {
          text: '카메라',
          onPress: () => takePicture(),
        },
        {
          text: '갤러리',
          onPress: () => pickImage(),
        },
        {
          text: '취소',
          style: 'cancel',
        },
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

    // 초기화
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

      // URI에서 파일명 추출
      const filename = uri.split('/').pop() || 'meal.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      console.log('🍽️ Analyzing meal image:', filename);
      if (name) console.log('📝 Food name:', name);
      if (weight) console.log('⚖️ Food weight:', weight, 'g');

      const result = await analyzeMeal({
        image: {
          uri,
          type,
          name: filename,
        },
        name: name || undefined,
        weight: weight ? parseFloat(weight) : undefined,
      });

      console.log('✅ Analysis result:', result);

      // 성공 메시지
      Alert.alert(
        '분석 완료!',
        `칼로리: ${Math.round(result.calories)}kcal\n신뢰도: ${Math.round(result.confidence * 100)}%\n\n${result.advice}`,
        [{ text: '확인', onPress: () => loadTodayMeals() }]
      );
    } catch (error: any) {
      console.error('❌ Analysis error:', error);
      Alert.alert(
        '분석 실패',
        error.response?.data?.message || '식단 분석 중 오류가 발생했습니다.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 오늘 총 칼로리 계산
  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#30C58F" />
      </View>
    );
  }

  if (showCalendar) {
    return (
      <CalendarScreen
        onClose={() => setShowCalendar(false)}
        monthlyStats={monthlyStats}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>안녕하세요,</Text>
          <Text style={styles.name}>{user?.name}님! 👋</Text>
        </View>
        <TouchableOpacity onPress={() => setShowCalendar(true)} style={styles.calendarButton}>
          <Ionicons name="calendar-outline" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 오늘 총 칼로리 */}
        <View style={styles.calorieCard}>
          <Text style={styles.calorieLabel}>오늘 섭취한 칼로리</Text>
          <Text style={styles.calorieValue}>{Math.round(totalCalories)}</Text>
          <Text style={styles.calorieUnit}>kcal</Text>
        </View>

        {/* 식단 추가 버튼 */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddMeal}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.addButtonText}>+ 식단 추가하기</Text>
          )}
        </TouchableOpacity>

        {/* 오늘 식단 목록 */}
        <View style={styles.mealsSection}>
          <Text style={styles.sectionTitle}>오늘의 식단</Text>
          {meals.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>아직 기록이 없어요</Text>
              <Text style={styles.emptySubtext}>
                음식 사진을 찍어서 칼로리를 분석해보세요!
              </Text>
            </View>
          ) : (
            meals.map((meal, index) => (
              <MealCard key={index} meal={meal} />
            ))
          )}
        </View>

        {/* 통계 */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{meals.length}</Text>
            <Text style={styles.statLabel}>오늘 기록</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {meals.length > 0
                ? Math.round(
                    meals.reduce((sum, m) => sum + m.confidence, 0) /
                      meals.length *
                      100
                  )
                : 0}
              %
            </Text>
            <Text style={styles.statLabel}>평균 신뢰도</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>로그아웃</Text>
        </TouchableOpacity>
      </View>

      {/* 음식 정보 입력 모달 */}
      <Modal
        visible={showInputModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleModalCancel}
      >
        <View style={styles.modalOverlay}>
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
        </View>
      </Modal>
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
    marginTop: 60,
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  calendarButton: {
    padding: 8,
  },
  greeting: {
    fontSize: 20,
    color: '#666',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  calorieCard: {
    backgroundColor: '#30C58F',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
  },
  calorieLabel: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 12,
  },
  calorieValue: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#fff',
  },
  calorieUnit: {
    fontSize: 20,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#B49DF8',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  mealsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
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
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#B49DF8',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#666',
    fontSize: 16,
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
    backgroundColor: '#30C58F',
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