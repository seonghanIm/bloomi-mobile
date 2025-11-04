import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { getMealsByDate } from '../services/mealService';
import { MealAnalysis } from '../types/meal';
import MealCard from '../components/MealCard';

interface CalendarScreenProps {
  onClose: () => void;
  monthlyStats: Record<string, number>; // { "2025-01-15": 3, ... }
}

export default function CalendarScreen({ onClose, monthlyStats }: CalendarScreenProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [meals, setMeals] = useState<MealAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleDayPress = async (day: DateData) => {
    setSelectedDate(day.dateString);
    await loadMealsForDate(day.dateString);
  };

  const loadMealsForDate = async (date: string) => {
    try {
      setIsLoading(true);
      const mealsData = await getMealsByDate(date);
      setMeals(mealsData);
    } catch (error) {
      console.error('Failed to load meals for date:', error);
      Alert.alert('오류', '식단 정보를 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 달력에 표시할 마킹 데이터 생성
  const markedDates = React.useMemo(() => {
    const marked: any = {};

    // 월별 통계에서 마킹 생성
    if (monthlyStats) {
      Object.entries(monthlyStats).forEach(([date, count]) => {
        marked[date] = {
          marked: true,
          dotColor: '#4CAF50',
          customStyles: {
            text: {
              color: count > 0 ? '#4CAF50' : '#333',
              fontWeight: count > 0 ? 'bold' : 'normal',
            },
          },
        };
      });
    }

    // 선택된 날짜 하이라이트
    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: '#4CAF50',
      };
    }

    return marked;
  }, [monthlyStats, selectedDate]);

  const totalCalories = meals?.reduce((sum, meal) => sum + meal.calories, 0) || 0;

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>식단 캘린더</Text>
      </View>

      {/* 달력 */}
      <Calendar
        onDayPress={handleDayPress}
        markedDates={markedDates}
        theme={{
          todayTextColor: '#4CAF50',
          selectedDayBackgroundColor: '#4CAF50',
          selectedDayTextColor: '#fff',
          arrowColor: '#4CAF50',
          monthTextColor: '#333',
          textMonthFontWeight: 'bold',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          dotColor: '#4CAF50',
          selectedDotColor: '#fff',
        }}
        style={styles.calendar}
      />

      {/* 선택된 날짜의 식단 목록 */}
      <ScrollView style={styles.mealsContainer} showsVerticalScrollIndicator={false}>
        {selectedDate ? (
          <>
            <View style={styles.dateHeader}>
              <Text style={styles.dateTitle}>
                {new Date(selectedDate).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
              {meals.length > 0 && (
                <View style={styles.calorieChip}>
                  <Text style={styles.calorieChipText}>
                    {Math.round(totalCalories)} kcal
                  </Text>
                </View>
              )}
            </View>

            {isLoading ? (
              <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 40 }} />
            ) : meals.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="restaurant-outline" size={48} color="#CCC" />
                <Text style={styles.emptyText}>이 날은 기록이 없어요</Text>
              </View>
            ) : (
              meals.map((meal, index) => (
                <MealCard key={index} meal={meal} />
              ))
            )}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color="#CCC" />
            <Text style={styles.emptyText}>날짜를 선택해주세요</Text>
          </View>
        )}
      </ScrollView>
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
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  calendar: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  mealsContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  calorieChip: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  calorieChipText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
});