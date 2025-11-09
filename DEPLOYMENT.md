# 📱 BLOOMI 모바일 앱 배포 가이드

> React Native (Expo) 앱을 iOS App Store와 Android Play Store에 배포하는 전체 가이드

---

## 📋 목차

1. [사전 준비](#1-사전-준비)
2. [초기 설정](#2-초기-설정)
3. [테스트 배포 (1주일 테스트)](#3-테스트-배포-1주일-테스트)
4. [프로덕션 배포](#4-프로덕션-배포)
5. [문제 해결](#5-문제-해결)

---

## 1. 사전 준비

### ✅ 개발자 계정

#### iOS (필수)
- [ ] **Apple Developer Program** 가입
  - URL: https://developer.apple.com/programs/
  - 비용: $99/년
  - 승인 기간: 24-48시간

#### Android (필수)
- [ ] **Google Play Console** 가입
  - URL: https://play.google.com/console/signup
  - 비용: $25 (일회성)
  - 신원 확인: 최대 48시간

### ✅ 필수 도구 설치

```bash
# EAS CLI 설치 (전역)
npm install -g eas-cli

# Expo 계정 확인
eas whoami

# 로그인 (필요시)
eas login
```

### ✅ 백엔드 서버 준비

배포된 백엔드 API URL을 확인하세요:
```bash
# 예시
https://api.bloomi.com
https://your-server.com:8080
```

---

## 2. 초기 설정

### 2.1 EAS 프로젝트 연결

```bash
cd /Users/athometrip/Documents/workspace/bloomi-mobile

# EAS 프로젝트 ID 생성
eas init

# 생성된 프로젝트 ID를 app.json에 자동으로 추가됩니다
```

실행 후 `app.json`의 `extra.eas.projectId`가 실제 ID로 업데이트됩니다.

### 2.2 환경 변수 설정

#### 백엔드 API URL 설정 (중요!)

`eas.json` 파일을 열고 **YOUR 서버 URL**로 변경하세요:

```json
{
  "build": {
    "preview": {
      "env": {
        "API_URL": "https://your-actual-backend-server.com"  // 👈 여기 수정!
      }
    },
    "production": {
      "env": {
        "API_URL": "https://your-actual-backend-server.com"  // 👈 여기 수정!
      }
    }
  }
}
```

또는 EAS 시크릿으로 관리 (더 안전):

```bash
# 프로덕션 API URL을 시크릿으로 저장
eas secret:create --scope project --name API_URL --value https://your-backend-server.com --type string

# Google OAuth Client ID도 시크릿으로 저장 (선택)
eas secret:create --scope project --name GOOGLE_CLIENT_ID --value YOUR_GOOGLE_CLIENT_ID --type string
```

---

## 3. 테스트 배포 (1주일 테스트)

### 3.1 iOS 테스트 배포 (TestFlight)

#### 단계 1: Preview 빌드 생성

```bash
# iOS 테스트 빌드 (실제 디바이스용)
npm run build:preview:ios

# 또는 직접 명령어
eas build --platform ios --profile preview
```

**예상 소요 시간:** 15-30분

#### 단계 2: TestFlight에 업로드

빌드가 완료되면 자동으로 App Store Connect에 업로드됩니다.

#### 단계 3: App Store Connect 설정

1. https://appstoreconnect.apple.com 접속
2. "나의 앱" → "TestFlight" 탭
3. 빌드가 "처리 중" → "테스트 준비 완료"로 변경될 때까지 대기 (5-10분)
4. "내부 테스트" 그룹 생성
   - 그룹 이름: "BLOOMI 내부 테스터"
   - 테스터 이메일 추가 (최대 100명)
5. 빌드 선택 후 테스터에게 초대 전송

#### 단계 4: 테스터 초대

테스터들은:
1. 이메일로 초대장 수신
2. TestFlight 앱 설치 (App Store에서)
3. 초대 코드 입력
4. BLOOMI 앱 설치 및 테스트

---

### 3.2 Android 테스트 배포 (Internal Testing)

#### 단계 1: Preview 빌드 생성

```bash
# Android 테스트 빌드 (APK)
npm run build:preview:android

# 또는 직접 명령어
eas build --platform android --profile preview
```

**빌드 타입:** APK (내부 테스트용, 빠른 배포)
**예상 소요 시간:** 15-30분

#### 단계 2: Google Play Console 설정

1. https://play.google.com/console 접속
2. "앱 만들기" 클릭
   - 앱 이름: **BLOOMI**
   - 기본 언어: 한국어
   - 앱 또는 게임: 앱
   - 무료 또는 유료: 무료
3. "앱 만들기" 완료

#### 단계 3: Service Account 키 생성 (첫 배포 시 필수)

1. Play Console → **설정** → **API 액세스**
2. "서비스 계정 만들기" 클릭
3. Google Cloud Platform으로 이동
4. 서비스 계정 생성
   - 이름: `bloomi-eas-deploy`
   - 역할: **Service Account User**
5. JSON 키 다운로드
6. 다운로드한 키를 프로젝트 루트에 저장:
   ```bash
   mv ~/Downloads/[KEY_FILE].json /Users/athometrip/Documents/workspace/bloomi-mobile/pc-api-key.json
   ```

7. `.gitignore`에 추가 (중요!):
   ```bash
   echo "pc-api-key.json" >> .gitignore
   ```

#### 단계 4: Internal Testing 트랙에 업로드

```bash
# Android Internal Testing 제출
eas submit --platform android --profile preview
```

자동으로 `internal` 트랙에 업로드됩니다 (eas.json 설정).

#### 단계 5: 테스터 추가

1. Play Console → **테스트** → **Internal testing**
2. "테스터" 탭 → "목록 만들기"
   - 목록 이름: "BLOOMI 내부 테스터"
   - 이메일 추가 (쉼표로 구분)
3. "변경사항 저장"
4. "출시 시작" 클릭

#### 단계 6: 테스터에게 링크 공유

1. "테스터" 탭에서 **opt-in URL** 복사
   ```
   https://play.google.com/apps/internaltest/123456789
   ```
2. 테스터들에게 링크 전송
3. 테스터들은 링크 클릭 → "테스터 되기" → Play Store에서 앱 설치

---

### 3.3 양쪽 동시 테스트 빌드

```bash
# iOS + Android 동시 빌드 (시간 절약!)
npm run build:preview:all
```

---

## 4. 프로덕션 배포

> 1주일 테스트 완료 후 진행

### 4.1 iOS App Store 배포

#### 단계 1: 프로덕션 빌드

```bash
npm run build:production:ios
```

#### 단계 2: App Store Connect에서 앱 정보 입력

1. https://appstoreconnect.apple.com
2. "나의 앱" → "+" → "새로운 앱"
   - 플랫폼: iOS
   - 이름: BLOOMI
   - 기본 언어: 한국어
   - Bundle ID: `com.bloomi.app`
   - SKU: `bloomi-app-1`
   - 사용자 액세스: 전체 액세스

3. **앱 정보** 입력
   - 부제: "AI 기반 칼로리 분석"
   - 카테고리: 건강 및 피트니스
   - 연령 등급: 4+

4. **개인정보 보호 정책 URL** (필수!)
   ```
   https://your-website.com/privacy-policy
   ```
   > 없으면 생성 필요 (아래 섹션 참고)

5. **스크린샷** 업로드 (필수 크기)
   - 6.7" (iPhone 15 Pro Max): 1290 x 2796
   - 최소 3개 이상 권장

6. **앱 설명**
   ```
   BLOOMI는 AI를 활용하여 음식 사진만으로 칼로리와 영양소를 자동으로 분석해주는 스마트 식단 관리 앱입니다.

   📸 사진 한 장으로 간편하게
   음식 사진을 찍거나 업로드하면 AI가 자동으로 칼로리와 3대 영양소를 분석합니다.

   📊 나만의 식단 통계
   일별, 주별, 월별 섭취 칼로리와 영양소 통계를 한눈에 확인하세요.

   🎯 주요 기능
   • AI 기반 음식 인식 및 칼로리 추정
   • 3대 영양소 (탄수화물, 단백질, 지방) 분석
   • 식단 기록 및 통계
   • 캘린더 기반 식단 관리

   건강한 식습관, BLOOMI와 함께 시작하세요!
   ```

7. **키워드**
   ```
   칼로리,다이어트,식단,건강,영양,음식,AI,분석
   ```

8. **지원 URL**
   ```
   https://your-website.com/support
   ```

#### 단계 3: 빌드 선택 및 심사 제출

1. 처리 완료된 빌드 선택
2. "심사를 위해 제출" 클릭
3. **Export Compliance**: "아니요" (암호화 미사용)
4. 심사 대기 (평균 24-48시간)

---

### 4.2 Android Play Store 배포

#### 단계 1: 프로덕션 빌드

```bash
npm run build:production:android
```

**빌드 타입:** AAB (Android App Bundle, Play Store 필수 형식)

#### 단계 2: 프로덕션 트랙에 제출

```bash
npm run submit:android
```

#### 단계 3: Play Console에서 스토어 등록정보 완성

1. **기본 스토어 등록정보**
   - 앱 이름: BLOOMI
   - 간단한 설명 (80자):
     ```
     AI로 음식 사진만 찍으면 칼로리와 영양소를 자동 분석하는 스마트 식단 관리 앱
     ```
   - 자세한 설명 (위 iOS 설명 동일하게)

2. **그래픽 자산**
   - 아이콘: 512 x 512 PNG
   - 주요 그래픽: 1024 x 500 PNG
   - 스크린샷: 최소 2개 (권장 4-8개)

3. **앱 카테고리**
   - 앱 카테고리: 건강/운동
   - 태그: 건강, 다이어트, 칼로리

4. **연락처 세부정보**
   - 이메일
   - 전화번호 (선택)
   - 웹사이트 (선택)

#### 단계 4: 앱 콘텐츠 입력

1. **개인정보처리방침**
   - URL 입력 (필수!)

2. **앱 액세스 권한**
   - 특별한 액세스 필요 없음

3. **광고**
   - 현재: "아니요"
   - 2차 (광고 추가 후): "예"

4. **콘텐츠 등급**
   - 설문조사 작성
   - 예상 등급: EVERYONE

5. **타겟층**
   - 만 13세 이상

6. **뉴스 앱**
   - 아니요

#### 단계 5: 프로덕션 출시

1. **출시** → **프로덕션** → "새 출시 만들기"
2. 빌드 선택
3. **출시 이름**: `1.0.0 - 첫 출시`
4. **출시 노트** (한국어):
   ```
   🎉 BLOOMI 첫 출시!

   • AI 기반 음식 인식 및 칼로리 분석
   • 3대 영양소 자동 계산
   • 식단 기록 및 통계
   • 캘린더 기반 식단 관리

   건강한 식습관의 시작!
   ```
5. "검토 시작" 클릭
6. 심사 대기 (평균 1-3일)

---

## 5. 개인정보 처리방침 (필수!)

### 5.1 간단한 생성 방법

#### 옵션 1: 자동 생성기
- https://www.privacypolicies.com/
- https://app-privacy-policy-generator.firebaseapp.com/

#### 옵션 2: 직접 작성 (샘플)

```markdown
# BLOOMI 개인정보 처리방침

## 수집하는 개인정보
- 이메일 주소
- 이름
- 프로필 사진 (Google OAuth)
- 식단 사진 (칼로리 분석용)

## 개인정보 이용 목적
- 서비스 제공 및 식단 기록
- AI 기반 칼로리 분석
- 사용자 인증

## 제3자 제공
- OpenAI API: 음식 사진 분석 (이미지는 저장되지 않음)

## 개인정보 보관 기간
- 회원 탈퇴 시 즉시 삭제

## 사용자 권리
- 개인정보 열람, 수정, 삭제 요청 가능

## 문의
이메일: your-email@bloomi.com
```

### 5.2 호스팅

개인정보 처리방침은 **퍼블릭 URL**이 필요합니다:

- GitHub Pages (무료)
- Notion 페이지 (무료)
- 자체 웹사이트

---

## 6. 빌드 명령어 요약

```bash
# 테스트 빌드 (1주일 테스트용)
npm run build:preview:ios          # iOS TestFlight
npm run build:preview:android      # Android Internal Testing
npm run build:preview:all          # 양쪽 동시

# 프로덕션 빌드 (스토어 배포용)
npm run build:production:ios       # iOS App Store
npm run build:production:android   # Android Play Store
npm run build:production:all       # 양쪽 동시

# 제출 (빌드 후 자동 업로드)
npm run submit:ios
npm run submit:android
```

---

## 7. 문제 해결

### 7.1 "eas.json not found"
```bash
# eas.json이 이미 생성되어 있는지 확인
ls -la eas.json

# 없으면 문제 - 프로젝트 루트에서 다시 실행
cd /Users/athometrip/Documents/workspace/bloomi-mobile
```

### 7.2 "Bundle identifier is already in use"
- Apple Developer에서 다른 Bundle ID 생성
- `app.json`의 `ios.bundleIdentifier` 변경
- 예: `com.bloomi.app` → `com.bloomi.health`

### 7.3 "Google Play API error"
- `pc-api-key.json` 파일 경로 확인
- Service Account에 올바른 권한 부여 확인

### 7.4 빌드 실패 시
```bash
# 로그 확인
eas build:list

# 특정 빌드 로그 보기
eas build:view [BUILD_ID]
```

---

## 8. 예상 타임라인

| 단계 | 소요 시간 |
|------|----------|
| 개발자 계정 가입 및 승인 | 1-2일 |
| EAS 초기 설정 | 30분 |
| 테스트 빌드 생성 | 30분 |
| 테스터 초대 및 테스트 | **1주일** |
| 프로덕션 빌드 생성 | 30분 |
| 스토어 메타데이터 입력 | 2-3시간 |
| iOS 심사 | 1-3일 |
| Android 심사 | 1-3일 |
| **총 소요 기간** | **약 2주** |

---

## 9. 체크리스트

### 시작 전
- [ ] Apple Developer 계정 승인 완료
- [ ] Google Play Console 계정 승인 완료
- [ ] 백엔드 API 서버 배포 완료 및 URL 확인
- [ ] 개인정보 처리방침 작성 및 URL 준비
- [ ] 앱 아이콘 준비 (1024x1024)
- [ ] 스크린샷 준비 (4-8개)

### 테스트 배포
- [ ] `eas init` 실행 완료
- [ ] `eas.json`의 API_URL 수정
- [ ] iOS TestFlight 빌드 업로드
- [ ] Android Internal Testing 업로드
- [ ] 테스터 초대 및 1주일 테스트

### 프로덕션 배포
- [ ] 프로덕션 빌드 생성
- [ ] App Store 메타데이터 입력
- [ ] Play Store 메타데이터 입력
- [ ] 심사 제출
- [ ] 승인 대기

---

## 10. 다음 단계 (2차: 광고)

배포 완료 후 광고 시스템 추가 시:

1. **Google AdMob** 계정 생성
2. `app.json`에 AdMob 플러그인 추가
3. 광고 ID 설정
4. Play Store "광고 포함" 업데이트

---

**질문이나 문제가 있으면 Expo 포럼이나 GitHub Issues를 참고하세요:**
- Expo Forum: https://forums.expo.dev/
- EAS Docs: https://docs.expo.dev/eas/