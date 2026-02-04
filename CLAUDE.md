# BLOOMI Mobile — Frontend Development Guide

> React Native (Expo) 기반 모바일 앱 개발 가이드

---

## 1. 프로젝트 개요

* **프로젝트명**: BLOOMI Mobile
* **기술 스택**: React Native + Expo + TypeScript
* **주요 기능**: 식단 사진 분석, 칼로리 추적, 월별 통계, 캘린더 뷰
* **백엔드**: Java Spring Boot (별도 저장소)

---

## 2. 디렉토리 구조

```
src/
├── components/         # 재사용 가능한 컴포넌트
│   └── MealCard.tsx   # 식단 카드 컴포넌트
├── screens/           # 화면 컴포넌트
│   ├── LoginScreen.tsx
│   ├── HomeScreen.tsx
│   └── CalendarScreen.tsx
├── services/          # API 서비스
│   └── mealService.ts
├── contexts/          # React Context (상태 관리)
│   └── AuthContext.tsx
└── types/             # TypeScript 타입 정의
    └── meal.ts
```

---

## 3. 컴포넌트화 규칙 (Component Architecture)

### 3.1 컴포넌트화 기준

다음 조건을 **2개 이상** 만족하면 컴포넌트로 분리:

1. **재사용성**: 2개 이상의 화면/컴포넌트에서 사용
2. **중복 코드**: 동일하거나 유사한 UI/로직이 여러 곳에 존재
3. **독립성**: 명확한 책임과 props 인터페이스를 가질 수 있음
4. **복잡도**: 50줄 이상의 JSX 또는 복잡한 렌더링 로직
5. **테스트 가능성**: 독립적으로 테스트가 필요한 단위

### 3.2 컴포넌트 분리 예시

#### ✅ 컴포넌트로 분리해야 하는 경우

```tsx
// ❌ BAD: HomeScreen과 CalendarScreen에서 동일한 코드 중복
// HomeScreen.tsx
<View style={styles.mealCard}>
  <View style={styles.mealHeader}>
    <Text>{meal.name}</Text>
    <Text>{meal.calories} kcal</Text>
  </View>
  {/* ... 많은 코드 ... */}
</View>

// CalendarScreen.tsx
<View style={styles.mealCard}>
  <View style={styles.mealHeader}>
    <Text>{meal.name}</Text>
    <Text>{meal.calories} kcal</Text>
  </View>
  {/* ... 동일한 코드 ... */}
</View>

// ✅ GOOD: 컴포넌트로 분리
// components/MealCard.tsx
export default function MealCard({ meal }: { meal: MealAnalysis }) {
  return (
    <View style={styles.mealCard}>
      <View style={styles.mealHeader}>
        <Text>{meal.name}</Text>
        <Text>{meal.calories} kcal</Text>
      </View>
      {/* ... */}
    </View>
  );
}

// HomeScreen.tsx & CalendarScreen.tsx
<MealCard meal={meal} />
```

#### ❌ 컴포넌트로 분리하지 않아도 되는 경우

```tsx
// 한 곳에서만 사용되고 간단한 UI
<View style={styles.header}>
  <Text>안녕하세요</Text>
</View>
```

### 3.3 컴포넌트 네이밍 규칙

- **PascalCase** 사용: `MealCard`, `CalendarHeader`, `StatisticsSummary`
- **명확한 이름**: 컴포넌트의 역할이 이름에서 명확히 드러나야 함
- **접미사 규칙**:
  - `*Card`: 카드 형태의 컨테이너 (예: `MealCard`, `StatsCard`)
  - `*Button`: 버튼 컴포넌트 (예: `SubmitButton`, `IconButton`)
  - `*Modal`: 모달 컴포넌트 (예: `InputModal`, `ConfirmModal`)
  - `*List`: 리스트 컴포넌트 (예: `MealList`, `DateList`)

### 3.4 컴포넌트 파일 구조

```tsx
// components/MealCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MealAnalysis } from '../types/meal';

// 1. Props 인터페이스 정의
interface MealCardProps {
  meal: MealAnalysis;
  onPress?: () => void; // optional props
}

// 2. 컴포넌트 정의 (export default)
export default function MealCard({ meal, onPress }: MealCardProps) {
  return (
    <View style={styles.container}>
      {/* JSX */}
    </View>
  );
}

// 3. 스타일 정의 (컴포넌트 하단)
const styles = StyleSheet.create({
  container: {
    // ...
  },
});
```

### 3.5 스타일 일관성 규칙

컴포넌트를 분리할 때 **기준 화면의 스타일을 우선**으로 사용:

