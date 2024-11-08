// track 관련 프로세스 관리
const { onCall } = require('firebase-functions/v2/https');
const { logger } = require('firebase-functions/v2');
const tokenService = require('../services/tokenService');
const axios = require('axios');

// spotifyLikedTracksHandler, Spotify 좋아요한 트랙 가져오기
const spotifyLikedTracksHandler = onCall(async (request) => {
  try {

    // debugging log
    logger.info("handler phase start");
    
    // 인증된 요청인지 확인
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "사용자가 인증되지 않았습니다.");
    }

    // 사용자 UID 가져오기
    const uid = request.data.uid;

    // tokenService.js에서 토큰 가져오기
    const source = "spotify";
    const { accessToken } = await tokenService.getTokens(uid, source);

    // Spotify API 요청
    const response = await axios.get("https://api.spotify.com/v1/me/tracks", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    // 좋아요한 트랙 목록 반환
    const likedTracks = response.data.items;
    return { likedTracks };

  } catch (error) {
    // 오류 처리
    logger.error("Error: Spotify liked tracks retrieval failed", { error });
    throw new HttpsError("internal", "Spotify 좋아요한 트랙을 가져오는 데 실패했습니다.", {
      error: error.message,
    });
  }
});

module.exports = { spotifyLikedTracksHandler };
