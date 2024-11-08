const axios = require('axios');
const querystring = require('querystring');
const { logger } = require('firebase-functions/v2');
const { defineString } = require('firebase-functions/params');
const Tokens = require('../models/Tokens').default;

const SPOTIFY_CLIENT_ID = defineString("A");
const SPOTIFY_CLIENT_SECRET = defineString("B");
const SERVER_REDIRECT_URI = defineString("C");

async function spotifyExchangeCodeForTokens(authCode) {
  try {

    // debugging log
    logger.info("util phase start");

    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        grant_type: "authorization_code",
        code: authCode,
        redirect_uri: SERVER_REDIRECT_URI,
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
    logger.info("util phase finish");

    return new Tokens("spotify", response.data.access_token, response.data.refresh_token);
  } catch (error) {
    logger.error("Error: Util, exchanging Spotify code for tokens:", { error });
    throw new Error("Failed to exchange Spotify code for tokens.");
  }
}

async function spotifyRefreshAccessToken(refreshToken) {

  // debugging log
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

    // debugging log
    logger.info("util phase finish");
    return response.data.access_token;
  } catch (error) {
    logger.error("Error: Util, refreshing Spotify access token:", { error });
    return null;
  }
}

module.exports = { spotifyExchangeCodeForTokens, spotifyRefreshAccessToken };
