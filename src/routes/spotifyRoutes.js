import express from "express";
import {
  deleteEpisode,
  getEpisodes,
  getThreeLatestEpisodes,
  insertEpisode,
  updateEpisode,
} from "../controllers/spotifyEpisodeController.js";

const router = express.Router();

router.get("/spotify", getEpisodes);

router.get("/spotify/latest-three", getThreeLatestEpisodes);

router.post("/spotify", insertEpisode);

router.put("/spotify/:episodeId", updateEpisode);

router.delete("/spotify/:episodeId", deleteEpisode);

export default router;