```tsx
// ✅ GOOD: 홈 화면 스타일을 기준으로 컴포넌트화
// MealCard는 HomeScreen의 스타일 사용
confidenceBadge: {
  backgroundColor: '#B49DF8', // 홈 화면의 보라색
  // NOT: '#E8F5E9' (캘린더 화면의 초록색)
}
```

**우선순위**:
1. 가장 먼저 개발된 화면의 스타일
2. 더 완성도 높은 디자인의 화면
3. 명시적으로 지정된 디자인 시스템

### 3.6 Props 설계 원칙

1. **최소한의 props**: 필요한 데이터만 전달
2. **명확한 타입**: TypeScript 인터페이스 사용
3. **선택적 props**: optional props는 `?` 사용
4. **콜백 함수**: `on*` 네이밍 (예: `onPress`, `onChange`)

```tsx
// ✅ GOOD
interface MealCardProps {
  meal: MealAnalysis;        // 필수
  onPress?: () => void;      // 선택
  showAdvice?: boolean;      // 선택
}

// ❌ BAD: 너무 많은 props
interface MealCardProps {
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  // ... 10개 이상의 props
}
```

---

## 4. 디자인 시스템

### 4.1 컬러 팔레트

```typescript
// 주요 색상
const Colors = {
  primary: '#30C58F',      // 메인 그린
  secondary: '#B49DF8',    // 보라색 (버튼, 배지)
  background: '#fff',      // 배경
  cardBackground: '#F9F9F9', // 카드 배경
  text: '#333',            // 기본 텍스트
  textSecondary: '#666',   // 보조 텍스트
  textLight: '#999',       // 연한 텍스트
  border: '#E0E0E0',       // 테두리
};
```

### 4.2 타이포그래피

```typescript
const Typography = {
  h1: { fontSize: 28, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 20, fontWeight: 'bold' },
  body: { fontSize: 16 },
  caption: { fontSize: 14 },
  small: { fontSize: 12 },
};
```

### 4.3 간격 (Spacing)

```typescript
const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};
```

---

## 5. API 연동 규칙

### 5.1 Service Layer 패턴

```typescript
// services/mealService.ts
export const analyzeMeal = async (data: AnalyzeMealRequest): Promise<MealAnalysis> => {
  const response = await api.post('/api/v1/meal/analyze', formData);
  return response.data.data;
};

// Screen에서 사용
const result = await analyzeMeal({ image, name, weight });
```

### 5.2 에러 처리

```typescript
try {
  const result = await analyzeMeal(data);
  // 성공 처리
} catch (error: any) {
  console.error('❌ Error:', error);
  Alert.alert('오류', error.response?.data?.message || '오류가 발생했습니다.');
}
```

---

## 6. 상태 관리

### 6.1 로컬 상태 (useState)

화면 내부에서만 사용하는 상태:

```typescript
const [meals, setMeals] = useState<MealAnalysis[]>([]);
const [isLoading, setIsLoading] = useState(false);
```

### 6.2 전역 상태 (Context API)

여러 화면에서 공유하는 상태:

```typescript
// contexts/AuthContext.tsx
export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  return useContext(AuthContext);
}
```

---

## 7. 개발 워크플로우

### 7.1 새 기능 개발 순서

1. **타입 정의** (types/)
2. **API 서비스** (services/)
3. **컴포넌트 분리** (중복 확인 → 컴포넌트화)
4. **화면 구현** (screens/)
5. **스타일 적용** (디자인 시스템 준수)

### 7.2 컴포넌트 리팩토링 체크리스트

- [ ] 2개 이상의 화면에서 동일/유사한 코드 사용?
- [ ] 50줄 이상의 복잡한 JSX?
- [ ] 명확한 Props 인터페이스 정의 가능?
- [ ] 독립적으로 재사용 가능?
- [ ] 스타일 일관성 유지됨?

---

## 8. 예제: MealCard 컴포넌트

### 8.1 구현

```typescript
// components/MealCard.tsx
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
          <Text style={styles.mealTitle}>{meal.name}</Text>
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
          <Text style={styles.macroValue}>{Math.round(meal.macros.carbs)}g</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroLabel}>단백질</Text>
          <Text style={styles.macroValue}>{Math.round(meal.macros.protein)}g</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroLabel}>지방</Text>
          <Text style={styles.macroValue}>{Math.round(meal.macros.fat)}g</Text>
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
    backgroundColor: '#B49DF8',  // HomeScreen 스타일 기준
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
```

### 8.2 사용 예시

```typescript
// HomeScreen.tsx
import MealCard from '../components/MealCard';

export default function HomeScreen() {
  const [meals, setMeals] = useState<MealAnalysis[]>([]);

  return (
    <View>
      {meals.map((meal, index) => (
        <MealCard key={index} meal={meal} />
      ))}
    </View>
  );
}
```

