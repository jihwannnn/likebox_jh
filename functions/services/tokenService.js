// token 관련 db 관리
const admin = require('firebase-admin');
const db = admin.firestore();

// saveTokens, 토큰을 db에 저장
async function saveTokens(uid, source, accessToken, refreshToken) {

  // debugging log
  console.log("service phase start");

  const userRef = db.collection("users").doc(uid);

  await userRef.set(
    {
      accessTokenMap: {
        [source]: accessToken,
      },
      refreshTokenMap: {
        [source]: refreshToken,
      },
    },
    { merge: true } // 기존에 있다면 병합
  );

  // debugging log
  console.log("service phase finish");
}

// getTokens, 토큰 db에서 가져오기
async function getTokens(uid, source) {

    // debugging log
  console.log("service phase finish");

  try {
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new Error("User not found");
    }

    const userData = userDoc.data();

    // debugging log
    console.log("service phase finish");

    return {
      accessToken: userData.accessTokenMap[source],
      refreshToken: userData.refreshTokenMap[source],
    };
  } catch (error) {
    console.error("Error: Service, retrieving tokens:", error);
    throw error;
  }
}

module.exports = { saveTokens, getTokens };

