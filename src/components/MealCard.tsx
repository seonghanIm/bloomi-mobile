import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MealAnalysis } from '../types/meal';

interface MealCardProps {
  meal: MealAnalysis;
}

export default function MealCard({ meal }: MealCardProps) {
  return (
    <View style={styles.mealCard}>
      <View style={styles.mealHeader}>
        <View style={styles.mealTitleContainer}>
          <Text style={styles.mealTitle}>
            {meal.name}
          </Text>
          <View style={styles.confidenceBadge}>
            <Text style={styles.confidenceText}>
              신뢰도 {Math.round(meal.confidence * 100)}%
            </Text>
          </View>
        </View>
        <Text style={styles.mealCalories}>
          {Math.round(meal.calories)} kcal
        </Text>
      </View>
      <View style={styles.macrosContainer}>
        <View style={styles.macroItem}>
          <Text style={styles.macroLabel}>탄수화물</Text>
          <Text style={styles.macroValue}>
            {Math.round(meal.macros.carbs)}g
          </Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroLabel}>단백질</Text>
          <Text style={styles.macroValue}>
            {Math.round(meal.macros.protein)}g
          </Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroLabel}>지방</Text>
          <Text style={styles.macroValue}>
            {Math.round(meal.macros.fat)}g
          </Text>
        </View>
      </View>
      {meal.advice && (
        <Text style={styles.mealAdvice}>💡 {meal.advice}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mealCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  mealTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  confidenceBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#B49DF8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  confidenceText: {
    fontSize: 11,
    color: '#fcfcfcff',
    fontWeight: '600',
  },
  mealCalories: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#30C58F',
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  mealAdvice: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    lineHeight: 20,
  },
});