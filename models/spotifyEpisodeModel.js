import knex from "knex";
import { db } from "../config/db.js";
import { v7 as uuidv7 } from "uuid";

const table = () => db("sl_spotify_episodes");

export const SpotifyEpisode = {
  getAllEpisodes: async () => {
    return await db
      .select("*")
      .from("sl_spotify_episodes")
      .join("hris_user_accounts", {
        "sl_spotify_episodes.created_by": "hris_user_accounts.user_id",
      })
      .join("hris_user_info", {
        "hris_user_accounts.user_id": "hris_user_info.user_id",
      });
  },
  insertEpisode: async (id, user_id) => {
    return await table().insert(
      {
        episode_id: uuidv7(),
        id,
        created_at: new Date().toISOString(),
        created_by: user_id,
      },
      ["*"]
    );
  },
  updateEpisode: async (episode_id, id, user_id) => {
    return await table()
      .where({ episode_id })
      .update({ id })
      .returning(["episode_id", "id"]);
  },
  deleteEpisode: async (episode_id) => {
    return await table().where("episode_id", episode_id).del();
  },
};
