const { logger } = require("firebase-functions/v2");
const { getFirestore } = require("firebase-admin/firestore");
const db = getFirestore();
const Track = require("../models/Track");

// db에 Track 저장
async function saveTrack(track) {
  try {
    // debugging log
    logger.info("service phase start");

    // db ref 가져오기
    const trackRef = db.collection("Tracks").doc(track.uid).collection("User_tracks").doc(track.tid);

    // 해당 ref에 저장
    await trackRef.set(
      {
        name: track.name,
        artist: track.artist,
        albumName: track.albumName,
        albumArtUrl: track.albumArtUrl,
        durationMs: track.durationMs
      },
      { merge: true } // 기존에 있다면 병합
    );

    // debugging log
    logger.info("service phase finish");
  } catch (error) {
    logger.error("Error: Service, saving track:", error);
    throw error;
  }
}

// db에서 Track 가져오기
async function getTrack(uid, tid) {
  try {
    // debugging log
    logger.info("service phase start");

    const trackRef = db.collection("Tracks").doc(uid).collection("User_tracks").doc(tid);
    const trackDoc = await trackRef.get();

    if (!trackDoc.exists) {
      throw new Error("Track not found");
    }

    const trackData = trackDoc.data();
    const track = new Track(
      uid,
      tid,
      trackData.source,
      trackData.name,
      trackData.artist,
      trackData.albumName,
      trackData.albumArtUrl,
      trackData.durationMs
    );

    // debugging log
    logger.info("service phase finish");
    return track;
  } catch (error) {
    logger.error("Error: Service, retrieving track:", error);
    throw error;
  }
}

// db에서 모든 Track 가져오기
async function getAllTracks(uid) {
  try {
    // debugging log
    logger.info("service phase start");

    const tracks = [];
    const tracksRef = db.collection("Tracks").doc(uid).collection("User_tracks");
    const snapshot = await tracksRef.get();

    snapshot.forEach((doc) => {
      const data = doc.data();
      tracks.push(
        new Track(
          uid,
          doc.id,
          data.source,
          data.name,
          data.artist,
          data.albumName,
          data.albumArtUrl,
          data.durationMs
        )
      );
    });

    // debugging log
    logger.info("service phase finish");
    return tracks;
  } catch (error) {
    logger.error("Error: Service, retrieving all tracks:", error);
    throw error;
  }
}

module.exports = { saveTrack, getTrack, getAllTracks };
