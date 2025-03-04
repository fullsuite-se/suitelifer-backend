import { db } from "../config/db.js";
import {v7 as uuidv7 } from "uuid";

export const SpotifyEpisode = {
  getAllEpisodes: async () => {
    return await db("sl_spotify_episodes");
  },
  addEpisode: async (episode_id, userId) => {
    await db("sl_spotify_episodes").insert(uuidv7(), episode_id, Date.now(), userId);
  },
};
