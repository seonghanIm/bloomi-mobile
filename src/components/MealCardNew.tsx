import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MealAnalysis } from '../types/meal';

interface MealCardNewProps {
  meal: MealAnalysis;
  mealIndex: number;
}

// 식사 타입 결정 (시간 기반 또는 인덱스 기반)
const getMealType = (index: number): { label: string; color: string } => {
  // 추후 API에서 mealType을 받아올 예정
  // 현재는 인덱스로 임시 결정
  const types = [
    { label: '아침', color: '#F2F2F7' },
    { label: '점심', color: '#F2F2F7' },
    { label: '저녁', color: '#F2F2F7' },
    { label: '간식', color: '#F2F2F7' },
  ];
  return types[index % types.length];
};

// 감정 상태 결정 (신뢰도 기반)
const getEmotionChip = (confidence: number): { label: string; bgColor: string } => {
  if (confidence >= 0.8) return { label: '즐거워요', bgColor: '#88DC00' };
  if (confidence >= 0.6) return { label: '할만해요', bgColor: '#FFB515' };
  if (confidence >= 0.4) return { label: '보통이에요', bgColor: '#D9D9D9' };
  return { label: '어려워요', bgColor: '#FF383C' };
};

export default function MealCardNew({ meal, mealIndex }: MealCardNewProps) {
  const mealType = getMealType(mealIndex);
  const emotion = getEmotionChip(meal.confidence);

  return (
    <View style={styles.container}>
      {/* 썸네일 이미지 영역 (추후 이미지 URL 추가 시 사용) */}
      <View style={styles.imageContainer}>
        <View style={styles.imagePlaceholder}>
          <Ionicons name="restaurant-outline" size={40} color="#D1D1D6" />
        </View>
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

        {/* 메타 정보 (사람, 위치) - 추후 API 확장 시 사용 */}
        <View style={styles.metaContainer}>
          {/* 참여자 (추후 구현) */}
          <View style={styles.metaRow}>
            <Ionicons name="person-outline" size={16} color="#D1D1D6" />
            <Text style={styles.metaText}>나</Text>
          </View>

          {/* 위치 (추후 구현) */}
          {/* <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={16} color="#D1D1D6" />
            <Text style={styles.metaText}>위치 정보</Text>
          </View> */}
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