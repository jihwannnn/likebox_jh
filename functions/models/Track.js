// Track model

class Track {
  constructor(uid, tid, source, name = "", artist = "", albumName = "", albumArtUrl = "", durationMs = 0) {
    if (!uid) {
      throw new Error("UID is required");
    }
    if (!tid) {
      throw new Error("TID is required");
    }
    this._uid = uid; //private
    this._tid = tid; //private
    this.name = name;
    this.artist = artist;
    this.albumName = albumName;
    this.albumArtUrl = albumArtUrl;
    this.durationMs = durationMs;
  }

  get uid() {
    return this._uid;
  }

  get tid() {
    return this._tid;
  }
}

module.exports = Track