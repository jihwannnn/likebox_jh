// Playlist model

class Playlist {
  constructor(uid, pid, platform, id, name = "", description = "", coverImageUrl = "", tracks = [], createdAt = 0, updatedAt = 0) {
    if (!uid) {
      throw new Error("UID is required");
    }
    if (!pid) {
      throw new Error("PID is required");
    }
    if (!platform) {
      throw new Error("Platform is required.");
    }
    this._uid = uid; //private
    this._pid = pid; //private
    this._platform = platform; //private
    this._id = pid + platform; //private
    this.name = name;
    this.description = description;
    this.coverImageUrl = coverImageUrl;
    this.tracks = tracks;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  get uid() {
    return this._uid;
  }

  get pid() {
    return this._pid;
  }

  get platform() {
    return this._platform;
  }

  get id() {
    return this._id;
  }
}

module.exports = Playlist;
