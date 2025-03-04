import { db } from "../config/db.js";
import {v4 as uuidv4 } from "uuid";

export const SpotifyEpisode = {
  getAllEpisodes: async () => {
    return await db("sl_spotify_episodes");
  },
  addEpisode: async (episode_id, userId) => {
    await db("sl_spotify_episodes").insert(uuidv4(), episode_id, Date.now(), userId);
  },
};
