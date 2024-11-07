const admin = require('firebase-admin');

admin.initializeApp(); // Firebase Admin 초기화

const tokenController = require('./controllers/tokenController');
const userController = require('./controllers/userController');

exports.tokensGeneratingHandler = tokenController.tokensGeneratingHandler;
exports.tokensVerifyingHandler = tokenController.tokensVerifyingHandler;
exports.userCreationHandler = userController.userCreationHandler;