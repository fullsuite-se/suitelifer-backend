import express from 'express';
import { getEpisodes, insertEpisode } from '../controllers/spotifyEpisodeController.js';

const router = express.Router();

router.get("/episodes", getEpisodes);

router.post("/episodes", insertEpisode);

export default router;

// hello