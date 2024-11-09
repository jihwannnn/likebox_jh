// token 관련 프로세스 관리
const { onCall } = require("firebase-functions/v2/https");
const { logger, https } = require("firebase-functions/v2");
const querystring = require("querystring");
const jwtDecode = require("jwt-decode"); // JWT 디코딩 라이브러리 필요

const tokenService = require("../services/tokenService");
const spotifyUtil = require("../utils/spotifyUtil");
const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, FOR_CLIENT_REDIRECT_URI } = require("../params");
const Token = require("../models/Token"); // Token 클래스 가져오기

// generateToken, verifyToken, isTokenExpired

// 토큰 생성 프로세스
const generateToken = onCall(async (request) => {
  try {
    // debugging log
    logger.info("handler phase start");

    const auth = request.auth;
    
    if (!auth) {
      throw new https.HttpsError("unauthenticated", "사용자가 인증되지 않았습니다.");
    }

    // 클라이언트가 제공한 authCode 가져옴
    const authCode = request.data.code;
    if (!authCode) {
      throw new https.HttpsError("invalid-argument", "인증 코드가 제공되지 않았습니다.");
    }

    // 코드를 전달하여 토큰 가져옴
    const uid = auth.uid;
    const token = await spotifyUtil.spotifyExchangeCodeForTokens(uid, authCode);

    // 해당 토큰 저장
    await tokenService.saveToken(token);

    // debugging log
    logger.info("Token successfully saved for UID:", uid);
    logger.info("handler phase finish");

    return { success: true, message: "Token saved successfully." };
  } catch (error) {
    logger.error("Error: Controller, Token generating,", error);
    throw error;
  }
});

// 토큰 검증 프로세스
const verifyToken = onCall(async (request) => {
  // debugging log
  logger.info("handler phase start");

  const auth = request.auth;
  
  if (!auth) {
    throw new https.HttpsError("unauthenticated", "사용자가 인증되지 않았습니다.");
  }

  const platform = "spotify";
  const uid = auth.uid;

  try {
    const token = await tokenService.getToken(uid, platform);
    const accessToken = token.accessToken;
    const refreshToken = token.refreshToken;

    // 액세스 토큰 만료 시
    if (isTokenExpired(accessToken)) {
      logger.info("Access token expired, refreshing...");

      // 리프레스 토큰으로 새로운 액세스 토큰 받아옴
      const newAccessToken = await spotifyUtil.spotifyRefreshAccessToken(refreshToken);

      // 새로운 액세스 토큰 없으면 유저가 인증부터 다시하도록 false 반환
      if (!newAccessToken) {
        logger.info("Refresh token expired or invalid");
        return { success: false, message: "Token refresh failed" };
      }

      // 액세스 토큰과 함께 db에 저장
      token.accessToken = newAccessToken;
      await tokenService.saveToken(token);

      logger.info("Access token refreshed and saved successfully");
      logger.info("handler phase finish");
      return { success: true, message: "Access token refreshed successfully" };
    }

    // debugging log
    logger.info("Access token is still valid");
    logger.info("handler phase finish");
    return { success: true, message: "Access token is valid" };
  } catch (error) {
    logger.error("Error: Controller, token verification:", error);
    return { success: false, message: "Token verification failed", error: error };
  }
});

// 액세스 토큰 만료 확인 프로세스
function isTokenExpired(token) {
  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return decodedToken.exp < currentTime;
  } catch (error) {
    logger.error("Error: decoding token:", error);
    return true;
  }
}

module.exports = { generateToken, verifyToken };
