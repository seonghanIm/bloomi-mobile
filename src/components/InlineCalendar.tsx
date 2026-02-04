import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MealEmotion } from '../types/meal';

// 감정별 라벨과 색상 (meal.ts의 MealEmotion 타입과 일치)
const EMOTION_CONFIG: Record<MealEmotion, { label: string; color: string }> = {
  TERRIBLE: { label: '죽겠어요', color: '#ABABAB' },
  HARD: { label: '조금 힘들어요', color: '#D1D1D6' },
  OKAY: { label: '할만해요', color: '#B3DC14' },
  ENJOYABLE: { label: '즐거워요', color: '#A9E600' },
  VERY_HAPPY: { label: '아주 행복해요', color: '#88DC00' },
};

interface MarkedDate {
  dots?: number;
  emotion?: MealEmotion;
}

interface InlineCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  markedDates?: Record<string, MarkedDate>;
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

    // 이전 달의 날짜 (음수로 표시)
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

  // 주 단위로 그룹화
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  // 마지막 주가 7일 미만이면 null로 채움
  const lastWeek = weeks[weeks.length - 1];
  while (lastWeek && lastWeek.length < 7) {
    lastWeek.push(null);
  }

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {/* 월 네비게이션 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPrevMonth} style={styles.navButton}>
          <Ionicons name="chevron-back" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
        </Text>
        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* 요일 헤더 */}
      <View style={styles.weekdaysRow}>
        {WEEKDAYS.map((day, index) => (
          <View key={day} style={styles.weekdayCell}>
            <Text
              style={[
                styles.weekdayText,
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
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.weekRow}>
            {week.map((day, dayIndex) => {
              const globalIndex = weekIndex * 7 + dayIndex;
              const dateString = day && day > 0
                ? formatDateString(year, month, day)
                : '';
              const markedData = dateString ? markedDates[dateString] : null;
              const emotion = markedData?.emotion;
              const selected = day !== null && day > 0 && isSelected(day);
              const today = day !== null && day > 0 && isToday(day);
              const isPrevMonth = day !== null && day < 0;
              const sunday = isSunday(globalIndex);
              const saturday = isSaturday(globalIndex);

              return (
                <View key={dayIndex} style={styles.daySlot}>
                  <TouchableOpacity
                    style={styles.dayTouchable}
                    onPress={() => day && day > 0 && handleDayPress(day)}
                    disabled={!day || day < 0}
                  >
                    <View style={[
                      styles.dayContent,
                      selected && styles.selectedDay,
                    ]}>
                      <Text
                        style={[
                          styles.dayText,
                          isPrevMonth && sunday && styles.prevMonthSundayText,
                          isPrevMonth && !sunday && styles.prevMonthText,
                          !isPrevMonth && sunday && styles.sundayText,
                          !isPrevMonth && saturday && styles.saturdayText,
                          selected && styles.selectedDayText,
                          today && !selected && styles.todayText,
                        ]}
                      >
                        {day !== null ? Math.abs(day) : ''}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* 감정 칩 */}
                  {emotion && !compact && (
                    <View style={[
                      styles.emotionChip,
                      { backgroundColor: EMOTION_CONFIG[emotion].color },
                      selected && styles.emotionChipSelected,
                    ]}>
                      <Text style={styles.emotionChipText}>
                        {EMOTION_CONFIG[emotion].label}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
  },
  containerCompact: {
    paddingVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 24, // Figma: h-[24px]
    marginBottom: 8,
  },
  navButton: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthText: {
    fontSize: 20, // Figma: text-[20px]
    fontWeight: '600', // Figma: SemiBold
    lineHeight: 28, // Figma: leading-[28px]
    color: '#000',
  },
  weekdaysRow: {
    flexDirection: 'row',
    height: 40,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayText: {
    fontSize: 14, // Figma: text-[14px]
    fontWeight: '400', // Figma: Regular
    lineHeight: 20, // Figma: leading-[1.4] = 14 * 1.4
    color: 'rgba(0, 0, 0, 0.8)', // Figma: opacity-80
    textAlign: 'center',
  },
  sundayText: {
    color: '#FF383C', // Figma: accents/red
  },
  saturdayText: {
    color: '#0088FF', // Figma: accents/blue
  },
  daysGrid: {
    gap: 0,
  },
  weekRow: {
    flexDirection: 'row',
    minHeight: 52, // 날짜 + 칩 공간
  },
  daySlot: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 12, // Figma: pb-[12px]
  },
  dayTouchable: {
    alignItems: 'center',
  },
  dayContent: {
    width: 30, // Figma: size-[30px]
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100, // Figma: rounded-[100px]
  },
  selectedDay: {
    backgroundColor: '#88DC00', // Figma: primary-70
  },
  dayText: {
    fontSize: 16, // Figma: text-[16px]
    fontWeight: '600', // Figma: SemiBold
    lineHeight: 22, // Figma: leading-[1.4] = 16 * 1.4
    color: 'rgba(60, 60, 67, 0.6)', // Figma: labels/secondary
    textAlign: 'center',
  },
  prevMonthText: {
    color: 'rgba(60, 60, 67, 0.3)', // Figma: labels/tertiary
  },
  prevMonthSundayText: {
    color: 'rgba(255, 56, 60, 0.5)', // Figma: destructive disabled
  },
  selectedDayText: {
    color: '#fff', // Figma: white
  },
  todayText: {
    color: '#88DC00',
  },
  // 감정 칩 스타일
  emotionChip: {
    marginTop: 4,
    paddingHorizontal: 4, // Figma: px-[4px]
    height: 16, // Figma: h-[16px]
    borderRadius: 4, // Figma: rounded-[4px]
    alignItems: 'center',
    justifyContent: 'center',
  },
  emotionChipSelected: {
    // 선택된 날짜의 칩은 동일한 스타일 유지
  },
  emotionChipText: {
    fontSize: 8, // Figma: text-[8px]
    fontWeight: '600', // Figma: SemiBold
    lineHeight: 8, // Figma: leading-[8px]
    color: '#fff', // Figma: white
    letterSpacing: -0.4, // Figma: tracking-[-0.4px] for some chips
  },
});
