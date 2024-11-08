const { logger } = require('firebase-functions/v2');
const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();

// createSettingDefault, db에 초기 유저 세팅 생성
async function createDefaultSetting(settings) {
  try {
    // debugging log
    logger.info("service phase start");

    // db ref 가져오기
    const settingRef = db.collection("Settings").doc(settings.uid);

    // 해당 ref에 저장
    await settingRef.set(
      {
        isDarkMode: settings.isDarkMode,
        notificationEnabled: settings.notificationEnabled,
        language: settings.language,
        connectedPlatforms: settings.connectedPlatforms
      },
      { merge: true } // 기존에 있다면 병합
    );

    // debugging log
    logger.info("service phase finish");
  } catch (error) {
    // 오류 로깅
    logger.error("Error: Service, creating default setting:", { error });
    throw new Error("Failed to create default settings");
  }
}

module.exports = { createDefaultSetting };