---

## 9. 기타 규칙

### 9.1 Import 순서

```typescript
// 1. React 관련
import React, { useState, useEffect } from 'react';

// 2. React Native 기본
import { View, Text, StyleSheet } from 'react-native';

// 3. 외부 라이브러리
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// 4. 내부 모듈
import { useAuth } from '../contexts/AuthContext';
import { MealAnalysis } from '../types/meal';
import MealCard from '../components/MealCard';
```

### 9.2 파일 네이밍

- **컴포넌트**: `PascalCase.tsx` (예: `MealCard.tsx`)
- **서비스/유틸**: `camelCase.ts` (예: `mealService.ts`)
- **타입**: `camelCase.ts` (예: `meal.ts`)

---

## 10. 체크리스트

새로운 기능을 추가할 때:

- [ ] 타입 정의 완료
- [ ] API 서비스 레이어 구현
- [ ] 재사용 가능한 부분 컴포넌트로 분리
- [ ] 디자인 시스템 색상/타이포 준수
- [ ] Props 인터페이스 명확히 정의
- [ ] 에러 처리 구현
- [ ] 로딩 상태 처리
- [ ] Console.log 제거 (배포 전)

---

## 11. Figma 디자인 구현 규칙 (Pixel-Perfect)

### 11.1 핵심 원칙

**피그마 디자인을 코드로 구현할 때는 반드시 픽셀 단위까지 정확하게 일치시켜야 합니다.**

- px 값, 간격, 폰트 크기, 색상 모두 피그마와 100% 동일하게
- "대충 비슷하게"가 아닌 "완벽하게 똑같이"
- 의심스러울 때는 `get_design_context` 도구로 정확한 값 확인

### 11.2 구현 프로세스

1. **피그마에서 디자인 컨텍스트 가져오기**
   ```
   mcp__figma__get_design_context 도구 사용
   ```

2. **스타일 값 정확히 추출**
   - padding, margin, gap 값
   - font-size, line-height, font-weight
   - border-radius
   - 색상 코드 (hex 그대로 사용)

3. **React Native StyleSheet로 변환**
   - Tailwind → StyleSheet 변환 시 값 유지
   - `gap-[32px]` → `gap: 32`
   - `p-[16px]` → `padding: 16`
   - `text-[16px]` → `fontSize: 16`
   - `leading-[20px]` → `lineHeight: 20`

### 11.3 색상 매핑

피그마 CSS 변수를 실제 색상 코드로 변환:

```typescript
const FigmaColors = {
  // Grays
  'grays/black': '#000000',
  'grays/white': '#FFFFFF',
  'grays/gray-4': '#D1D1D6',
  'grays/gray-5': '#E5E5EA',
  'grays/gray-6': '#F2F2F7',

  // Brand
  'purple-40': '#6E2FF4',
  'purple-light': '#E0D6EF',
  'green-primary': '#88DC00',
  'green-secondary': '#B3DC14',

  // Labels
  'labels-vibrant/primary': '#333333',
};
```

### 11.4 폰트 매핑

```typescript
const FigmaFonts = {
  'Pretendard:Regular': { fontWeight: '400' },
  'Pretendard:Medium': { fontWeight: '500' },
  'Pretendard:SemiBold': { fontWeight: '600' },
  'Pretendard:Bold': { fontWeight: '700' },
};
```

### 11.5 체크리스트

피그마 → 코드 변환 시 확인사항:

- [ ] padding 값 정확히 일치
- [ ] margin/gap 값 정확히 일치
- [ ] fontSize 정확히 일치
- [ ] lineHeight 정확히 일치
- [ ] fontWeight 정확히 일치
- [ ] 색상 코드 정확히 일치
- [ ] borderRadius 정확히 일치
- [ ] 컴포넌트 크기(width/height) 일치

### 11.6 예시: Tailwind → React Native 변환

**피그마 출력 (Tailwind)**:
```jsx
<div className="flex flex-col gap-[32px] p-[16px]">
  <p className="font-['Pretendard:SemiBold'] text-[16px] leading-[20px]">
    식단 기록
  </p>
</div>
```

**React Native 변환**:
```tsx
<View style={styles.container}>
  <Text style={styles.title}>식단 기록</Text>
</View>

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    gap: 32,          // gap-[32px]
    padding: 16,      // p-[16px]
  },
  title: {
    fontWeight: '600',   // SemiBold
    fontSize: 16,        // text-[16px]
    lineHeight: 20,      // leading-[20px]
    color: '#000000',
  },
});
```

---

**마지막 업데이트**: 2025-11-03