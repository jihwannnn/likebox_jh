// spotify 관련 유틸

const axios = require('axios');
const querystring = require('querystring');
const { logger } = require('firebase-functions/v2');

const SPOTIFY_CLIENT_ID = "your_spotify_client_id";
const SPOTIFY_CLIENT_SECRET = "your_spotify_client_secret";
const REDIRECT_URI = "your_redirect_uri";

// exchangeSpotifyCodeForeTokens, 코드를 스포티파이에 전달, 응답 데이터에서 토큰들을 반환함
async function spotifyExchangeCodeForTokens(authCode) {
  try {

    // debugging log
    logger.info("util phase start");

    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        grant_type: "authorization_code",
        code: authCode,
        redirect_uri: REDIRECT_URI,
        client_id: SPOTIFY_CLIENT_ID,
        client_secret: SPOTIFY_CLIENT_SECRET,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    // debugging log
    logger.info("service phase finish");

    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
    };
  } catch (error) {
    logger.error("Error: Util, exchanging Spotify code for tokens:", { error });
    throw new Error("Failed to exchange Spotify code for tokens.");
  }
}

async function spotifyRefreshAccessToken(refreshToken) {
  logger.info("util phase start");

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: SPOTIFY_CLIENT_ID,
        client_secret: SPOTIFY_CLIENT_SECRET,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    logger.info("util phase finish");

    return response.data.access_token;
  } catch (error) {
    logger.error("Error: Util, refreshing Spotify access token:", { error });
    return null;
  }
}

module.exports = { spotifyExchangeCodeForTokens, spotifyRefreshAccessToken };
