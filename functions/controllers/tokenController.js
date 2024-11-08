// token 관련 프로세스 관리
const { onCall } = require('firebase-functions/v2/https');
const { logger, https } = require('firebase-functions/v2');
const { defineString } = require('firebase-functions/params');
const jwtDecode = require('jwt-decode'); // JWT 디코딩 라이브러리 필요

const tokenService = require('../services/tokenService');
const spotifyUtil = require('../utils/spotifyUtil');
const Tokens = require('../models/Tokens').default; // Tokens 클래스 가져오기

const SPOTIFY_CLIENT_ID = defineString("");
const SPOTIFY_CLIENT_SECRET = defineString("");
const CLIENT_REDIRECT_URI = defineString("");

// tokensGeneratingHandler, 토큰 생성 프로세스
const tokensGeneratingHandler = onCall(async (request) => {

  // debugging log
  logger.info("handler phase start");

  const auth = request.auth;
  if (!auth) {
    throw new https.HttpsError("unauthenticated", "사용자가 인증되지 않았습니다.");
  }

  const authCode = request.data.code;
  if (!authCode) {
    throw new https.HttpsError("invalid-argument", "인증 코드가 제공되지 않았습니다.");
  }

  try {
    const tokens = await spotifyUtil.spotifyExchangeCodeForTokens(authCode);
    const uid = auth.uid;

    await tokenService.saveTokens(uid, tokens);

    // debugging log
    logger.info("Tokens successfully saved for UID:", { uid });
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

  const uid = request.data.uid;
  if (!uid) {
    throw new https.HttpsError("invalid-argument", "UID가 제공되지 않았습니다.");
  }

  const source = "spotify";

  try {
    const tokens = await tokenService.getTokens(uid, source);
    const accessToken = tokens.getAccessToken();
    const refreshToken = tokens.getRefreshToken();

    if (isTokenExpired(accessToken)) {
      logger.info("Access token expired, refreshing...");
      const newAccessToken = await spotifyUtil.spotifyRefreshAccessToken(refreshToken);

      if (!newAccessToken) {
        logger.info("Refresh token expired or invalid");
        return { success: false, message: "Token refresh failed" };
      }

      tokens.setAccessToken(newAccessToken);
      await tokenService.saveTokens(uid, tokens);

      logger.info("Access token refreshed and saved successfully");
      logger.info("handler phase finish");
      return { success: true, message: "Access token refreshed successfully" };
    }

    // debugging log
    logger.info("Access token is still valid");
    logger.info("handler phase finish");
    return { success: true, message: "Access token is valid" };
  } catch (error) {
    logger.error("Error: Controller, token verification:", { error });
    return { success: false, message: "Token verification failed", error: error.message };
  }
});

function isTokenExpired(token) {
  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return decodedToken.exp < currentTime;
  } catch (error) {
    logger.error("Error: decoding token:", { error });
    return true;
  }
}

module.exports = { tokensGeneratingHandler, tokensVerifyingHandler };
