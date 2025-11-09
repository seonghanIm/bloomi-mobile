# 🧪 BLOOMI 테스트 배포 가이드 (TestFlight + Internal Testing)

> **목표**: 스토어 출시 전에 iOS TestFlight와 Android Internal Testing으로 1주일 테스트하기

---

## 📋 **빠른 체크리스트**

### 사전 준비 (1-2일)
- [ ] Apple Developer 계정 가입 및 승인 ($99/년)
- [ ] Google Play Console 계정 가입 및 승인 ($25)
- [ ] 백엔드 API 서버 URL 확인 (예: `https://api.bloomi.com`)

### 테스트 배포 (1시간)
- [ ] EAS CLI 설치 및 로그인
- [ ] `eas init` 실행 (프로젝트 ID 생성)
- [ ] `eas.json`에 백엔드 URL 설정
- [ ] iOS TestFlight 빌드 업로드
- [ ] Android Internal Testing 빌드 업로드

### 테스터 초대 (30분)
- [ ] TestFlight 테스터 이메일 추가
- [ ] Internal Testing 테스터 이메일 추가
- [ ] 초대 링크 전송

### 1주일 테스트
- [ ] 테스터 피드백 수집
- [ ] 버그 수정
- [ ] 필요시 새 빌드 배포

---

## 🚀 **Step 1: 개발자 계정 준비**

### iOS - Apple Developer Program

1. **가입**: https://developer.apple.com/programs/
   - Apple ID로 로그인
   - "Enroll" 클릭
   - **$99/년** 결제
   - 승인 대기 (24-48시간)

2. **승인 확인**
   ```
   이메일로 "Welcome to Apple Developer Program" 수신
   ```

3. **App Store Connect 접속 확인**
   - https://appstoreconnect.apple.com
   - 로그인 가능하면 준비 완료!

---

### Android - Google Play Console

1. **가입**: https://play.google.com/console/signup
   - Google 계정으로 로그인
   - 개발자 정보 입력
   - **$25** 결제 (1회, 평생)
   - 신원 확인 (최대 48시간)

2. **승인 확인**
   ```
   이메일로 "Google Play Console 액세스 권한 부여됨" 수신
   ```

3. **Play Console 접속 확인**
   - https://play.google.com/console
   - "모든 앱" 페이지 보이면 준비 완료!

---

## ⚙️ **Step 2: EAS 초기 설정**

### 2-1. EAS CLI 설치

```bash
# bloomi-mobile 디렉토리로 이동
cd /Users/athometrip/Documents/workspace/bloomi-mobile

# EAS CLI 전역 설치
npm install -g eas-cli

# 설치 확인
eas --version
```

### 2-2. Expo 로그인

```bash
# Expo 계정으로 로그인 (없으면 가입)
eas login

# 로그인 확인
eas whoami
```

### 2-3. EAS 프로젝트 초기화

```bash
# 프로젝트 ID 생성 (자동으로 app.json 업데이트)
eas init

# 실행 후 선택지:
# "Create a new project" 선택
```

**결과:**
- `app.json`의 `extra.eas.projectId`에 자동으로 ID가 추가됨
- 예: `"projectId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"`

---

## 🌐 **Step 3: 백엔드 API URL 설정**

### 옵션 1: eas.json 직접 수정 (간단)

```bash
# eas.json 파일 열기
code eas.json
```

아래 부분을 **실제 백엔드 서버 URL**로 변경:

```json
{
  "build": {
    "preview": {
      "env": {
        "API_URL": "https://your-actual-server.com"  // 👈 여기 수정!
      }
    }
  }
}
```

### 옵션 2: EAS Secret 사용 (더 안전)

```bash
# 시크릿으로 저장
eas secret:create --scope project --name API_URL --value https://your-backend-server.com --type string

# 확인
eas secret:list
```

이 방법을 사용하면 `eas.json`에서 `"API_URL"` 라인 삭제해도 됨.

---

## 📱 **Step 4: iOS TestFlight 테스트 배포**

### 4-1. iOS 빌드 생성

```bash
# iOS 테스트 빌드 (preview 프로필)
npm run build:preview:ios

# 또는 직접 명령어
eas build --platform ios --profile preview
```

**예상 소요 시간**: 15-30분

**진행 상황 확인**:
```bash
# 브라우저로 빌드 진행 상황 보기
eas build:list
```

### 4-2. App Store Connect 설정

빌드가 완료되면 자동으로 App Store Connect에 업로드됩니다.

1. **App Store Connect 접속**
   - https://appstoreconnect.apple.com

2. **"나의 앱" → "+" → "새로운 앱"**
   - 플랫폼: iOS
   - 이름: **BLOOMI** (임시, 나중에 변경 가능)
   - 기본 언어: 한국어
   - Bundle ID: `com.bloomi.app` (자동으로 나타남)
   - SKU: `bloomi-test-1` (임의로 입력)
   - 사용자 액세스: 전체 액세스

