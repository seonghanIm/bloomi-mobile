import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  AnalyzeMealResponse,
  MealType,
  MealEmotion,
  SaveMealRequest,
  MealRecord,
} from '../types/meal';
import { saveMeal } from '../services/mealService';
import { formatLocalDate } from '../utils/dateUtils';
import HappinessSlider from '../components/HappinessSlider';
import MealTypeChips from '../components/MealTypeChips';
import InlineCalendar from '../components/InlineCalendar';

interface MealRecordScreenProps {
  analysisResult: AnalyzeMealResponse;
  imageUri: string;
  onSave: (savedMeal: MealRecord) => void;
  onCancel: () => void;
}

export default function MealRecordScreen({
  analysisResult,
  imageUri,
  onSave,
  onCancel,
}: MealRecordScreenProps) {
  const insets = useSafeAreaInsets();
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const period = hours >= 12 ? 'pm' : 'am';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')}${period}`;
  });
  const [foodName, setFoodName] = useState(analysisResult.name || '');
  const [weight, setWeight] = useState(
    analysisResult.serving?.amount?.toString() || ''
  );
  const [emotion, setEmotion] = useState<MealEmotion | null>('OKAY');
  const [mealType, setMealType] = useState<MealType | null>(() => {
    // Default meal type based on current hour
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 10) return 'BREAKFAST';
    if (hour >= 10 && hour < 14) return 'LUNCH';
    if (hour >= 14 && hour < 17) return 'SNACK';
    if (hour >= 17 && hour < 21) return 'DINNER';
    return 'LATE_NIGHT';
  });
  const [notes, setNotes] = useState('');
  const [participants, setParticipants] = useState<string[]>([]);
  const [location, setLocation] = useState('');

  // Optional fields visibility
  const [showNotes, setShowNotes] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showLocation, setShowLocation] = useState(false);

  const formatDateDisplay = (date: Date) => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayName = days[date.getDay()];
    return `${year}. ${month}. ${day}. ${dayName}요일`;
  };

  const handleSave = async () => {
    if (!mealType) {
      Alert.alert('알림', '음식 유형을 선택해주세요.');
      return;
    }

    try {
      setIsSaving(true);

      const saveRequest: SaveMealRequest = {
        // AI 분석 결과
        imageUrl: analysisResult.imageUrl || imageUri,
        name: foodName || analysisResult.name,
        calories: analysisResult.calories,
        carbs: analysisResult.macros.carbs,
        protein: analysisResult.macros.protein,
        fat: analysisResult.macros.fat,
        servingUnit: analysisResult.serving.unit,
        servingAmount: parseFloat(weight) || analysisResult.serving.amount,
        confidence: analysisResult.confidence,
        advice: analysisResult.advice,
        // 사용자 메타데이터
        analyzedAt: formatLocalDate(selectedDate),
        mealTime: selectedTime,
        mealType: mealType,
        emotion: emotion || undefined,
        notes: notes || undefined,
        participants: participants.length > 0 ? participants : undefined,
        location: location || undefined,
      };

      const savedMeal = await saveMeal(saveRequest);
      onSave(savedMeal);
    } catch (error: any) {
      console.error('Save error:', error);
      Alert.alert(
        '저장 실패',
        error.response?.data?.message || '식단 저장 중 오류가 발생했습니다.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.headerButton}>
          <Text style={styles.cancelText}>취소</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>식단 기록</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={styles.headerButton}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#88DC00" />
          ) : (
            <Text style={styles.saveText}>저장</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Food Image */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.foodImage} />
          </View>

          {/* Date/Time Section */}
          <View style={styles.dateTimeCard}>
            <View style={styles.dateTimeHeader}>
              <View style={styles.dateContainer}>
                <Ionicons name="calendar-outline" size={20} color="#666" />
                <View style={styles.dateBadge}>
                  <Text style={styles.dateText}>{formatDateDisplay(selectedDate)}</Text>
                </View>
              </View>
              <Text style={styles.timeText}>{selectedTime}</Text>
            </View>
            <View style={styles.dividerThin} />
            <InlineCalendar
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              markedDates={{}}
              compact
            />
          </View>

          {/* Food Name Input */}
          <View style={styles.inputRow}>
            <Ionicons name="restaurant-outline" size={20} color="#666" />
            <TextInput
              style={styles.textInput}
              value={foodName}
              onChangeText={setFoodName}
              placeholder="음식 이름"
              placeholderTextColor="#999"
            />
          </View>

          {/* Weight Input */}
          <View style={styles.inputRow}>
            <Ionicons name="scale-outline" size={20} color="#666" />
            <TextInput
              style={styles.textInput}
              value={weight}
              onChangeText={setWeight}
              placeholder="중량 (g)"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

          {/* Happiness Slider */}
          <HappinessSlider value={emotion} onChange={setEmotion} />

          {/* Meal Type Chips */}
          <MealTypeChips value={mealType} onChange={setMealType} />

          {/* Divider */}
          <View style={styles.divider} />

          {/* Optional Fields Buttons */}
          <View style={styles.optionalButtons}>
            <TouchableOpacity
              style={styles.optionalButton}
              onPress={() => setShowNotes(!showNotes)}
            >
              <Ionicons name="add" size={12} color="#404040" />
              <Text style={styles.optionalButtonText}>추가 설명</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionalButton}
              onPress={() => setShowParticipants(!showParticipants)}
            >
              <Ionicons name="add" size={12} color="#404040" />
              <Text style={styles.optionalButtonText}>함께한 사람</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionalButton}
              onPress={() => setShowLocation(!showLocation)}
            >
              <Ionicons name="add" size={12} color="#404040" />
              <Text style={styles.optionalButtonText}>장소</Text>
            </TouchableOpacity>
          </View>

          {/* Optional Fields */}
          {showNotes && (
            <View style={styles.inputRow}>
              <Ionicons name="document-text-outline" size={20} color="#666" />
              <TextInput
                style={styles.textInput}
                value={notes}
                onChangeText={setNotes}
                placeholder="추가 설명을 입력하세요"
                placeholderTextColor="#999"
                multiline
              />
            </View>
          )}

          {showParticipants && (
            <View style={styles.inputRow}>
              <Ionicons name="people-outline" size={20} color="#666" />
              <TextInput
                style={styles.textInput}
                value={participants.join(', ')}
                onChangeText={(text) =>
                  setParticipants(text.split(',').map((s) => s.trim()).filter(Boolean))
                }
                placeholder="함께한 사람 (쉼표로 구분)"
                placeholderTextColor="#999"
              />
            </View>
          )}

          {showLocation && (
            <View style={styles.inputRow}>
              <Ionicons name="location-outline" size={20} color="#666" />
              <TextInput
                style={styles.textInput}
                value={location}
                onChangeText={setLocation}
                placeholder="장소를 입력하세요"
                placeholderTextColor="#999"
              />
            </View>
          )}

          {/* Bottom spacing */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Saving Overlay */}
      {isSaving && (
        <View style={styles.savingOverlay}>
          <ActivityIndicator size="large" color="#88DC00" />
          <Text style={styles.savingText}>저장 중...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerButton: {
    minWidth: 50,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#88DC00',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  imageContainer: {
    marginTop: 16,
    marginBottom: 20,
  },
  foodImage: {
    width: '100%',
    height: 320,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  dateTimeCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#C7C7CC',
    borderRadius: 4,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  dateTimeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateBadge: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  dividerThin: {
    height: 1,
    backgroundColor: '#D9D9D9',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingRight: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#D1D1D6',
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  divider: {
    height: 1,
    backgroundColor: '#D9D9D9',
    marginVertical: 20,
  },
  optionalButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  optionalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 4,
  },
  optionalButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#404040',
  },
  savingOverlay: {
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
  savingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
});