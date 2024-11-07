// token 관련 db 관리
const { logger } = require('firebase-functions/v2');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');
const db = getFirestore();

// createDefaultTokens, db에 초기 토큰 생성
async function createDefaultTokens(uid, accessTokenMap, refreshTokenMap) {
  try {
    // debugging log
    logger.info("service phase start");

    logger.info(uid)


    // db ref 가져오기
    const tokenRef = db.collection("Tokens").doc(uid);

    // 해당 ref에 저장
    await tokenRef.set(
      {
        accessTokenMap: accessTokenMap,
        refreshTokenMap: refreshTokenMap
      },
      { merge: true } // 기존에 있다면 병합
    );

    // debugging log
    logger.info("service phase finish");
  } catch (error) {
    // 오류 로깅
    logger.error("Error: Service, creating default tokens:", { error });
    throw new Error("Failed to create default tokens");
  }
}

// saveTokens, 토큰을 db에 저장
async function saveTokens(uid, source, accessToken, refreshToken) {
  
  // debugging log
  logger.info("service phase start");

  const tokenRef = db.collection("Tokens").doc(uid);

  await tokenRef.update(
    {
      'accessTokenMap.source': accessToken,
      'refreshTokenMap.source': refreshToken
    },
  );

  // debugging log
  logger.info("service phase finish");
}

// getTokens, 토큰 db에서 가져오기
async function getTokens(uid, source) {
  // debugging log
  logger.info("service phase start");

  try {
    const tokenRef = db.collection("Tokens").doc(uid);
    const tokenDoc = await tokenRef.get();

    if (!tokenDoc.exists) {
      throw new Error("token not found");
    }

    const tokenData = tokenDoc.data();

    // debugging log
    logger.info("service phase finish");

    return {
      accessToken: tokenData.accessTokenMap[source],
      refreshToken: tokenData.refreshTokenMap[source],
    };
  } catch (error) {
    logger.error("Error: Service, retrieving tokens:", { error });
    throw error;
  }
}

module.exports = { saveTokens, getTokens };