3. **"TestFlight" 탭으로 이동**

4. **빌드 처리 대기**
   - "처리 중..." → "테스트 준비 완료" (5-10분 소요)

### 4-3. TestFlight 테스터 초대

1. **"TestFlight" → "내부 테스트" → "기본 내부 그룹"**
   - 또는 "+ 그룹 추가" (예: "BLOOMI 테스터")

2. **테스터 추가**
   - "+" 버튼 클릭
   - 이메일 주소 입력 (쉼표로 구분)
   - 최대 100명까지 무료

3. **빌드 선택**
   - 처리 완료된 빌드를 그룹에 추가

4. **초대 전송**
   - 테스터들에게 자동으로 초대 이메일 발송됨

### 4-4. 테스터 설치 방법 안내

테스터들에게 아래 내용 전달:

```
📧 초대 이메일 제목: "BLOOMI을(를) 테스트하도록 초대되었습니다"

1. iPhone에서 TestFlight 앱 설치
   App Store: https://apps.apple.com/app/testflight/id899247664

2. 이메일의 "View in TestFlight" 클릭

3. "Accept" 클릭

4. "Install" 버튼으로 BLOOMI 설치

5. 테스트 시작!
```

---

## 🤖 **Step 5: Android Internal Testing 배포**

### 5-1. Google Play Console 앱 만들기

1. **Play Console 접속**
   - https://play.google.com/console

2. **"모든 앱" → "앱 만들기"**
   - 앱 이름: **BLOOMI**
   - 기본 언어: 한국어 (대한민국)
   - 앱 또는 게임: 앱
   - 무료 또는 유료: 무료
   - 선언 체크박스 모두 체크
   - "앱 만들기" 클릭

### 5-2. Service Account 키 생성 (첫 배포만)

**중요**: Android 빌드 제출에 필요한 인증 키입니다.

1. **Play Console → 설정 (왼쪽 하단) → API 액세스**

2. **"Google Cloud Platform 프로젝트 연결"**
   - 자동으로 프로젝트 생성됨

3. **"서비스 계정 만들기"**
   - "Google Cloud Platform으로 이동" 클릭

4. **Google Cloud Console에서:**
   - "서비스 계정" 메뉴
   - "+ 서비스 계정 만들기"
   - 이름: `bloomi-eas-deploy`
   - 역할: **Service Account User**
   - "완료" 클릭

5. **JSON 키 다운로드**
   - 생성된 서비스 계정 클릭
   - "키" 탭 → "키 추가" → "새 키 만들기"
   - JSON 선택 → "만들기"
   - 파일 자동 다운로드

6. **키 파일을 프로젝트 루트에 저장**
   ```bash
   # 다운로드 폴더에서 이동
   mv ~/Downloads/[다운로드된-키-파일].json /Users/athometrip/Documents/workspace/bloomi-mobile/pc-api-key.json
   ```

7. **Play Console로 돌아가서 권한 부여**
   - "서비스 계정" 목록에서 방금 만든 계정 찾기
   - "액세스 권한 부여" 클릭
   - "관리" → "앱 권한" 탭
   - "앱 추가" → BLOOMI 선택
   - "변경사항 적용" → "초대 보내기"

### 5-3. Android 빌드 생성

```bash
# Android 테스트 빌드 (APK)
npm run build:preview:android

# 또는 직접 명령어
eas build --platform android --profile preview
```

**예상 소요 시간**: 15-30분

**빌드 타입**: APK (테스트용, 빠른 설치)

### 5-4. Internal Testing 트랙에 업로드

빌드 완료 후:

```bash
# EAS Submit으로 자동 업로드
eas submit --platform android --profile preview
```

**실행 후 선택지:**
- Service Account Key 경로: `./pc-api-key.json` 입력
- 트랙: `internal` (자동 선택됨)

### 5-5. Internal Testing 테스터 초대

1. **Play Console → "테스트" → "Internal testing"**

2. **"새 출시 만들기"** (첫 배포 시)
   - 업로드된 APK 자동 선택됨
   - 출시 이름: `1.0.0 - 테스트`
   - "출시 검토" → "출시 시작"

3. **"테스터" 탭 → "이메일 목록 만들기"**
   - 목록 이름: "BLOOMI 테스터"
   - 이메일 주소 추가 (쉼표로 구분, 최대 100명)
   - "변경사항 저장"

4. **"테스터가 되는 방법" 섹션에서 opt-in URL 복사**
   ```
   예: https://play.google.com/apps/internaltest/1234567890123456789
   ```

### 5-6. 테스터 설치 방법 안내

테스터들에게 아래 내용 전달:

```
📧 opt-in URL: https://play.google.com/apps/internaltest/...

1. Android 휴대폰에서 위 링크 클릭

2. "테스터 되기" 버튼 클릭

3. Google Play Store로 자동 이동

4. "설치" 버튼으로 BLOOMI 설치

5. 테스트 시작!
```

