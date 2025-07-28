import express from "express";
import {
  deleteEpisode,
  getEpisodes,
  getPlaylists,
  getThreeLatestEpisodes,
  insertEpisode,
  updateEpisode,
} from "../controllers/spotifyEpisodeController.js";
import verifyToken from "../middlewares/verifyToken.js";
import verifyAdmin from "../middlewares/verifyAdmin.js";

const router = express.Router();

router.get("/spotify", getEpisodes);

router.get("/spotify/latest-three", getThreeLatestEpisodes);

router.get("/spotify/playlists", getPlaylists);

router.post("/spotify", verifyToken, verifyAdmin, insertEpisode);

router.put("/spotify/:episodeId", verifyToken, verifyAdmin, updateEpisode);

router.delete("/spotify/:episodeId", verifyToken, verifyAdmin, deleteEpisode);

export default router;
