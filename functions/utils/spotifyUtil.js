const axios = require("axios");
const querystring = require("querystring");
const { logger } = require("firebase-functions/v2");
const Token = require("../models/Token");
const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, FOR_SERVER_REDIRECT_URI } = require("../params");

// code -> tokens
async function spotifyExchangeCodeForToken(uid, authCode) {
  try {
    // debugging log
    logger.info("util phase start");

    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        grant_type: "authorization_code",
        code: authCode,
        redirect_uri: FOR_SERVER_REDIRECT_URI.value(),
        client_id: SPOTIFY_CLIENT_ID.value(),
        client_secret: SPOTIFY_CLIENT_SECRET.value(),
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    // debugging log
    logger.info("util phase finish");

    return new Token(uid, "spotify", response.data.access_token, response.data.refresh_token);
  } catch (error) {
    logger.error("Error: Util, exchanging Spotify code for tokens:", error);
    return null;
  }
}

// refresh -> access
async function spotifyRefreshAccessToken(refreshToken) {
  // debugging log
  logger.info("util phase start");

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: SPOTIFY_CLIENT_ID.value(),
        client_secret: SPOTIFY_CLIENT_SECRET.value(),
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    // debugging log
    logger.info("util phase finish");
    return response.data.access_token;
  } catch (error) {
    logger.error("Error: Util, refreshing Spotify access token:", error);
    return null;
  }
}

module.exports = { spotifyExchangeCodeForToken, spotifyRefreshAccessToken };
