// token 관련 프로세스 관리

const functions = require('firebase-functions');
const tokenService = require('../services/tokenService');
const { exchangeSpotifyCodeForTokens, refreshSpotifyAccessToken } = require('../utils/spotifyUtil');
const jwtDecode = require('jwt-decode'); // JWT 디코딩 라이브러리 필요

// tokenGeneratingHandler, 토큰 생성 프로세스
async function tokenGeneratingHandler(data, context) {

  // debugging log
  console.log("handler phase start");

  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "사용자가 인증되지 않았습니다.");
  }

  const authCode = data.code;
  if (!authCode) {
    throw new functions.https.HttpsError("invalid-argument", "인증 코드가 제공되지 않았습니다.");
  }

  try {
    // spotifyUtil.js, 코드를 토큰으로 교환
    const { accessToken, refreshToken } = await exchangeSpotifyCodeForTokens(authCode);
    const uid = context.auth.uid;
    const source = "spotify"

    // tokenService.js, 토큰 저장
    await tokenService.saveTokens(uid, source, accessToken, refreshToken);

    console.log("Tokens successfully saved for UID:", uid);

    // debugging log
    console.log("handler phase finish");

    return { success: true, message: "Tokens saved successfully." };
  } catch (error) {
    console.error("Error: Controller, Token generating,", error);
    throw new functions.https.HttpsError("internal", "Spotify authentication failed.");
  }
}

// verifyTokensHandler, 토큰 검증 프로세스
async function verifyTokensHandler(uid) {

  // debugging log
  console.log("handler phase start");

  try {
    const source = "spotify"

    // tokenServices.js, 토큰 가져오기
    const { accessToken, refreshToken } = await tokenService.getTokens(uid, source);

    // 액세스 토큰이 만료되었는지 확인
    if (isTokenExpired(accessToken)) {
      console.log("Access token expired, refreshing...");

      // spotifyUtils.js, 액세스 토큰 발급
      const newAccessToken = await refreshSpotifyAccessToken(refreshToken);

      if (!newAccessToken) {
        console.log("Refresh token expired or invalid");

        // debugging log
        console.log("handler phase finish");
        return { success: false, message: "Token refresh failed"};
      }

      // tokenServices.js, 토큰 저장
      await tokenService.saveTokens(uid, source, newAccessToken, refreshToken);

      console.log("Access token refreshed and saved successfully");

      // debugging log
      console.log("handler phase finish");
      return { success: true, message: "Access token refreshed successfully" };
    }

    // 액세스 토큰이 유효한 경우
    console.log("Access token is still valid");

    // debugging log
    console.log("handler phase finish");
    return { success: true, message: "Access token is valid" };

  } catch (error) {
    console.error("Error: Controller, token verification:", error);
    return { success: false, message: "Token verification failed", error: error.message };
  }
}

// 토큰 만료 확인 보조 함수
function isTokenExpired(token) {
  try {
    const decodedToken = jwtDecode(token); // JWT 토큰 디코드
    const currentTime = Math.floor(Date.now() / 1000); // 현재 시간을 초 단위로
    return decodedToken.exp < currentTime; // 시간 비교
  } catch (error) {
    console.error("Error: decoding token:", error);
    return true; // 디코딩에 실패하면 만료된 것으로 간주
  }
}

module.exports = { tokenGeneratingHandler, verifyTokensHandler };
