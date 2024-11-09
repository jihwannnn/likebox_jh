const admin = require("firebase-admin");

admin.initializeApp(); // Firebase Admin 초기화

const generalController = require("./controllers/generalController");
const infoController = require("./controllers/infoController");
const playlistController = require("./controllers/playlistController");
const settingController = require("./controllers/settingController");
const tokenController = require("./controllers/tokenController");
const trackController = require("./controllers/trackController")


