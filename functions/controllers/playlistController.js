// playlist 관련 프로세스 관리
const { onCall } = require("firebase-functions/v2/https");
const { logger, https } = require("firebase-functions/v2");
const tokenService = require("../services/tokenService");
const axios = require("axios");

// synchLikedTracks

// 특정 플랫폼에서 가져오는 프로세스
const synchLikedTracks = onCall(async (request) => {
  try {
    // debugging log
    logger.info("handler phase start");

    // 인증된 요청인지 확인
    const auth = request.auth;

    if (!auth) {
      throw new https.HttpsError("unauthenticated", "사용자가 인증되지 않았습니다.");
    }

    // 사용자 UID 가져오기
    const uid = auth.uid;
    const platform = "spotify";

    // tokenService.js에서 토큰 가져오기
    const tokens = await tokenService.getToken(uid, platform);
    const accessToken = tokens.accessToken;

    // Spotify API 요청
    const response = await axios.get("https://api.spotify.com/v1/me/tracks", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    // 좋아요한 트랙 목록 반환
    const likedTracks = response.data.items;

    // debugging log
    logger.info("handler phase finish");

    return { likedTracks };
  } catch (error) {
    logger.error("Error: Spotify liked tracks retrieval failed", error);
    throw error;
  }
});

module.exports = { synchLikedTracks };
