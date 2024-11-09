const { onCall } = require("firebase-functions/v2/https");
const { logger, https } = require("firebase-functions/v2");
const querystring = require("querystring");

const infoService = require("../services/infoService");
const settingService = require("../services/settingService");
const Info = require("../models/Info");
const Setting = require("../models/Setting");

const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, FOR_CLIENT_REDIRECT_URI } = require("../params");

// createDefault, generateUrl,

// 초기 유저 생성시 db에 default 생성
const createDefault = onCall(async (request) => {
  try {
    // debugging log
    logger.info("handler phase start");

    const auth = request.auth;

    if (!auth) {
      throw new https.HttpsError("unauthenticated", "사용자가 인증되지 않았습니다.");
    }

    // Info, Setting 객체 생성
    const uid = auth.uid;

    const info = new Info(uid);
    const setting = new Setting(uid);

    // db에 기본 정보 저장
    await infoService.saveInfo(info);
    await settingService.saveSetting(setting);

    // debugging log
    logger.info("Default setting created successfully for UID:", { uid });
    logger.info("handler phase finish");

    return { message: "Default setting created successfully" };
  } catch (error) {
    logger.error("Error: Controller, generating default setting,", error);
    throw error;
  }
});

// 인증을 위한 URL 생성 프로세스 (일단 스포티파이로 해둠)
const generateUrl = onCall((request) => {
  const scopes = "user-read-private user-read-email";

  const authUrl = `https://accounts.spotify.com/authorize?${querystring.stringify({
    response_type: "code",
    client_id: SPOTIFY_CLIENT_ID.value(),
    scope: scopes,
    redirect_uri: FOR_CLIENT_REDIRECT_URI.value(),
  })}`;

  return { authUrl };
});



module.exports = { createDefault, generateUrl };
