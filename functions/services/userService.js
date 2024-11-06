// setting option 관련 db 관리
const admin = require('firebase-admin');
const db = admin.firestore();

// createUserDefault, db에 초기 세팅 생성. 토큰은 이 파일에서는 여기서만 다룸
async function createDefaultUser(uid, isDarkMode, notificationEnabled, language, acessTokenMap, refreshTokenMap) {

  // debugging log
  console.log("service phase start");

  // db ref 가져오기
  const userRef = db.collection("Users").doc(uid);

  // 해당 ref에 저장
  await userRef.set(
    {
      isDarkMode: isDarkMode,
      notificationEnabled: notificationEnabled,
      language: language,
      acessTokenMap: acessTokenMap,
      refreshTokenMap: refreshTokenMap
    },
    { merge: true } // 기존에 있다면 병합
  );

  // debugging log
  console.log("service phase finish");
}


module.exports = { createDefaultUser };
