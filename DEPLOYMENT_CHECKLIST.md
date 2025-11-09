# 🚀 BLOOMI 배포 체크리스트

> 빠르게 참고할 수 있는 단계별 체크리스트

---

## 📱 1단계: 개발자 계정 준비 (1-2일)

- [ ] **Apple Developer** 가입 및 승인 ($99/년)
  - https://developer.apple.com/programs/
- [ ] **Google Play Console** 가입 및 승인 ($25)
  - https://play.google.com/console/signup
- [ ] 두 계정 모두 승인 완료 확인

---

## 🔧 2단계: 초기 설정 (30분)

```bash
# bloomi-mobile 디렉토리로 이동
cd /Users/athometrip/Documents/workspace/bloomi-mobile

# EAS CLI 설치
npm install -g eas-cli

# Expo 로그인
eas login

# EAS 프로젝트 초기화
eas init
```

- [ ] EAS CLI 설치 완료
- [ ] Expo 로그인 완료
- [ ] `eas init` 실행 완료
- [ ] `app.json`에 프로젝트 ID 자동 추가 확인

---

## 🌐 3단계: 환경 변수 설정

### 방법 1: eas.json 직접 수정

```bash
# eas.json 파일 열기
code eas.json

# "API_URL" 값을 실제 백엔드 서버로 변경
# "https://your-actual-backend-server.com"
```

- [ ] `eas.json`의 `preview` 프로필 API_URL 수정
- [ ] `eas.json`의 `production` 프로필 API_URL 수정

### 방법 2: EAS Secret 사용 (더 안전, 권장)

```bash
# 시크릿으로 API URL 저장
eas secret:create --scope project --name API_URL --value https://your-backend-server.com --type string
```

- [ ] EAS Secret으로 API_URL 설정 완료

---

## 🧪 4단계: 테스트 배포 (1주일)

### iOS TestFlight

```bash
# iOS 테스트 빌드
npm run build:preview:ios
```

- [ ] iOS 빌드 성공 (15-30분 소요)
- [ ] App Store Connect 접속
  - https://appstoreconnect.apple.com
- [ ] "나의 앱" → TestFlight 탭
- [ ] 빌드 처리 완료 대기 (5-10분)
- [ ] "내부 테스트" 그룹 생성
- [ ] 테스터 이메일 추가
- [ ] 테스터에게 초대 이메일 전송
- [ ] 테스터들 TestFlight 앱 설치 및 테스트 시작

---

### Android Internal Testing

```bash
# Android 테스트 빌드
npm run build:preview:android
```

#### Google Play Service Account 설정 (첫 배포만)

- [ ] Play Console → 설정 → API 액세스
- [ ] "서비스 계정 만들기" 클릭
- [ ] Google Cloud Platform에서 서비스 계정 생성
- [ ] JSON 키 다운로드
- [ ] 키 파일을 `pc-api-key.json`으로 저장
  ```bash
  mv ~/Downloads/[KEY_FILE].json ./pc-api-key.json
  ```

#### 빌드 제출

```bash
# Internal Testing 트랙에 업로드
eas submit --platform android --profile preview
```

- [ ] Android 빌드 성공 (15-30분 소요)
- [ ] Play Console → 테스트 → Internal testing
- [ ] "테스터" 탭 → 목록 만들기
- [ ] 테스터 이메일 추가
- [ ] "출시 시작" 클릭
- [ ] opt-in URL 복사하여 테스터들에게 전송
- [ ] 테스터들 앱 설치 및 테스트 시작

---

### ⏳ 1주일 테스트 기간

- [ ] 테스터 피드백 수집
- [ ] 버그 수정
- [ ] 필요시 새로운 테스트 빌드 배포
- [ ] 테스트 완료 확인

---

## 📝 5단계: 스토어 메타데이터 준비

### 개인정보 처리방침 (필수!)

- [ ] 개인정보 처리방침 작성
  - 자동 생성: https://www.privacypolicies.com/
  - 또는 직접 작성
