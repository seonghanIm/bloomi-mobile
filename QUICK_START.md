# ⚡ BLOOMI 테스트 배포 - 빠른 시작

> 최소한의 명령어로 iOS + Android 테스트 배포하기

---

## 🎯 **목표: 1시간 내 테스트 배포 완료**

```
사전 준비 (완료 가정)
  ↓
EAS 설정 (10분)
  ↓
빌드 시작 (5분)
  ↓
빌드 대기 (30분) ← 커피 타임 ☕
  ↓
테스터 초대 (10분)
  ↓
✅ 완료!
```

---

## ✅ **사전 준비 확인**

- [ ] Apple Developer 계정 승인됨 ($99 결제 완료)
- [ ] Google Play Console 계정 승인됨 ($25 결제 완료)
- [ ] 백엔드 API 서버 URL 알고 있음
- [ ] 테스터 이메일 리스트 준비됨

---

## 🚀 **명령어 실행 (순서대로)**

### 1. EAS CLI 설치 및 로그인

```bash
# bloomi-mobile로 이동
cd /Users/athometrip/Documents/workspace/bloomi-mobile

# EAS CLI 설치
npm install -g eas-cli

# Expo 로그인
eas login
```

---

### 2. 프로젝트 초기화

```bash
# EAS 프로젝트 ID 생성
eas init
```

**선택지**: "Create a new project" 선택

---

### 3. 백엔드 URL 설정

```bash
# 방법 1: eas.json 직접 수정
code eas.json

# "API_URL": "https://your-actual-server.com" 으로 변경
```

**또는**

```bash
# 방법 2: 시크릿으로 저장 (더 안전)
eas secret:create --scope project --name API_URL --value https://your-backend-server.com --type string
```

---

### 4. 빌드 시작! 🚀

```bash
# iOS + Android 동시 빌드
npm run build:preview:all
```

**예상 소요 시간**: 20-30분

이제 커피 한 잔 하세요! ☕

---

### 5. 빌드 상태 확인 (선택)

```bash
# 빌드 목록 보기
eas build:list

# 브라우저로도 확인 가능
# https://expo.dev/accounts/[your-account]/projects/bloomi-mobile/builds
```

---

## 📱 **iOS TestFlight 설정**

빌드 완료 후:

### 1. App Store Connect 접속

https://appstoreconnect.apple.com

### 2. 앱 만들기

- "나의 앱" → "+" → "새로운 앱"
- 이름: BLOOMI
- Bundle ID: `com.bloomi.app` 선택
- SKU: `bloomi-test-1`

### 3. TestFlight 테스터 초대

- "TestFlight" 탭
- "내부 테스트" → "기본 내부 그룹"
- 테스터 이메일 추가
- 빌드 선택

---

## 🤖 **Android Internal Testing 설정**

### 1. Service Account 키 생성 (첫 배포만)

**Play Console** → **설정** → **API 액세스** → **서비스 계정 만들기**

Google Cloud에서:
- 서비스 계정 생성: `bloomi-eas-deploy`
- JSON 키 다운로드
- 파일을 프로젝트 루트에 저장:

```bash
mv ~/Downloads/[키파일].json ./pc-api-key.json
```

### 2. Play Console에서 앱 만들기

https://play.google.com/console

- "앱 만들기"
- 이름: BLOOMI
- 언어: 한국어

### 3. Internal Testing 업로드

```bash
# APK를 Internal Testing 트랙에 제출
eas submit --platform android --profile preview
```

### 4. 테스터 초대

- Play Console → "테스트" → "Internal testing"
- "테스터" 탭 → 이메일 목록 만들기
- opt-in URL 복사 → 테스터들에게 전송

---

## 📧 **테스터에게 보낼 메시지 템플릿**

### iOS (TestFlight)

```
안녕하세요!

BLOOMI 앱 테스트에 초대합니다.

📱 설치 방법:
1. iPhone에서 TestFlight 앱 설치
   https://apps.apple.com/app/testflight/id899247664

2. 이메일로 받은 초대장에서 "View in TestFlight" 클릭

3. "Accept" → "Install"

4. 테스트 시작!

기간: 1주일
피드백 방법: 앱 내에서 휴대폰 흔들기 → 피드백 전송

감사합니다!
```

### Android (Internal Testing)

```
안녕하세요!

BLOOMI 앱 테스트에 초대합니다.

📱 설치 방법:
1. 아래 링크를 Android 폰에서 클릭
   [opt-in URL]

2. "테스터 되기" 클릭

3. Play Store에서 "설치"

4. 테스트 시작!

기간: 1주일
피드백 방법: [Google Form 링크]

감사합니다!
```

---

## 🐛 **버그 수정 후 재배포**

### 1. 버전 업데이트

```json
// app.json
{
  "expo": {
    "version": "1.0.1",
    "ios": { "buildNumber": "2" },
    "android": { "versionCode": 2 }
  }
}
```

### 2. 재빌드

```bash
npm run build:preview:all
```

테스터들에게 자동으로 업데이트 알림 전송됨!

---

## ⏱️ **타임라인**

| 단계 | 소요 시간 | 누적 시간 |
|------|-----------|-----------|
| EAS 설치 및 로그인 | 5분 | 5분 |
| 프로젝트 초기화 | 2분 | 7분 |
| 백엔드 URL 설정 | 3분 | 10분 |
| 빌드 시작 | 2분 | 12분 |
| **빌드 대기** ☕ | **20-30분** | **40분** |
| TestFlight 설정 | 10분 | 50분 |
| Internal Testing 설정 | 10분 | 60분 |
| **총 소요 시간** | - | **약 1시간** |

---

## 🎉 **완료!**

이제 테스터들이 앱을 설치하고 테스트할 수 있습니다.

### 다음 단계

- ⏳ 1주일 동안 피드백 수집
- 🐛 버그 수정 및 개선
- ✅ 테스트 완료 후 정식 배포 (`DEPLOYMENT.md` 참고)

---

## 🆘 **문제 발생 시**

### 빌드 실패

```bash
# 로그 확인
eas build:view [BUILD_ID]

# 캐시 삭제 후 재시도
eas build --platform all --profile preview --clear-cache
```

### 자세한 가이드

- **상세 가이드**: `TEST_DEPLOYMENT.md` 참고
- **스토어 배포**: `DEPLOYMENT.md` 참고
- **체크리스트**: `DEPLOYMENT_CHECKLIST.md` 참고

---

**지금 바로 시작하세요!** ⚡

```bash
cd /Users/athometrip/Documents/workspace/bloomi-mobile
eas login
eas init
npm run build:preview:all
```