// user 관련 프로세스 관리

const { onCall } = require('firebase-functions/v2/https');
const { logger, https } = require('firebase-functions/v2');
const userService = require('../services/userService');
const tokenService = require('../services/tokenService');


// userCreationHandler, 사용자 생성 시 초기 세팅 프로세스
const userCreationHandler = onCall(async (request) => {
  try {

    if (!request.auth) {
      // Throwing an HttpsError so that the client gets the error details.
      throw new HttpsError("failed-precondition", "The function must be " +
              "called while authenticated.");
    }

    // debugging log
    logger.info("handler phase start");

    if(request) logger.info("request existed")
      
    // 매개변수 추출
    const uid = request.data.uid;

    // 기본값 설정
    const isDarkMode = false;
    const notificationEnabled = true;
    const language = 'ko';
    const connectedPlatforms = [];
    const accessTokenMap = {};
    const refreshTokenMap = {};

    // userService.js, DB에 사용자 기본 정보 저장
    await userService.createDefaultUser(
      uid,
      isDarkMode,
      notificationEnabled,
      language,
      connectedPlatforms,
    );

    await tokenService.createDefaultTokens(
      uid,
      accessTokenMap,
      refreshTokenMap
    )

    // debugging log
    logger.info("Default user created successfully for UID:", { uid });
    logger.info("handler phase finish");

    return { message: "Default user created successfully" };
  } catch (error) {
    logger.error("Error: Controller, generating default user,", { error });
    throw new https.HttpsError("internal", "Failed to save user settings", {
      error: error.message,
    });
  }
});

module.exports = { userCreationHandler };
