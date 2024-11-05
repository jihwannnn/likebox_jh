const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// 미들웨어로 콘솔 출력

router.get("/register", (req, res) => {
    console.log("register 주소 확인")
})

router.post('/register', (req, res, next) => {
    console.log("registerUser 호출 중");
    next(); // 다음 미들웨어 또는 라우터 핸들러로 이동
}, userController.registerUser);

module.exports = router;
