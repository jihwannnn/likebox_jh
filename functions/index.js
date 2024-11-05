// const functions = require('firebase-functions');
const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

// Firebase Admin SDK 초기화
admin.initializeApp();

// Express 앱 생성
const app = express();

// 미들웨어 설정
app.use(cors()); // CORS 미들웨어 사용
app.use(express.json());

// 라우트 설정
console.log("here routes")
const routes = require('./routes');
app.use('/api', routes);
console.log("routes end")

// Firebase Functions로 app instance 내보내기
exports.app = onRequest(app);
