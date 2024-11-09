const { logger } = require("firebase-functions/v2");
const { getFirestore } = require("firebase-admin/firestore");
const db = getFirestore();
const Playlist = require("../models/Playlist");

// db에 Playlist 저장
async function savePlaylist(playlist) {
  try {
    // debugging log
    logger.info("service phase start");

    // db ref 가져오기
    const playlistRef = db.collection("Playlists").doc(playlist.uid).collection("User_playlists").doc(playlist.id);

    // 해당 ref에 저장
    await playlistRef.set(
      {
        pid: playlist.pid,
        platform: playlist.platform,
        name: playlist.name,
        description: playlist.description,
        coverImageUrl: playlist.coverImageUrl,
        tracks: playlist.tracks,
        createdAt: playlist.createdAt,
        updatedAt: playlist.updatedAt,
      },
      { merge: false }
    );

    // debugging log
    logger.info("service phase finish");
  } catch (error) {
    logger.error("Error: Service, saving playlist:", error);
    throw error;
  }
}

// db에서 Playlist 가져오기
async function getPlaylist(uid, id) {
  try {
    // debugging log
    logger.info("service phase start");

    const playlistRef = db.collection("Playlists").doc(uid).collection("User_playlists").doc(id);
    const playlistDoc = await playlistRef.get();

    if (!playlistDoc.exists) {
      throw new Error("Playlist not found");
    }

    const playlistData = playlistDoc.data();
    const playlist = new Playlist(
      uid,
      playlistData.pid,
      playlistData.platform,
      id,
      playlistData.name,
      playlistData.description,
      playlistData.coverImageUrl,
      playlistData.tracks,
      playlistData.createdAt,
      playlistData.updatedAt
    );

    // debugging log
    logger.info("service phase finish");
    return playlist;
  } catch (error) {
    logger.error("Error: Service, retrieving playlist:", error);
    throw error;
  }
}

// db에서 모든 Playlist 가져오기
async function getAllPlaylists(uid) {
  try {
    // debugging log
    logger.info("service phase start");

    const playlists = [];
    const playlistsRef = db.collection("Playlists").doc(uid).collection("User_playlists");
    const snapshot = await playlistsRef.get();

    snapshot.forEach((doc) => {
      const data = doc.data();
      playlists.push(
        new Playlist(
          uid,
          data.pid,
          data.platform,
          doc.id,
          data.name,
          data.description,
          data.coverImageUrl,
          data.tracks,
          data.createdAt,
          data.updatedAt
        )
      );
    });

    // debugging log
    logger.info("service phase finish");
    return playlists;
  } catch (error) {
    logger.error("Error: Service, retrieving all playlists:", error);
    throw error;
  }
}

module.exports = { savePlaylist, getPlaylist, getAllPlaylists };
