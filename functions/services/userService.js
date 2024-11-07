// setting option 관련 db 관리
const { logger } = require('firebase-functions/v2');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');
const db = getFirestore();


// createUserDefault, db에 초기 유저 세팅 생성.
async function createDefaultUser(uid, isDarkMode, notificationEnabled, language, connectedPlatforms, accessTokenMap, refreshTokenMap) {
  try {
    // debugging log
    logger.info("service phase start");

    logger.info(uid)


    // db ref 가져오기
    const userRef = db.collection("Users").doc(uid);

    // 해당 ref에 저장
    await userRef.set(
      {
        isDarkMode: isDarkMode,
        notificationEnabled: notificationEnabled,
        language: language,
        connectedPlatforms: connectedPlatforms,
        accessTokenMap: accessTokenMap,
        refreshTokenMap: refreshTokenMap
      },
      { merge: true } // 기존에 있다면 병합
    );

    // debugging log
    logger.info("service phase finish");
  } catch (error) {
    // 오류 로깅
    logger.error("Error: Service, creating default user:", { error });
    throw new Error("Failed to create default user settings");
  }
}

module.exports = { createDefaultUser };
