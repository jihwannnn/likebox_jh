// token 관련 프로세스 관리

const { onCall } = require('firebase-functions/v2/https');
const { logger, https } = require('firebase-functions/v2');
const tokenService = require('../services/tokenService');
const spotifyUtil = require('../utils/spotifyUtil');
const jwtDecode = require('jwt-decode'); // JWT 디코딩 라이브러리 필요

// tokensGeneratingHandler, 토큰 생성 프로세스
const tokensGeneratingHandler = onCall(async (request) => {
  // debugging log
  logger.info("handler phase start");

  // const auth = request.auth;
  // if (!auth) {
  //   throw new https.HttpsError("unauthenticated", "사용자가 인증되지 않았습니다.");
  // }

  const { code: authCode } = request.data.authCode;
  if (!authCode) {
    throw new https.HttpsError("invalid-argument", "인증 코드가 제공되지 않았습니다.");
  }

  try {
    // spotifyUtil.js, 코드를 토큰으로 교환
    const { accessToken, refreshToken } = await spotifyUtil.spotifyExchangeCodeForTokens(authCode);
    const uid = auth.uid;
    const source = "spotify";

    // tokenService.js, 토큰 저장
    await tokenService.saveTokens(uid, source, accessToken, refreshToken);

    logger.info("Tokens successfully saved for UID:", { uid });

    // debugging log
    logger.info("handler phase finish");

    return { success: true, message: "Tokens saved successfully." };
  } catch (error) {
    logger.error("Error: Controller, Token generating,", { error });
    throw new https.HttpsError("internal", "Spotify authentication failed.");
  }
});

// tokensVerifyingHandler, 토큰 검증 프로세스
const tokensVerifyingHandler = onCall(async (request) => {
  // debugging log
  logger.info("handler phase start");

  const uid = request.auth.uid;
  if (!uid) {
    throw new https.HttpsError("invalid-argument", "UID가 제공되지 않았습니다.");
  }

  try {
    const source = "spotify";

    // tokenService.js, 토큰 가져오기
    const { accessToken, refreshToken } = await tokenService.getTokens(uid, source);

    // 액세스 토큰이 만료되었는지 확인
    if (isTokenExpired(accessToken)) {
      logger.info("Access token expired, refreshing...");

      // spotifyUtil.js, 액세스 토큰 발급
      const newAccessToken = await spotifyUtil.spotifyRefreshAccessToken(refreshToken);

      if (!newAccessToken) {
        logger.info("Refresh token expired or invalid");

        // debugging log
        logger.info("handler phase finish");
        return { success: false, message: "Token refresh failed" };
      }

      // tokenService.js, 토큰 저장
      await tokenService.saveTokens(uid, source, newAccessToken, refreshToken);

      logger.info("Access token refreshed and saved successfully");

      // debugging log
      logger.info("handler phase finish");
      return { success: true, message: "Access token refreshed successfully" };
    }

    // 액세스 토큰이 유효한 경우
    logger.info("Access token is still valid");

    // debugging log
    logger.info("handler phase finish");
    return { success: true, message: "Access token is valid" };
  } catch (error) {
    logger.error("Error: Controller, token verification:", { error });
    return { success: false, message: "Token verification failed", error: error.message };
  }
});

// 토큰 만료 확인 보조 함수
function isTokenExpired(token) {
  try {
    const decodedToken = jwtDecode(token); // JWT 토큰 디코드
    const currentTime = Math.floor(Date.now() / 1000); // 현재 시간을 초 단위로
    return decodedToken.exp < currentTime; // 시간 비교
  } catch (error) {
    logger.error("Error: decoding token:", { error });
    return true; // 디코딩에 실패하면 만료된 것으로 간주
  }
}

module.exports = { tokensGeneratingHandler, tokensVerifyingHandler };
