import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
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
              <Text
                style={[
                  styles.chipText,
                  isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                ]}
              >
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
    gap: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipSelected: {
    backgroundColor: '#88DC00',
  },
  chipUnselected: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#AEAEB2',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  chipTextUnselected: {
    color: '#AEAEB2',
  },
});