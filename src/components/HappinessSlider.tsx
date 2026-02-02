import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MealEmotion, MEAL_EMOTION_LABELS, getEmotionByLevel } from '../types/meal';

interface HappinessSliderProps {
  value: MealEmotion | null;
  onChange: (emotion: MealEmotion) => void;
}

const EMOTION_LEVELS = [
  { level: 1, emotion: 'TERRIBLE' as MealEmotion, label: '죽겠어요' },
  { level: 2, emotion: 'HARD' as MealEmotion, label: '조금 힘들어요' },
  { level: 3, emotion: 'OKAY' as MealEmotion, label: '할만해요' },
  { level: 4, emotion: 'ENJOYABLE' as MealEmotion, label: '즐거워요' },
  { level: 5, emotion: 'VERY_HAPPY' as MealEmotion, label: '아주 행복해요' },
];

export default function HappinessSlider({ value, onChange }: HappinessSliderProps) {
  const selectedLevel = value ? MEAL_EMOTION_LABELS[value].level : null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>행복도</Text>
      <View style={styles.sliderContainer}>
        {EMOTION_LEVELS.map((item) => {
          const isSelected = selectedLevel === item.level;
          return (
            <TouchableOpacity
              key={item.level}
              style={styles.levelItem}
              onPress={() => onChange(item.emotion)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.levelCircle,
                  isSelected && styles.levelCircleSelected,
                ]}
              >
                <Text
                  style={[
                    styles.levelNumber,
                    isSelected && styles.levelNumberSelected,
                  ]}
                >
                  {item.level}
                </Text>
              </View>
              <Text style={styles.levelLabel}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  sliderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  levelItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  levelCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelCircleSelected: {
    backgroundColor: '#88DC00',
  },
  levelNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  levelNumberSelected: {
    color: '#fff',
  },
  levelLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: '#000',
    textAlign: 'center',
  },
});