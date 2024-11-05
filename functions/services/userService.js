const admin = require('firebase-admin');
const db = admin.firestore();

exports.verifyTokenAndGetUserData = async (token) => {
  // ID 토큰 검증
  const decodedToken = await admin.auth().verifyIdToken(token);

  // 사용자 정보 추출
  const uid = decodedToken.uid;
  const email = decodedToken.email;
  const name = decodedToken.name || decodedToken.displayName;

  if (!email || !name) {
    throw new Error('토큰에서 필요한 사용자 정보를 추출할 수 없습니다.');
  }

  return { uid, email, name };
};

exports.saveUser = async (userData) => {
  const { uid, email, name } = userData;

  const userRef = db.collection('users').doc(uid);

  // Firestore에 사용자 정보 저장
  await userRef.set(
    {
      email: email,
      name: name,
    },
    { merge: true }
  );
};
