import express from "express";
import {
  deleteEpisode,
  getEmbeds,
  getPlaylists,
  getThreeLatestEpisodes,
  insertEpisode,
  updateEpisode,
} from "../controllers/spotifyEpisodeController.js";
import verifyToken from "../middlewares/verifyToken.js";
import verifyAdmin from "../middlewares/verifyAdmin.js";

const router = express.Router();

// Get all embeds (episodes and playlists) - supports optional embedType query param
router.get("/spotify", getEmbeds);

// Get all episodes specifically (for the modal)
router.get("/spotify/episodes", getEmbeds);

// Get latest three episodes
router.get("/spotify/latest-three", getThreeLatestEpisodes);

// Get all playlists
router.get("/spotify/playlists", getPlaylists);

// Admin routes for managing episodes
router.post("/spotify", verifyToken, verifyAdmin, insertEpisode);

router.put("/spotify/:episodeId", verifyToken, verifyAdmin, updateEpisode);

router.delete("/spotify/:episodeId", verifyToken, verifyAdmin, deleteEpisode);

export default router;