---

## 🎯 **Step 6: 양쪽 동시 빌드 (시간 절약!)**

iOS와 Android를 동시에 빌드하려면:

```bash
# 한 번에 양쪽 빌드
npm run build:preview:all

# 또는
eas build --platform all --profile preview
```

**장점:**
- ✅ 시간 절약 (병렬 처리)
- ✅ 한 번에 끝냄

**소요 시간**: 약 20-30분 (동시 진행)

---

## 📊 **Step 7: 테스트 진행 (1주일)**

### 테스터 가이드라인

테스터들에게 요청할 사항:

```markdown
# BLOOMI 테스트 가이드

## 테스트 항목

### 필수 테스트
- [ ] 로그인 (Google OAuth)
- [ ] 음식 사진 촬영
- [ ] 갤러리에서 사진 선택
- [ ] 칼로리 분석 결과 확인
- [ ] 통계 화면 확인
- [ ] 캘린더 기능 확인

### 다양한 음식 테스트
- [ ] 한식 (김치찌개, 비빔밥 등)
- [ ] 양식 (파스타, 피자 등)
- [ ] 중식 (짜장면, 짬뽕 등)
- [ ] 일식 (초밥, 라멘 등)
- [ ] 간식 (과자, 음료 등)

### 버그 리포트
문제 발생 시 다음 정보 포함:
- 어떤 동작을 했을 때 발생?
- 스크린샷
- 재현 가능한가?
- 기기 모델 (예: iPhone 15, Galaxy S23)
```

### 피드백 수집 방법

#### iOS (TestFlight 내장 기능)
- 테스터가 앱에서 휴대폰 흔들기 → 피드백 전송

#### Android (Google Form 권장)
```
Google Form 생성:
- 문제 설명
- 스크린샷 업로드
- 기기 정보
```

---

## 🔄 **Step 8: 버그 수정 및 재배포**

테스트 중 버그 발견 시:

### 1. 코드 수정

```bash
# 코드 수정 후
cd /Users/athometrip/Documents/workspace/bloomi-mobile
```

### 2. 버전 업데이트

```json
// app.json
{
  "expo": {
    "version": "1.0.1",  // 👈 버전 올리기
    "ios": {
      "buildNumber": "2"  // 👈 빌드 번호 올리기
    },
    "android": {
      "versionCode": 2  // 👈 버전 코드 올리기
    }
  }
}
```

### 3. 재빌드 및 재배포

```bash
# 다시 빌드
npm run build:preview:all

# iOS는 자동으로 TestFlight 업데이트
# Android는 다시 제출
eas submit --platform android --profile preview
```

**테스터들에게 자동으로 업데이트 알림 전송됨!**

---

## ✅ **완료 체크리스트**

### 배포 완료
- [ ] iOS TestFlight 빌드 업로드 완료
- [ ] Android Internal Testing 빌드 업로드 완료
- [ ] TestFlight 테스터 초대 완료 (이메일 확인)
- [ ] Internal Testing opt-in URL 전송 완료

### 테스트 진행 중
- [ ] 최소 10명 이상 테스터 확보
- [ ] 다양한 기기에서 테스트 (iPhone, Android)
- [ ] 피드백 수집 (버그, 개선사항)
- [ ] 필요시 업데이트 배포

### 1주일 후
- [ ] 주요 버그 모두 수정 완료
- [ ] 테스터 만족도 확인
- [ ] **프로덕션 배포 준비 완료** ✅

---

## 🆘 **문제 해결**

### "Apple ID not found"
- Apple Developer 계정 승인이 아직 안 됨
- 24-48시간 대기 필요

### "Invalid provisioning profile"
- `eas build:configure` 다시 실행
- `eas credentials` 확인

### "Service Account Key 오류"
- `pc-api-key.json` 경로 확인
- Play Console에서 권한 다시 부여

### 빌드 실패
```bash
# 로그 확인
eas build:list
eas build:view [BUILD_ID]

# 캐시 삭제 후 재시도
eas build --platform ios --profile preview --clear-cache
```

---

## 📞 **도움 받기**

- Expo Forum: https://forums.expo.dev/
- EAS Docs: https://docs.expo.dev/eas/
- Expo Discord: https://chat.expo.dev/

---

## 🎉 **테스트 완료 후**

1주일 테스트 완료 후:

1. **피드백 정리**
   - 주요 개선사항 리스트
   - 버그 수정 완료 확인

2. **프로덕션 빌드 준비**
   - `DEPLOYMENT.md` 가이드 참고
   - 스토어 메타데이터 준비
   - 개인정보 처리방침 작성

3. **정식 출시!** 🚀
   ```bash
   npm run build:production:all
   npm run submit:ios
   npm run submit:android
   ```

---

**지금 바로 시작하세요!** ⚡

```bash
cd /Users/athometrip/Documents/workspace/bloomi-mobile
eas login
eas init
npm run build:preview:all
```