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
import DateTimeCalendar from '../components/DateTimeCalendar';

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
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          {/* Food Image - Figma: h-[320px] */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.foodImage} />
          </View>

          {/* 식단 기록 Section - Figma: gap-[12px] */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>식단 기록</Text>

            {/* Food Name Input Row */}
            <View style={styles.inputRow}>
              <Ionicons name="restaurant-outline" size={24} color="#666" />
              <TextInput
                style={styles.textInput}
                value={foodName}
                onChangeText={setFoodName}
                placeholder="음식 이름"
                placeholderTextColor="#999"
              />
              <Text style={styles.inputSuffix}>
                {weight ? `${weight}g` : ''} · {Math.round(analysisResult.calories)}kcal
              </Text>
            </View>

            {/* 추가 Button */}
            <TouchableOpacity style={styles.addButton}>
              <Ionicons name="add" size={12} color="#333" />
              <Text style={styles.addButtonText}>추가</Text>
            </TouchableOpacity>
          </View>

          {/* 행복도 Slider */}
          <HappinessSlider value={emotion} onChange={setEmotion} />

          {/* 음식 유형 Chips */}
          <MealTypeChips value={mealType} onChange={setMealType} />

          {/* Date/Time Calendar - Figma style */}
          <DateTimeCalendar
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onDateChange={setSelectedDate}
            onTimeChange={setSelectedTime}
          />

          {/* Optional Section */}
          <View style={styles.optionalSection}>
            <View style={styles.divider} />
            <View style={styles.optionalButtons}>
              <TouchableOpacity
                style={styles.optionalButton}
                onPress={() => setShowNotes(!showNotes)}
              >
                <Ionicons name="add" size={12} color="#333" />
                <Text style={styles.optionalButtonText}>추가 설명</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.optionalButton}
                onPress={() => setShowParticipants(!showParticipants)}
              >
                <Ionicons name="add" size={12} color="#333" />
                <Text style={styles.optionalButtonText}>함께한 사람</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.optionalButton}
                onPress={() => setShowLocation(!showLocation)}
              >
                <Ionicons name="add" size={12} color="#333" />
                <Text style={styles.optionalButtonText}>장소</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Optional Fields */}
          {showNotes && (
            <View style={styles.inputRow}>
              <Ionicons name="document-text-outline" size={24} color="#666" />
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
              <Ionicons name="people-outline" size={24} color="#666" />
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
              <Ionicons name="location-outline" size={24} color="#666" />
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
    padding: 16, // Figma: p-[16px]
    gap: 32, // Figma: gap-[32px]
    paddingBottom: 40, // Extra bottom padding for scroll
  },
  imageContainer: {
    // Removed margins, handled by gap
  },
  foodImage: {
    width: '100%',
    height: 320, // Figma: h-[320px]
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  // 식단 기록 section
  sectionContainer: {
    gap: 12, // Figma: gap-[12px]
  },
  sectionTitle: {
    fontSize: 16, // Figma: text-[16px]
    fontWeight: '600', // Figma: SemiBold
    lineHeight: 20, // Figma: leading-[20px]
    color: '#000',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48, // Figma: h-[48px]
    gap: 8, // Figma: gap-[8px]
    paddingRight: 16, // Figma: pr-[16px]
    paddingVertical: 14, // Figma: py-[14px]
    borderBottomWidth: 1,
    borderBottomColor: '#D1D1D6', // Figma: grays/gray-4
    backgroundColor: '#fff',
  },
  textInput: {
    flex: 1,
    fontSize: 16, // Figma: text-[16px]
    fontWeight: '500', // Figma: Medium
    lineHeight: 20, // Figma: leading-[20px]
    color: '#000',
  },
  inputSuffix: {
    fontSize: 16, // Figma: text-[16px]
    fontWeight: '500', // Figma: Medium
    lineHeight: 20, // Figma: leading-[20px]
    color: '#000',
    textAlign: 'right',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4, // Figma: gap-[4px]
    paddingHorizontal: 8, // Figma: px-[8px]
    paddingVertical: 6, // Figma: py-[6px]
    backgroundColor: '#F2F2F7', // Figma: grays/gray-6
    borderRadius: 4, // Figma: rounded-[4px]
    alignSelf: 'flex-start',
  },
  addButtonText: {
    fontSize: 12, // Figma: text-[12px]
    fontWeight: '500', // Figma: Medium
    lineHeight: 16, // Figma: leading-[16px]
    color: '#333', // Figma: labels-vibrant/primary
  },
  // Date/Time row
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48, // Figma: h-[48px]
    gap: 8, // Figma: gap-[8px]
    paddingRight: 20, // Figma: pr-[20px]
    paddingVertical: 14, // Figma: py-[14px]
    borderBottomWidth: 1,
    borderBottomColor: '#D1D1D6', // Figma: grays/gray-4
    backgroundColor: '#fff',
  },
  dateText: {
    fontSize: 16, // Figma: text-[16px]
    fontWeight: '500', // Figma: Medium
    lineHeight: 20, // Figma: leading-[20px]
    color: '#000',
  },
  timeText: {
    flex: 1,
    fontSize: 16, // Figma: text-[16px]
    fontWeight: '500', // Figma: Medium
    lineHeight: 20, // Figma: leading-[20px]
    color: '#000',
    textAlign: 'right',
  },
  // Divider
  divider: {
    height: 1,
    backgroundColor: '#D9D9D9',
  },
  // Optional buttons section
  optionalSection: {
    gap: 16, // Figma: gap-[16px]
  },
  optionalButtons: {
    flexDirection: 'row',
    gap: 8, // Figma: gap-[8px]
  },
  optionalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4, // Figma: gap-[4px]
    paddingHorizontal: 8, // Figma: px-[8px]
    paddingVertical: 6, // Figma: py-[6px]
    backgroundColor: '#F2F2F7', // Figma: grays/gray-6
    borderRadius: 4, // Figma: rounded-[4px]
  },
  optionalButtonText: {
    fontSize: 12, // Figma: text-[12px]
    fontWeight: '500', // Figma: Medium
    lineHeight: 16, // Figma: leading-[16px]
    color: '#333', // Figma: labels-vibrant/primary
  },
  // Legacy styles kept for compatibility
  dateTimeCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#C7C7CC',
    borderRadius: 4,
    padding: 16,
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
  dividerThin: {
    height: 1,
    backgroundColor: '#D9D9D9',
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