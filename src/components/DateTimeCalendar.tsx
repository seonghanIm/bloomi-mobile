import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import WheelPicker from 'react-native-wheel-scrollview-picker';

interface DateTimeCalendarProps {
  selectedDate: Date;
  selectedTime: string;
  onDateChange: (date: Date) => void;
  onTimeChange: (time: string) => void;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const ROW_HEIGHT = 32; // Figma: 32px per row
const VISIBLE_ITEMS = 3;
const PICKER_HEIGHT = ROW_HEIGHT * VISIBLE_ITEMS; // 96px

type ExpandedMode = 'none' | 'calendar' | 'time';

// Time picker options
const PERIODS = ['오전', '오후'];
const HOURS = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
const MINUTES = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

export default function DateTimeCalendar({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
}: DateTimeCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
  const [expandedMode, setExpandedMode] = useState<ExpandedMode>('none');

  const formatDateDisplay = (date: Date) => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayName = days[date.getDay()];
    return `${year}. ${month}. ${day}. ${dayName}요일`;
  };

  const formatMonthYear = (date: Date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: { date: number; isCurrentMonth: boolean; fullDate: Date }[] = [];

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({
        date: prevMonthLastDay - i,
        isCurrentMonth: false,
        fullDate: new Date(year, month - 1, prevMonthLastDay - i),
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: i,
        isCurrentMonth: true,
        fullDate: new Date(year, month, i),
      });
    }

    // Next month days (fill remaining slots)
    const remainingSlots = 7 - (days.length % 7);
    if (remainingSlots < 7) {
      for (let i = 1; i <= remainingSlots; i++) {
        days.push({
          date: i,
          isCurrentMonth: false,
          fullDate: new Date(year, month + 1, i),
        });
      }
    }

    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const isSelectedDate = (date: Date) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const handleDateSelect = (day: { date: number; isCurrentMonth: boolean; fullDate: Date }) => {
    onDateChange(day.fullDate);
    if (!day.isCurrentMonth) {
      setCurrentMonth(new Date(day.fullDate.getFullYear(), day.fullDate.getMonth(), 1));
    }
  };

  const days = getDaysInMonth(currentMonth);
  const weeks: typeof days[] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  // Parse current time
  const parseTime = (time: string) => {
    const match = time.match(/(\d+):(\d+)(am|pm)/);
    if (match) {
      return {
        hour: parseInt(match[1]),
        minute: match[2],
        period: match[3] === 'am' ? '오전' : '오후',
      };
    }
    return { hour: 12, minute: '00', period: '오후' };
  };

  const currentTimeParts = parseTime(selectedTime);

  // Get current indices for wheel pickers
  const periodIndex = PERIODS.indexOf(currentTimeParts.period);
  const hourIndex = HOURS.indexOf(currentTimeParts.hour.toString());
  const minuteIndex = MINUTES.indexOf(currentTimeParts.minute);

  const updateTime = (period: string, hour: string, minute: string) => {
    const periodCode = period === '오전' ? 'am' : 'pm';
    onTimeChange(`${hour}:${minute}${periodCode}`);
  };

  const toggleMode = (mode: ExpandedMode) => {
    setExpandedMode(expandedMode === mode ? 'none' : mode);
  };

  return (
    <View style={styles.container}>
      {/* Header: Date & Time */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.dateSection}
          onPress={() => toggleMode('calendar')}
          activeOpacity={0.7}
        >
          <View style={styles.iconWrapper}>
            <Ionicons name="time-outline" size={24} color="rgba(0,0,0,0.6)" />
          </View>
          <View style={styles.dateBadge}>
            <Text style={styles.dateText}>{formatDateDisplay(selectedDate)}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.timeBadge}
          onPress={() => toggleMode('time')}
          activeOpacity={0.7}
        >
          <Text style={styles.timeText}>{selectedTime}</Text>
        </TouchableOpacity>
      </View>

