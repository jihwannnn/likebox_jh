const admin = require('firebase-admin');

admin.initializeApp(); // Firebase Admin 초기화

const tokenController = require('./controllers/tokenController');
const settingController = require('./controllers/settingController');

exports.tokensGeneratingHandler = tokenController.tokensGeneratingHandler;
exports.tokensVerifyingHandler = tokenController.tokensVerifyingHandler;
exports.settingCreationHandler = settingController.settingCreationHandler;