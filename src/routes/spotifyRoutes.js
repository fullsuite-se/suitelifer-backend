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

const router = express.Router();

router.get("/spotify", getEpisodes);

router.get("/spotify/latest-three", getThreeLatestEpisodes);

router.get("/spotify/playlists", getPlaylists);

router.post("/spotify", verifyToken, insertEpisode);

router.put("/spotify/:episodeId", verifyToken, updateEpisode);

router.delete("/spotify/:episodeId", verifyToken, deleteEpisode);

export default router;
