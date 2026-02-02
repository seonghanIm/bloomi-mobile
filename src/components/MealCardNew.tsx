import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  MealRecord,
  MealType,
  MealEmotion,
  MEAL_TYPE_LABELS,
  MEAL_EMOTION_LABELS,
} from '../types/meal';

interface MealCardNewProps {
  meal: MealRecord;
  mealIndex: number;
}

// 식사 타입 표시 (API 데이터 또는 인덱스 기반 폴백)
const getMealTypeDisplay = (mealType?: MealType, index?: number): { label: string; color: string } => {
  if (mealType) {
    return { label: MEAL_TYPE_LABELS[mealType], color: '#F2F2F7' };
  }
  // 폴백: 인덱스 기반
  const types: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];
  const fallbackType = types[(index || 0) % types.length];
  return { label: MEAL_TYPE_LABELS[fallbackType], color: '#F2F2F7' };
};

// 감정 상태 표시 (API 데이터 또는 신뢰도 기반 폴백)
const getEmotionDisplay = (emotion?: MealEmotion, confidence?: number): { label: string; bgColor: string } => {
  if (emotion) {
    const emotionData = MEAL_EMOTION_LABELS[emotion];
    const colorMap: Record<MealEmotion, string> = {
      HAPPY: '#88DC00',
      SATISFIED: '#88DC00',
      NORMAL: '#D9D9D9',
      SAD: '#FF383C',
      STRESSED: '#FF383C',
      TIRED: '#FFB515',
    };
    return { label: emotionData.label, bgColor: colorMap[emotion] };
  }
  // 폴백: 신뢰도 기반
  const conf = confidence || 0.5;
  if (conf >= 0.8) return { label: '즐거워요', bgColor: '#88DC00' };
  if (conf >= 0.6) return { label: '할만해요', bgColor: '#FFB515' };
  if (conf >= 0.4) return { label: '보통이에요', bgColor: '#D9D9D9' };
  return { label: '어려워요', bgColor: '#FF383C' };
};

// 참여자 표시 텍스트 생성
const getParticipantsDisplay = (participants?: string[]): string => {
  if (!participants || participants.length === 0) {
    return '나';
  }
  if (participants.length <= 3) {
    return participants.join(', ');
  }
  const displayNames = participants.slice(0, 3).join(', ');
  const remainingCount = participants.length - 3;
  return `${displayNames} +${remainingCount}`;
};

export default function MealCardNew({ meal, mealIndex }: MealCardNewProps) {
  const mealType = getMealTypeDisplay(meal.mealType, mealIndex);
  const emotion = getEmotionDisplay(meal.emotion, meal.confidence);
  const participantsText = getParticipantsDisplay(meal.participants);

  return (
    <View style={styles.container}>
      {/* 썸네일 이미지 영역 */}
      <View style={styles.imageContainer}>
        {meal.imageUrl ? (
          <Image source={{ uri: meal.imageUrl }} style={styles.mealImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="restaurant-outline" size={40} color="#D1D1D6" />
          </View>
        )}
      </View>

      {/* 정보 영역 */}
      <View style={styles.infoContainer}>
        {/* 칩 영역 */}
        <View style={styles.chipsRow}>
          <View style={[styles.chip, { backgroundColor: mealType.color }]}>
            <Text style={styles.chipText}>{mealType.label}</Text>
          </View>
          <View style={[styles.chip, { backgroundColor: emotion.bgColor }]}>
            <Text style={[styles.chipText, { color: '#fff' }]}>{emotion.label}</Text>
          </View>
        </View>

        {/* 음식명 및 영양정보 */}
        <View style={styles.detailsContainer}>
          <Text style={styles.foodName} numberOfLines={1}>
            {meal.name}
          </Text>
          <View style={styles.nutritionRow}>
            <Text style={styles.nutritionText}>
              {Math.round(meal.serving.amount)}{meal.serving.unit}
            </Text>
            <Text style={styles.nutritionText}>
              {Math.round(meal.calories)}kcal
            </Text>
          </View>
        </View>

        {/* 메타 정보 (사람, 위치) */}
        <View style={styles.metaContainer}>
          {/* 참여자 */}
          <View style={styles.metaRow}>
            <Ionicons name="people-outline" size={16} color="#D1D1D6" />
            <Text style={styles.metaText}>{participantsText}</Text>
          </View>

          {/* 위치 */}
          {meal.location && (
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={16} color="#D1D1D6" />
              <Text style={styles.metaText}>{meal.location}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 4,
    padding: 16,
    gap: 12,
  },
  imageContainer: {
    width: 120,
    height: 120,
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  infoContainer: {
    flex: 1,
    gap: 16,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 16,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
  },
  detailsContainer: {
    gap: 4,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  nutritionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  nutritionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
  },
  metaContainer: {
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
  },
});
