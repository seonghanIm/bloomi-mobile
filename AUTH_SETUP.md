# 로그인 설정 가이드 (간소화 버전)

## ✅ 장점

백엔드에서만 Google OAuth를 처리하므로:
- 프론트엔드에 Google Client ID 불필요
- 설정 간단
- 보안 강화 (Client Secret이 백엔드에만 존재)

## 📋 동작 방식

```
1. 프론트: "Google로 시작하기" 버튼 클릭
   ↓
2. 프론트: WebBrowser로 백엔드 로그인 페이지 열기
   URL: http://localhost:8080/oauth2/authorization/google?redirect_uri=bloomi://auth/callback
   ↓
3. 백엔드: Google OAuth 페이지로 리디렉트
   ↓
4. 사용자: Google 계정 선택 및 권한 승인
   ↓
5. 백엔드: Google으로부터 사용자 정보 받아서 JWT 토큰 생성
   ↓
6. 백엔드: 모바일 앱으로 리디렉트
   URL: bloomi://auth/callback?token={JWT}&user={userInfo}
   ↓
7. 프론트: Deep link로 토큰과 사용자 정보 받음
   ↓
8. 프론트: AsyncStorage에 토큰 저장 → 홈 화면 이동
```

## 🔧 백엔드 설정 필요사항

백엔드 OAuth 성공 핸들러에서 다음과 같이 모바일로 리디렉트해야 합니다:

```java
@GetMapping("/auth/oauth-callback")
public void oauthCallback(
    @RequestParam String token,
    @RequestParam String user,
    @RequestParam(required = false) String redirect_uri,
    HttpServletResponse response
) throws IOException {
    if (redirect_uri != null && redirect_uri.startsWith("bloomi://")) {
        // 모바일 앱으로 리디렉트
        String mobileUrl = String.format(
            "%s?token=%s&user=%s",
            redirect_uri,
            token,
            URLEncoder.encode(new ObjectMapper().writeValueAsString(user), "UTF-8")
        );
        response.sendRedirect(mobileUrl);
    } else {
        // 웹으로 리디렉트 (기존 로직)
        response.sendRedirect("/");
    }
}
```

또는 Spring Security `OAuth2AuthenticationSuccessHandler` 커스터마이징:

```java
@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Override
    public void onAuthenticationSuccess(
        HttpServletRequest request,
        HttpServletResponse response,
        Authentication authentication
    ) throws IOException {
        String redirectUri = request.getParameter("redirect_uri");

        if (redirectUri != null && redirectUri.startsWith("bloomi://")) {
            // JWT 토큰 생성
            String token = jwtTokenProvider.createToken(authentication);

            // 사용자 정보
            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
            String userJson = new ObjectMapper().writeValueAsString(oAuth2User);

            // 모바일 앱으로 리디렉트
            String targetUrl = String.format(
                "%s?token=%s&user=%s",
                redirectUri,
                token,
                URLEncoder.encode(userJson, "UTF-8")
            );

            getRedirectStrategy().sendRedirect(request, response, targetUrl);
            return;
        }

        // 웹 클라이언트는 기존 로직
        super.onAuthenticationSuccess(request, response, authentication);
    }
}
```

## 📱 모바일 앱 설정

이미 완료되었습니다:
- ✅ Deep link 스킴: `bloomi://`
- ✅ WebBrowser로 백엔드 OAuth 페이지 열기
- ✅ Deep link 리스너로 토큰 받기
- ✅ AsyncStorage에 토큰 저장

## 🧪 테스트 방법

### 1. 백엔드 실행
```bash
cd bloomi
./gradlew bootRun
```

### 2. 모바일 앱 실행
```bash
cd bloomi-mobile
npm start
```

### 3. 로그인 테스트
1. Expo Go에서 앱 실행
2. "Google로 시작하기" 버튼 클릭
3. Google 계정 선택 및 승인
4. 홈 화면으로 자동 이동 확인

## ❗ 주의사항

### Android Emulator
백엔드 API URL을 `http://10.0.2.2:8080`으로 설정:
```typescript
// src/constants/config.ts
const ENV = {
  dev: {
    apiUrl: 'http://10.0.2.2:8080', // Android Emulator
  },
};
```

### iOS Simulator
`http://localhost:8080` 사용 가능

### 실제 기기
컴퓨터의 로컬 IP 사용:
```typescript
apiUrl: 'http://192.168.0.10:8080', // 실제 IP로 변경
```

## 🔍 디버깅

### Deep link가 안 열릴 때
```bash
# iOS Simulator
xcrun simctl openurl booted "bloomi://auth/callback?token=test&user=%7B%22name%22%3A%22Test%22%7D"

# Android
adb shell am start -W -a android.intent.action.VIEW -d "bloomi://auth/callback?token=test&user=%7B%22name%22%3A%22Test%22%7D"
```

### 로그 확인
```bash
# React Native 로그
npx react-native log-ios
npx react-native log-android
```