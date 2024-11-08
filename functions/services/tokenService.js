const { logger } = require('firebase-functions/v2');
const { getFirestore } = require('firebase-admin/firestore');
const Tokens = require('../models/Tokens');
const db = getFirestore();

async function saveTokens(uid, tokens) {

  // debugging log
  logger.info("service phase start");

  const tokenRef = db.collection("Tokens").doc(uid).collection("user_tokens").doc(tokens.source);
  await tokenRef.set(tokens.toObject(), { merge: true });

  // debugging log
  logger.info("service phase finish");
}

async function getTokens(uid, source) {

  // debugging log
  logger.info("service phase start");

  try {
    const tokenRef = db.collection("Tokens").doc(uid).collection("user_tokens").doc(source);
    const tokenDoc = await tokenRef.get();

    if (!tokenDoc.exists) {
      throw new Error("Token not found");
    }

    const tokenData = tokenDoc.data();
    const tokens = new Tokens(source, tokenData.accessToken, tokenData.refreshToken);

    // debugging log
    logger.info("service phase finish");
    return tokens;
  } catch (error) {
    logger.error("Error: Service, retrieving tokens:", { error });
    throw error;
  }
}

module.exports = { saveTokens, getTokens };
