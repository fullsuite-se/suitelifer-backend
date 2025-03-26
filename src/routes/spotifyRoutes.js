import express from "express";
import {
  deleteEpisode,
  getEpisodes,
  getThreeLatestEpisodes,
  insertEpisode,
  updateEpisode,
} from "../controllers/spotifyEpisodeController.js";

const router = express.Router();

router.get("/latest-three-episodes", getThreeLatestEpisodes);

router.get("/all-episodes", getEpisodes);

router.post("/add-episode", insertEpisode);

router.post("/update-episode", updateEpisode);

router.post("/delete-episode", deleteEpisode);

export default router;
