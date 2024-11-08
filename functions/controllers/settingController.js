const { onCall } = require('firebase-functions/v2/https');
const { logger, https } = require('firebase-functions/v2');
const settingService = require('../services/settingService');
const Settings = require('../models/Settings'); // Settings 클래스 가져오기

// settingCreationHandler, 사용자 생성 시 초기 세팅 프로세스
const settingCreationHandler = onCall(async (request) => {
  try {
    if (!request.auth) {
      // Throwing an HttpsError so that the client gets the error details.
      throw new https.HttpsError(
        "failed-precondition",
        "The function must be called while authenticated."
      );
    }

    // debugging log
    logger.info("handler phase start");

    if (request) logger.info("request existed");

    // Settings 객체 생성
    const uid = request.data.uid;
    const settings = new Settings(uid);

    // settingService.js, DB에 사용자 기본 정보 저장
    await settingService.createDefaultSetting(settings);

    // debugging log
    logger.info("Default setting created successfully for UID:", { uid });
    logger.info("handler phase finish");

    return { message: "Default setting created successfully" };
  } catch (error) {
    // 오류 로깅
    logger.error("Error: Controller, generating default setting,", { error });
    throw new https.HttpsError("internal", "Failed to save setting settings", {
      error: error.message,
    });
  }
});

module.exports = { settingCreationHandler };
