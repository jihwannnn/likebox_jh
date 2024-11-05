const userService = require('../services/userService.js');

exports.registerUser = async (req, res) => {
  try {
    console.log("controller for register user")
    const { token } = req.body;

    if (!token) {
      return res.status(400).send({ error: '토큰이 제공되지 않았습니다.' });
    }

    // 토큰 검증 및 사용자 정보 추출
    const userData = await userService.verifyTokenAndGetUserData(token);

    // Firestore에 사용자 정보 저장
    await userService.saveUser(userData);

    res.status(200).send({ message: '사용자 정보가 저장되었습니다.' });
  } catch (error) {
    console.error('사용자 등록 오류:', error);
    res.status(400).send({ error: '사용자 등록에 실패했습니다.' });
  }
};
