import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InlineCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  markedDates?: Record<string, { dots?: number }>;
  compact?: boolean;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default function InlineCalendar({
  selectedDate,
  onSelectDate,
  markedDates = {},
  compact = false,
}: InlineCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (number | null)[] = [];

    // 이전 달의 빈 칸
    for (let i = 0; i < startingDay; i++) {
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      days.push(-(prevMonthLastDay - startingDay + i + 1));
    }

    // 현재 달의 날짜
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const formatDateString = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day > 0 &&
      currentMonth.getFullYear() === today.getFullYear() &&
      currentMonth.getMonth() === today.getMonth() &&
      day === today.getDate()
    );
  };

  const isSelected = (day: number) => {
    return (
      day > 0 &&
      currentMonth.getFullYear() === selectedDate.getFullYear() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      day === selectedDate.getDate()
    );
  };

  const isSunday = (index: number) => index % 7 === 0;
  const isSaturday = (index: number) => index % 7 === 6;

  const goToPrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDayPress = (day: number) => {
    if (day > 0) {
      const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      onSelectDate(newDate);
    }
  };

  const days = getDaysInMonth(currentMonth);
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // 6주로 맞추기
  const totalCells = Math.ceil(days.length / 7) * 7;
  while (days.length < totalCells) {
    days.push(null);
  }

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {/* 월 네비게이션 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPrevMonth} style={styles.navButton}>
          <Ionicons name="chevron-back" size={compact ? 16 : 20} color="#000" />
        </TouchableOpacity>
        <Text style={[styles.monthText, compact && styles.monthTextCompact]}>
          {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
        </Text>
        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={compact ? 16 : 20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* 요일 헤더 */}
      <View style={styles.weekdaysRow}>
        {WEEKDAYS.map((day, index) => (
          <View key={day} style={[styles.weekdayCell, compact && styles.weekdayCellCompact]}>
            <Text
              style={[
                styles.weekdayText,
                compact && styles.weekdayTextCompact,
                index === 0 && styles.sundayText,
                index === 6 && styles.saturdayText,
              ]}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* 날짜 그리드 */}
      <View style={styles.daysGrid}>
        {days.map((day, index) => {
          const dateString = day && day > 0
            ? formatDateString(year, month, day)
            : '';
          const hasMeals = dateString && markedDates[dateString]?.dots;
          const selected = day !== null && day > 0 && isSelected(day);
          const today = day !== null && day > 0 && isToday(day);
          const isPrevMonth = day !== null && day < 0;

          return (
            <TouchableOpacity
              key={index}
              style={[styles.dayCell, compact && styles.dayCellCompact]}
              onPress={() => day && day > 0 && handleDayPress(day)}
              disabled={!day || day < 0}
            >
              <View style={[
                styles.dayContent,
                compact && styles.dayContentCompact,
                selected && styles.selectedDay,
                selected && compact && styles.selectedDayCompact,
              ]}>
                <Text
                  style={[
                    styles.dayText,
                    compact && styles.dayTextCompact,
                    isPrevMonth && styles.prevMonthText,
                    isSunday(index) && !isPrevMonth && styles.sundayText,
                    isSaturday(index) && !isPrevMonth && styles.saturdayText,
                    selected && styles.selectedDayText,
                    today && !selected && styles.todayText,
                  ]}
                >
                  {day !== null ? Math.abs(day) : ''}
                </Text>
              </View>
              {/* 기록 있는 날 표시 (점) */}
              {hasMeals && !selected && !compact ? (
                <View style={styles.dotsContainer}>
                  <View style={[styles.dot, styles.dotGreen]} />
                  {hasMeals > 1 && <View style={[styles.dot, styles.dotGreen]} />}
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  containerCompact: {
    paddingVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  navButton: {
    padding: 8,
  },
  monthText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginHorizontal: 16,
  },
  monthTextCompact: {
    fontSize: 16,
    marginHorizontal: 12,
  },
  weekdaysRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekdayCellCompact: {
    paddingVertical: 4,
  },
  weekdayText: {
    fontSize: 14,
    color: 'rgba(60, 60, 67, 0.8)',
  },
  weekdayTextCompact: {
    fontSize: 12,
  },
  sundayText: {
    color: '#FF383C',
  },
  saturdayText: {
    color: '#0088FF',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    alignItems: 'center',
    paddingVertical: 4,
    minHeight: 52,
  },
  dayCellCompact: {
    minHeight: 32,
    paddingVertical: 2,
  },
  dayContent: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  dayContentCompact: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  selectedDay: {
    backgroundColor: '#88DC00',
  },
  selectedDayCompact: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(60, 60, 67, 0.6)',
  },
  dayTextCompact: {
    fontSize: 14,
  },
  prevMonthText: {
    color: 'rgba(60, 60, 67, 0.3)',
  },
  selectedDayText: {
    color: '#fff',
  },
  todayText: {
    color: '#88DC00',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 2,
    gap: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotGreen: {
    backgroundColor: '#88DC00',
  },
});