- [ ] 퍼블릭 URL에 호스팅
  - GitHub Pages / Notion / 자체 웹사이트
- [ ] URL 저장: `___________________________`

### 앱 설명 준비

- [ ] 짧은 설명 (80자) 작성
- [ ] 자세한 설명 (500-4000자) 작성
- [ ] 키워드 선정 (iOS: 100자, 쉼표 구분)

### 그래픽 자산 준비

- [ ] 앱 아이콘
  - iOS: 1024x1024 PNG (투명 배경 불가)
  - Android: 512x512 PNG
- [ ] 스크린샷 촬영 (4-8개 권장)
  - iOS: 6.7" (1290 x 2796)
  - Android: 다양한 해상도
- [ ] Android 주요 그래픽: 1024 x 500 PNG

---

## 🎯 6단계: 프로덕션 배포

### iOS App Store

```bash
# iOS 프로덕션 빌드
npm run build:production:ios
```

#### App Store Connect 설정

- [ ] https://appstoreconnect.apple.com 접속
- [ ] "나의 앱" → "+" → "새로운 앱"
- [ ] 앱 정보 입력
  - 이름: BLOOMI
  - Bundle ID: `com.bloomi.app`
  - SKU: `bloomi-app-1`
- [ ] 개인정보 보호 정책 URL 입력
- [ ] 스크린샷 업로드
- [ ] 앱 설명 입력
- [ ] 키워드 입력
- [ ] 지원 URL 입력
- [ ] 연령 등급 선택
- [ ] 빌드 선택
- [ ] "심사를 위해 제출" 클릭
- [ ] 심사 대기 (1-3일)

---

### Android Play Store

```bash
# Android 프로덕션 빌드
npm run build:production:android

# Play Store에 제출
npm run submit:android
```

#### Play Console 설정

- [ ] https://play.google.com/console 접속
- [ ] "앱 만들기"
  - 앱 이름: BLOOMI
  - 기본 언어: 한국어
- [ ] 스토어 등록정보 입력
  - 간단한 설명 (80자)
  - 자세한 설명
- [ ] 그래픽 자산 업로드
  - 아이콘 (512x512)
  - 주요 그래픽 (1024x500)
  - 스크린샷
- [ ] 앱 카테고리: 건강/운동
- [ ] 개인정보처리방침 URL 입력
- [ ] 앱 콘텐츠 설문조사 완료
  - 개인정보 보호
  - 광고 (현재: 아니요)
  - 콘텐츠 등급
  - 타겟층 (만 13세 이상)
- [ ] 프로덕션 출시 만들기
- [ ] 출시 노트 입력
- [ ] "검토 시작" 클릭
- [ ] 심사 대기 (1-3일)

---

## ✅ 7단계: 출시 완료

### iOS
- [ ] 심사 승인 알림 수신
- [ ] "출시" 버튼 클릭
- [ ] App Store에서 검색 확인

### Android
- [ ] 심사 승인 알림 수신
- [ ] Play Store에서 검색 확인

---

## 🎉 완료!

### 다음 단계

- [ ] 앱 모니터링 (크래시, 리뷰)
- [ ] 사용자 피드백 수집
- [ ] 2차 업데이트 계획 (광고 시스템)

---

## 📞 문제 발생 시

### 빌드 실패
```bash
# 빌드 목록 확인
eas build:list

# 특정 빌드 로그 보기
eas build:view [BUILD_ID]
```

### 심사 거부
- 거부 사유 확인
- 수정 후 다시 제출

### 도움말
- Expo Docs: https://docs.expo.dev/eas/
- Expo Forum: https://forums.expo.dev/
- DEPLOYMENT.md 문서 참고

---

## 📌 주요 명령어 요약

```bash
# 테스트 빌드
npm run build:preview:ios
npm run build:preview:android
npm run build:preview:all

# 프로덕션 빌드
npm run build:production:ios
npm run build:production:android
npm run build:production:all

# 제출
npm run submit:ios
npm run submit:android
```