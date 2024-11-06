const { onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

if (!admin.apps.length) {
    admin.initializeApp();
}

const userController = require('./controllers/userController');
const tokenController = require('./controllers/tokenController');


exports.userCreationHandler = onCall(userController.userCreationHandler);
exports.tokenGeneratingHandler = onCall(tokenController.tokenGeneratingHandler); 
