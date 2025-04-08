import express from "express";
import {
  deleteEpisode,
  getEpisodes,
  getPlaylists,
  getThreeLatestEpisodes,
  insertEpisode,
  updateEpisode,
} from "../controllers/spotifyEpisodeController.js";

const router = express.Router();

router.get("/spotify", getEpisodes);

router.get("/spotify/latest-three", getThreeLatestEpisodes);

router.get("/spotify/playlists", getPlaylists);

router.post("/spotify", insertEpisode);

router.put("/spotify/:episodeId", updateEpisode);

router.delete("/spotify/:episodeId", deleteEpisode);

export default router;
