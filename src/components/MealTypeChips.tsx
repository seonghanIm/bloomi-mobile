import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MealType, MEAL_TYPE_LABELS } from '../types/meal';

interface MealTypeChipsProps {
  value: MealType | null;
  onChange: (mealType: MealType) => void;
}

const MEAL_TYPES: MealType[] = [
  'BREAKFAST',
  'BRUNCH',
  'LUNCH',
  'LINNER',
  'DINNER',
  'LATE_NIGHT',
  'SNACK',
  'COFFEE',
  'ALCOHOL',
];

export default function MealTypeChips({ value, onChange }: MealTypeChipsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>음식 유형</Text>
      <View style={styles.chipsContainer}>
        {MEAL_TYPES.map((mealType) => {
          const isSelected = value === mealType;
          return (
            <TouchableOpacity
              key={mealType}
              style={[
                styles.chip,
                isSelected ? styles.chipSelected : styles.chipUnselected,
              ]}
              onPress={() => onChange(mealType)}
              activeOpacity={0.7}
            >
              {isSelected && (
                <View style={styles.checkIcon}>
                  <Ionicons name="checkmark" size={13} color="#fff" />
                </View>
              )}
              <Text style={styles.chipText}>
                {MEAL_TYPE_LABELS[mealType]}
              </Text>
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
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8, // Figma: gap-[8px]
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4, // Figma: gap-[4px]
    paddingHorizontal: 12, // Figma: px-[12px]
    paddingVertical: 6, // Figma: py-[6px]
    borderRadius: 16, // Figma: rounded-[16px]
  },
  chipSelected: {
    backgroundColor: '#6E2FF4', // Figma: purple-40
  },
  chipUnselected: {
    backgroundColor: '#E0D6EF', // Figma: purple light
  },
  checkIcon: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 14, // Figma: text-[14px]
    fontWeight: '600', // Figma: SemiBold
    lineHeight: 20, // Figma: leading-[20px]
    color: '#fff',
  },
});