      {/* Content - Calendar or Time Picker */}
      {expandedMode !== 'none' && (
        <>
          <View style={styles.divider} />

          {expandedMode === 'calendar' && (
            <View style={styles.calendar}>
              {/* Month Navigation */}
              <View style={styles.monthNav}>
                <TouchableOpacity onPress={goToPreviousMonth}>
                  <Ionicons name="chevron-back" size={16} color="#000" />
                </TouchableOpacity>
                <Text style={styles.monthText}>{formatMonthYear(currentMonth)}</Text>
                <TouchableOpacity onPress={goToNextMonth}>
                  <Ionicons name="chevron-forward" size={16} color="#000" />
                </TouchableOpacity>
              </View>

              {/* Weekdays */}
              <View style={styles.weekdaysRow}>
                {WEEKDAYS.map((day) => (
                  <View key={day} style={styles.weekdayCell}>
                    <Text style={styles.weekdayText}>{day}</Text>
                  </View>
                ))}
              </View>

              {/* Date Grid */}
              {weeks.map((week, weekIndex) => (
                <View key={weekIndex} style={styles.dateRow}>
                  {week.map((day, dayIndex) => {
                    const selected = isSelectedDate(day.fullDate);
                    return (
                      <TouchableOpacity
                        key={dayIndex}
                        style={styles.dateCell}
                        onPress={() => handleDateSelect(day)}
                      >
                        {selected && <View style={styles.selectedCircle} />}
                        <Text
                          style={[
                            styles.dateNumber,
                            !day.isCurrentMonth && styles.dateNumberPrevMonth,
                            selected && styles.dateNumberSelected,
                          ]}
                        >
                          {day.date}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          )}

          {expandedMode === 'time' && (
            <View style={styles.timePicker}>
              {/* Selection Highlight */}
              <View style={styles.selectionHighlight} />

              {/* Wheel Pickers */}
              <View style={styles.wheelContainer}>
                {/* Period Picker (오전/오후) */}
                <View style={styles.wheelWrapper}>
                  <WheelPicker
                    dataSource={PERIODS}
                    selectedIndex={periodIndex >= 0 ? periodIndex : 0}
                    onValueChange={(data: string, index: number) => {
                      updateTime(data, currentTimeParts.hour.toString(), currentTimeParts.minute);
                    }}
                    itemHeight={ROW_HEIGHT}
                    wrapperHeight={PICKER_HEIGHT}
                    wrapperBackground="transparent"
                    highlightColor="transparent"
                    renderItem={(data: string, index: number, isSelected: boolean) => (
                      <Text
                        style={[
                          styles.wheelItemText,
                          isSelected ? styles.wheelItemTextSelected : styles.wheelItemTextGray,
                        ]}
                      >
                        {data}
                      </Text>
                    )}
                  />
                </View>

                {/* Hour Picker */}
                <View style={[styles.wheelWrapper, styles.wheelWrapperWide]}>
                  <WheelPicker
                    dataSource={HOURS}
                    selectedIndex={hourIndex >= 0 ? hourIndex : 0}
                    onValueChange={(data: string, index: number) => {
                      updateTime(currentTimeParts.period, data, currentTimeParts.minute);
                    }}
                    itemHeight={ROW_HEIGHT}
                    wrapperHeight={PICKER_HEIGHT}
                    wrapperBackground="transparent"
                    highlightColor="transparent"
                    renderItem={(data: string, index: number, isSelected: boolean) => (
                      <Text
                        style={[
                          styles.wheelItemText,
                          isSelected ? styles.wheelItemTextSelected : styles.wheelItemTextGray,
                        ]}
                      >
                        {data}
                      </Text>
                    )}
                  />
                </View>

                {/* Minute Picker */}
                <View style={[styles.wheelWrapper, styles.wheelWrapperWide]}>
                  <WheelPicker
                    dataSource={MINUTES}
                    selectedIndex={minuteIndex >= 0 ? minuteIndex : 0}
                    onValueChange={(data: string, index: number) => {
                      updateTime(currentTimeParts.period, currentTimeParts.hour.toString(), data);
                    }}
                    itemHeight={ROW_HEIGHT}
                    wrapperHeight={PICKER_HEIGHT}
                    wrapperBackground="transparent"
                    highlightColor="transparent"
                    renderItem={(data: string, index: number, isSelected: boolean) => (
                      <Text
                        style={[
                          styles.wheelItemText,
                          isSelected ? styles.wheelItemTextSelected : styles.wheelItemTextGray,
                        ]}
                      >
                        {data}
                      </Text>
                    )}
                  />
                </View>
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#C7C7CC', // Figma: grays/gray-3
    borderRadius: 4, // Figma: rounded-[4px]
    paddingHorizontal: 16, // Figma: px-[16px]
    paddingVertical: 14, // Figma: py-[14px]
    gap: 12, // Figma: gap-[12px]
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4, // Figma: gap-[4px]
  },
  iconWrapper: {
    opacity: 0.6,
  },
  dateBadge: {
    paddingHorizontal: 8, // Figma: px-[8px]
    paddingVertical: 4, // Figma: py-[4px]
  },
  dateText: {
    fontSize: 16, // Figma: text-[16px]
    fontWeight: '500', // Figma: Medium
    lineHeight: 20, // Figma: leading-[20px]
    color: '#000',
  },
  timeBadge: {
    backgroundColor: '#F2F2F7', // Figma: grays/gray-6
    paddingHorizontal: 4, // Figma: px-[4px]
    paddingVertical: 2, // Figma: py-[2px]
    borderRadius: 4, // Figma: rounded-[4px]
    height: 24, // Figma: h-[24px]
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16, // Figma: text-[16px]
    fontWeight: '500', // Figma: Medium
    lineHeight: 20, // Figma: leading-[20px]
    color: '#000',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#D9D9D9',
  },
  // Calendar styles
  calendar: {
    gap: 8, // Figma: gap-[8px]
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 24, // Figma: h-[24px]
  },
  monthText: {
    fontSize: 16, // Figma: text-[16px]
    fontWeight: '600', // Figma: SemiBold
    lineHeight: 28,
    color: '#000',
  },
  weekdaysRow: {
    flexDirection: 'row',
    height: 32, // Figma: h-[32px]
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayText: {
    fontSize: 14, // Figma: text-[14px]
    fontWeight: '400', // Figma: Regular
    lineHeight: 20,
    color: 'rgba(0,0,0,0.8)', // Figma: opacity-80
    textAlign: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    height: 32, // Figma: h-[32px]
  },
  dateCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  selectedCircle: {
    position: 'absolute',
    width: 30, // Figma: size-[30px]
    height: 30,
    borderRadius: 15,
    backgroundColor: '#88DC00', // Figma: lime green (brand color)
  },
  dateNumber: {
    fontSize: 16, // Figma: text-[16px]
    fontWeight: '600', // Figma: SemiBold
    lineHeight: 22,
    color: 'rgba(60,60,67,0.6)', // Figma: labels/secondary
    textAlign: 'center',
    zIndex: 1,
  },
  dateNumberPrevMonth: {
    color: 'rgba(60,60,67,0.3)', // Figma: labels/tertiary
  },
  dateNumberSelected: {
    color: '#fff', // Figma: white on selected
  },
  // Time Picker styles (inline, Figma)
  timePicker: {
    height: PICKER_HEIGHT,
    position: 'relative',
    justifyContent: 'center',
  },
  selectionHighlight: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    marginTop: -ROW_HEIGHT / 2,
    height: ROW_HEIGHT, // Figma: h-[32px]
    backgroundColor: '#F2F2F7', // Figma: grays/gray-6
    borderRadius: 4, // Figma: rounded-[4px]
  },
  wheelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4, // Figma: gap-[4px]
  },
  wheelWrapper: {
    alignItems: 'center',
  },
  wheelWrapperWide: {
    width: 72, // Figma: w-[72px]
  },
  wheelItemText: {
    fontSize: 22, // Figma: text-[22px]
    fontWeight: '400', // Figma: Regular
    lineHeight: 24, // Figma: leading-[24px]
    textAlign: 'center',
  },
  wheelItemTextGray: {
    color: '#8E8E93', // Figma: grays/gray
  },
  wheelItemTextSelected: {
    color: '#000', // Figma: black
  },
});