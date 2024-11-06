// user 관련 프로세스 관리

const userService = require('../services/userService');
const functions = require('firebase-functions');

// userCreationhandler, 사용자 생성시 초기 세팅 프로세스
async function userCreationHandler(user) {
  try {

    // debugging log
    console.log("handler phase start");
    console.log("New user registered:", user);

    // 기본값 설정
    const { uid } = user;
    const isDarkMode = false;
    const notificationEnabled = true;
    const language = 'ko';
    const acessTokenMap = {};
    const refreshTokenMap = {};

    // userService.js, db에 user default 저장
    await userService.createDefaultUser(uid, isDarkMode, notificationEnabled, language, acessTokenMap, refreshTokenMap);

    // debugging log
    console.log("Default user created successfully for UID:", uid);
    console.log("handler phase finish");

  } catch (error) {
    console.error("Error: Controller, generating default user,", error);
    throw new functions.https.HttpsError("internal", "Failed to save user settings", { error: error.message });
  }
}

module.exports = { userCreationHandler };
