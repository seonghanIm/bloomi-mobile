# 배포 가이드

## 로컬 실행

### 의존성 설치
```bash
npm install
```

### Expo Go로 실행 (가장 빠름)
```bash
npx expo start --go
```
- `i` : iOS 시뮬레이터
- `a` : Android 에뮬레이터
- QR 코드 스캔: 실제 기기에서 Expo Go 앱으로 스캔

### 네이티브 빌드 실행
```bash
# iOS 시뮬레이터
npx expo run:ios

# Android 에뮬레이터
npx expo run:android
```

### 개발 빌드 (Development Client)
```bash
# 개발 빌드 생성
eas build --platform ios --profile development

# 빌드 설치 후 실행
npx expo start --dev-client
```

---

## iOS (TestFlight / App Store)

### 1. 빌드 번호 증가
`app.json`에서 `ios.buildNumber` 증가

### 2. Production 빌드
```bash
eas build --platform ios --profile production
```

### 3. TestFlight 제출
```bash
eas submit --platform ios --latest
```

---

## Android (Play Store)

### 1. 버전 코드 증가
`app.json`에서 `android.versionCode` 증가

### 2. Production 빌드
```bash
eas build --platform android --profile production
```

### 3. Play Store 제출
```bash
eas submit --platform android --latest
```

---

## 테스트용 빌드 (Preview)

```bash
# iOS (내부 배포용)
eas build --platform ios --profile preview

# Android (APK)
eas build --platform android --profile preview
```

---

## 현재 버전 정보
- 앱 버전: `version` in app.json
- iOS 빌드: `ios.buildNumber`
- Android 빌드: `android.versionCode`