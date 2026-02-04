import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MealEmotion, MEAL_EMOTION_LABELS } from '../types/meal';

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
        {/* Connection line behind circles */}
        <View style={styles.connectionLine} />
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
                <Text style={styles.levelNumber}>{item.level}</Text>
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
    gap: 20, // Figma: gap-[20px]
  },
  title: {
    fontSize: 16, // Figma: text-[16px]
    fontWeight: '600', // Figma: SemiBold
    lineHeight: 20, // Figma: leading-[20px]
    color: '#000',
  },
  sliderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative',
  },
  connectionLine: {
    position: 'absolute',
    top: 16, // center of 32px circle
    left: 47,
    right: 47,
    height: 2,
    backgroundColor: '#E5E5EA',
    zIndex: 0,
  },
  levelItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8, // Figma: gap-[8px]
    zIndex: 1,
  },
  levelCircle: {
    width: 32, // Figma: size-[32px]
    height: 32,
    borderRadius: 16, // Figma: rounded-[16px]
    backgroundColor: '#E5E5EA', // Figma: grays/gray-5
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelCircleSelected: {
    backgroundColor: '#B3DC14', // Figma: #b3dc14
  },
  levelNumber: {
    fontSize: 16, // Figma: text-[16px]
    fontWeight: '600', // Figma: SemiBold
    lineHeight: 20, // Figma: leading-[20px]
    color: '#fff',
  },
  levelLabel: {
    fontSize: 12, // Figma: text-[12px]
    fontWeight: '400', // Figma: Regular
    lineHeight: 20, // Figma: leading-[20px]
    color: '#000',
    textAlign: 'center',
  },
});
