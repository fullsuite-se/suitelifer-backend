import express from "express";
import {
  deleteEpisode,
  getEpisodes,
  getLatestEpisode,
  getLatestThreeEpisodes,
  insertEpisode,
  updateEpisode,
} from "../controllers/spotifyEpisodeController.js";

const router = express.Router();

router.get("/latest-episode", getLatestEpisode);

router.get("/latest-three-episodes", getLatestThreeEpisodes);

router.get("/all-episodes", getEpisodes);

router.post("/add-episode", insertEpisode);

router.post("/update-episode", updateEpisode);

router.post("/delete-episode", deleteEpisode);

export default router;
