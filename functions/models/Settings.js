class Settings {
    constructor(uid, isDarkMode = false, notificationEnabled = true, language = 'ko', connectedPlatforms = []) {
      if (!uid) {
        throw new Error("UID is required");
      }
      this._uid = uid; // private
      this.isDarkMode = isDarkMode;
      this.notificationEnabled = notificationEnabled;
      this.language = language;
      this.connectedPlatforms = connectedPlatforms;
    }
  
    // "uid" getter
    get uid() {
      return this._uid;
    }
}