import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  MealRecord,
  MEAL_TYPE_LABELS,
  MEAL_EMOTION_LABELS,
} from '../types/meal';

interface MealResultScreenProps {
  meal: MealRecord;
  onClose: () => void;
  onShare?: () => void;
}

// Nutrition goals (hardcoded - same as HomeScreen)
const NUTRITION_GOALS = {
  calories: 2000,
  carbs: 300,
  protein: 60,
  fat: 65,
};

export default function MealResultScreen({
  meal,
  onClose,
  onShare,
}: MealResultScreenProps) {
  const insets = useSafeAreaInsets();

  const formatDateTime = (date: string, time?: string) => {
    const d = new Date(date);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const dayName = days[d.getDay()];
    const timeStr = time || '';
    return `${year}. ${month}. ${day}. ${dayName}요일${timeStr ? `, ${timeStr}` : ''}`;
  };

  // Calculate percentages
  const caloriePercent = Math.min(
    Math.round((meal.calories / NUTRITION_GOALS.calories) * 100),
    100
  );
  const carbsPercent = Math.min(
    Math.round((meal.macros.carbs / NUTRITION_GOALS.carbs) * 100),
    100
  );
  const proteinPercent = Math.min(
    Math.round((meal.macros.protein / NUTRITION_GOALS.protein) * 100),
    100
  );
  const fatPercent = Math.min(
    Math.round((meal.macros.fat / NUTRITION_GOALS.fat) * 100),
    100
  );

  // Get emotion level and AI score
  const emotionData = meal.emotion ? MEAL_EMOTION_LABELS[meal.emotion] : null;
  const aiScore = Math.round(meal.confidence * 100);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 24 }]}>
      {/* Header Icons */}
      <View style={styles.headerIcons}>
        {onShare && (
          <TouchableOpacity onPress={onShare} style={styles.iconButton}>
            <Ionicons name="share-outline" size={24} color="#000" />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onClose} style={styles.iconButton}>
          <Ionicons name="close-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Title Row */}
      <View style={styles.titleRow}>
        <Text style={styles.completeText}>식단 기록 완료!</Text>
        <Text style={styles.feedbackLabel}>AI 잇코치 피드백</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Food Image */}
        <View style={styles.imageContainer}>
          {meal.imageUrl ? (
            <Image source={{ uri: meal.imageUrl }} style={styles.foodImage} />
          ) : (
            <View style={[styles.foodImage, styles.imagePlaceholder]}>
              <Ionicons name="restaurant-outline" size={60} color="#D1D1D6" />
            </View>
          )}
        </View>

        {/* Food Info Section */}
        <View style={styles.foodInfoSection}>
          <Text style={styles.foodName}>{meal.name}</Text>
          <Text style={styles.dateTime}>
            {formatDateTime(meal.analyzedAt)}
          </Text>
          <View style={styles.tagsRow}>
            {meal.mealType && (
              <View style={styles.tagGray}>
                <Text style={styles.tagGrayText}>
                  {MEAL_TYPE_LABELS[meal.mealType]}
                </Text>
              </View>
            )}
            {emotionData && (
              <View style={styles.tagGreen}>
                <Text style={styles.tagGreenText}>{emotionData.label}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Participants Section */}
        {(meal.participants && meal.participants.length > 0) && (
          <View style={styles.metaSection}>
            <View style={styles.metaRow}>
              <Ionicons name="people-outline" size={20} color="#666" />
              <View style={styles.participantsContainer}>
                {meal.participants.map((participant, index) => (
                  <View key={index} style={styles.participantItem}>
                    <View
                      style={[
                        styles.participantBadge,
                        { backgroundColor: index === 0 ? '#FFB515' : '#00C0E8' },
                      ]}
                    >
                      <Text style={styles.participantEmoji}>
                        {index === 0 ? '뇸' : '🐶'}
                      </Text>
                    </View>
                    <Text style={styles.participantName}>{participant}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Location Section */}
        {meal.location && (
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={20} color="#666" />
            <Text style={styles.locationText}>{meal.location}</Text>
          </View>
        )}

        {/* Divider */}
        <View style={styles.divider} />

        {/* AI Analysis Chips */}
        <View style={styles.analysisSection}>
          <View style={styles.chipsRow}>
            <View style={styles.chipGray}>
              <Text style={styles.chipGrayText}>AI 식단 점수ㅣ{aiScore}</Text>
            </View>
            {emotionData && (
              <View style={styles.chipGray}>
                <Text style={styles.chipGrayText}>
                  해피 지수ㅣ{emotionData.level} / 5
                </Text>
              </View>
            )}
          </View>
          <View style={styles.chipsRow}>
            <View style={styles.chipGray}>
              <Text style={styles.chipGrayText}>
                {Math.round(meal.calories)}kcal
              </Text>
            </View>
            <View style={styles.chipGray}>
              <Text style={styles.chipGrayText}>
                탄수화물 {Math.round(meal.macros.carbs)}g
              </Text>
            </View>
            <View style={styles.chipGray}>
              <Text style={styles.chipGrayText}>
                단백질 {Math.round(meal.macros.protein)}g
              </Text>
            </View>
            <View style={styles.chipGray}>
              <Text style={styles.chipGrayText}>
                지방 {Math.round(meal.macros.fat)}g
              </Text>
            </View>
          </View>
        </View>

        {/* Progress Bars */}
        <View style={styles.progressSection}>
          <ProgressBar label="칼로리" percent={caloriePercent} />
          <ProgressBar label="탄수화물" percent={carbsPercent} />
          <ProgressBar label="단백질" percent={proteinPercent} />
          <ProgressBar label="지방" percent={fatPercent} />
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* AI Feedback */}
        <View style={styles.feedbackSection}>
          <Text style={styles.feedbackTitle}>AI 피드백</Text>
          <View style={styles.feedbackBox}>
            <Text style={styles.feedbackText}>
              {meal.advice || '생성된 AI 피드백'}
            </Text>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

// Progress Bar Component
function ProgressBar({ label, percent }: { label: string; percent: number }) {
  return (
    <View style={styles.progressItem}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={styles.progressPercent}>{percent}%</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${percent}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  headerIcons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  completeText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(0, 0, 0, 0.8)',
  },
  feedbackLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(0, 0, 0, 0.8)',
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    marginBottom: 20,
  },
  foodImage: {
    width: '100%',
    height: 320,
    borderRadius: 8,
  },
  imagePlaceholder: {
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodInfoSection: {
    gap: 8,
    marginBottom: 16,
  },
  foodName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
  },
  dateTime: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000',
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  tagGray: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 16,
  },
  tagGrayText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
  },
  tagGreen: {
    backgroundColor: '#88DC00',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 16,
  },
  tagGreenText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
  },
  metaSection: {
    gap: 8,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  participantsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  participantBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  participantEmoji: {
    fontSize: 11,
    color: '#fff',
  },
  participantName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
  },
  locationText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 16,
  },
  analysisSection: {
    gap: 8,
    marginBottom: 16,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipGray: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 16,
  },
  chipGrayText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
  },
  progressSection: {
    gap: 16,
  },
  progressItem: {
    gap: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: '#000',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '400',
    color: '#000',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#88DC00',
    borderRadius: 5,
  },
  feedbackSection: {
    gap: 8,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  feedbackBox: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    paddingVertical: 14,
    minHeight: 110,
  },
  feedbackText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000',
    lineHeight: 20,
  },
});