# Google OAuth 설정 가이드

## 1. Google Cloud Console 설정

### 1.1 프로젝트 생성 (이미 있다면 생략)
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 선택 드롭다운 → "새 프로젝트" 클릭
3. 프로젝트 이름: `bloomi` 입력 후 "만들기"

### 1.2 OAuth 동의 화면 구성
1. 좌측 메뉴 → "API 및 서비스" → "OAuth 동의 화면"
2. 사용자 유형: **외부** 선택 → "만들기"
3. 앱 정보 입력:
   - 앱 이름: `BLOOMI`
   - 사용자 지원 이메일: `your-email@gmail.com`
   - 개발자 연락처 정보: `your-email@gmail.com`
4. 범위: 기본값 사용 (추가 안 함)
5. 테스트 사용자: 본인 이메일 추가
6. "저장 후 계속"

### 1.3 OAuth 클라이언트 ID 만들기

#### Web 클라이언트 (백엔드용)
1. "API 및 서비스" → "사용자 인증 정보"
2. "+ 사용자 인증 정보 만들기" → "OAuth 클라이언트 ID"
3. 애플리케이션 유형: **웹 애플리케이션**
4. 이름: `BLOOMI Web Client`
5. 승인된 리디렉션 URI:
   ```
   http://localhost:8080/login/oauth2/code/google
   ```
6. "만들기" 클릭
7. **클라이언트 ID**와 **클라이언트 보안 비밀** 복사 → 백엔드 `.env`에 저장

#### iOS 클라이언트
1. "+ 사용자 인증 정보 만들기" → "OAuth 클라이언트 ID"
2. 애플리케이션 유형: **iOS**
3. 이름: `BLOOMI iOS`
4. 번들 ID: `com.bloomi.app`
5. "만들기"
6. **클라이언트 ID** 복사

#### Android 클라이언트
1. "+ 사용자 인증 정보 만들기" → "OAuth 클라이언트 ID"
2. 애플리케이션 유형: **Android**
3. 이름: `BLOOMI Android`
4. 패키지 이름: `com.bloomi.app`
5. SHA-1 인증서 지문 얻기:
   ```bash
   # Expo 개발용 디버그 키
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```
6. SHA-1 지문 복사 후 입력
7. "만들기"
8. **클라이언트 ID** 복사

## 2. 모바일 앱 설정

### 2.1 Google Client ID 설정

`src/screens/LoginScreen.tsx` 파일에서 클라이언트 ID 변경:

```typescript
const GOOGLE_CLIENT_ID = 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com';
```

**주의:** iOS와 Android는 다른 클라이언트 ID를 사용합니다.

```typescript
import { Platform } from 'react-native';

const GOOGLE_CLIENT_ID = Platform.select({
  ios: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
  android: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
  default: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
});
```

### 2.2 리디렉션 URI 확인

개발 중에는 다음 URI가 사용됩니다:
```
bloomi://auth/callback
```

프로덕션 빌드 시:
```
exp://[your-expo-project-id]/--/auth/callback
```

## 3. 백엔드 설정

백엔드 프로젝트 `.env` 파일:

```env
GOOGLE_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_WEB_CLIENT_SECRET
```

## 4. 테스트

### 4.1 백엔드 실행
```bash
cd bloomi
./gradlew bootRun
```

### 4.2 모바일 앱 실행
```bash
cd bloomi-mobile
npm start
```

### 4.3 로그인 테스트
1. Expo Go 앱에서 QR 코드 스캔
2. "Google로 시작하기" 버튼 클릭
3. Google 계정 선택 및 권한 승인
4. 앱 홈 화면으로 이동 확인

## 5. 문제 해결

### "redirect_uri_mismatch" 에러
- Google Cloud Console에서 리디렉션 URI 확인
- 백엔드: `http://localhost:8080/login/oauth2/code/google`
- 모바일: `bloomi://auth/callback`

### "invalid_client" 에러
- 클라이언트 ID가 올바른지 확인
- iOS/Android 각각 올바른 클라이언트 ID 사용 중인지 확인

### SHA-1 인증서 지문 에러 (Android)
```bash
# 개발용
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# 프로덕션용 (릴리즈 빌드 시)
keytool -list -v -keystore /path/to/your/release.keystore
```

## 6. 참고 자료

- [Expo AuthSession 공식 문서](https://docs.expo.dev/guides/authentication/)
- [Google OAuth 2.0 문서](https://developers.google.com/identity/protocols/oauth2)
- [Expo Google Sign-In](https://docs.expo.dev/guides/google-authentication/)