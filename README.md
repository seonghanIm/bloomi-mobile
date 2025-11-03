# 🌸 BLOOMI Mobile

AI 기반 식단 분석 모바일 앱

## 📱 기술 스택

- React Native (Expo)
- TypeScript
- Axios (HTTP Client)
- React Navigation (라우팅)
- Expo Camera (카메라)
- Expo Image Picker (갤러리)

## 🚀 시작하기

### 필수 사항

- Node.js 18 이상
- npm 또는 yarn
- Expo Go 앱 (테스트용)

### 설치

```bash
# 의존성 설치
npm install

# iOS 시뮬레이터 실행
npm run ios

# Android 에뮬레이터 실행
npm run android

# Expo Go로 실행
npm start
```

### 환경 변수 설정

`.env` 파일을 확인하고 백엔드 API URL을 설정하세요:

```env
API_URL=http://localhost:8080
```

**주의:**
- iOS 시뮬레이터: `http://localhost:8080`
- Android 에뮬레이터: `http://10.0.2.2:8080`
- 실제 기기: `http://192.168.x.x:8080` (내 컴퓨터의 로컬 IP)

## 📁 프로젝트 구조

```
bloomi-mobile/
├── src/
│   ├── api/              # API 클라이언트 및 서비스
│   │   ├── client.ts     # Axios 인스턴스
│   │   └── mealApi.ts    # 식단 API
│   ├── components/       # 재사용 가능한 컴포넌트
│   ├── screens/          # 화면 컴포넌트
│   ├── navigation/       # React Navigation 설정
│   ├── types/            # TypeScript 타입 정의
│   │   └── api.ts        # API 응답 타입
│   ├── utils/            # 유틸리티 함수
│   └── constants/        # 상수 및 설정
│       └── config.ts     # 환경 설정
├── assets/               # 이미지, 폰트 등
├── App.tsx               # 앱 진입점
└── .env                  # 환경 변수
```

## 🔗 백엔드 API

백엔드 프로젝트: `../bloomi` (Spring Boot)

### 주요 API 엔드포인트

- `POST /api/v1/meal/analyze` - 식단 이미지 분석
- `GET /api/v1/meal/{date}` - 날짜별 식단 조회
- `GET /api/v1/meal/monthly/{yearMonth}` - 월별 통계

## 📝 구현 현황

### 완료 ✅
1. [x] 로그인 화면 (Google OAuth - 백엔드 연동 방식)
2. [x] 홈 화면 (대시보드 기본)
3. [x] 인증 시스템 (AuthContext, AsyncStorage)
4. [x] API 클라이언트 (Axios, JWT 자동 추가)

### 다음 단계 📋
1. [ ] 백엔드 OAuth 성공 핸들러 수정 (모바일 deep link 지원)
2. [ ] 네비게이션 설정 (Tab Navigator)
3. [ ] 카메라/분석 화면
4. [ ] 캘린더 화면
5. [ ] 프로필 화면

### 로그인 설정
[AUTH_SETUP.md](./AUTH_SETUP.md) 참고

## 🔧 개발 팁

### Expo Go로 테스트하기

1. 앱스토어/플레이스토어에서 "Expo Go" 다운로드
2. `npm start` 실행
3. QR 코드 스캔

### 디버깅

```bash
# 로그 확인
npx react-native log-ios
npx react-native log-android
```

## 📚 참고 자료

- [Expo 공식 문서](https://docs.expo.dev/)
- [React Native 공식 문서](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)