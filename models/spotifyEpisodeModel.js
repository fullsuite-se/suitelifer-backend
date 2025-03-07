import knex from "knex";
import { db } from "../config/db.js";
import { v7 as uuidv7 } from "uuid";
import { now } from "../utils/date.js";

const table = () => db("sl_spotify_episodes");

export const SpotifyEpisode = {
  getLatestEpisode: async () => {
    return await db
      .select(
        "episode_id AS episodeId",
        "id AS spotifyId",
        "created_at AS createdAt"
      )
      .from("sl_spotify_episodes")
      .orderBy("created_at", "desc")
      .first();
  },
  getLatestThreeEpisodes: async () => {
    return await db
      .select(
        "episode_id AS episodeId",
        "id AS spotifyId",
        "created_at AS createdAt"
      )
      .from("sl_spotify_episodes")
      .orderBy("created_at", "desc")
      .limit(3);
  },
  getAllEpisodes: async () => {
    return await db
      .select(
        "episode_id AS episodeId",
        "id AS spotifyId",
        "sl_spotify_episodes.created_at AS createdAt",
        db.raw(
          "CONCAT(hris_user_infos.first_name, ' ', LEFT(hris_user_infos.middle_name, 1), '. ', hris_user_infos.last_name) AS createdBy"
        )
      )
      .from("sl_spotify_episodes")
      .join("hris_user_accounts", {
        "sl_spotify_episodes.created_by": "hris_user_accounts.user_id",
      })
      .join("hris_user_infos", {
        "hris_user_accounts.user_id": "hris_user_infos.user_id",
      });
  },
  insertEpisode: async (id, user_id) => {
    return await table().insert({
      episode_id: uuidv7(),
      id,
      created_at: now(),
      created_by: user_id,
    });
  },
  updateEpisode: async (episode_id, id, user_id) => {
    return await table().where({ episode_id }).update({ id });
  },
  deleteEpisode: async (episode_id) => {
    return await table().where("episode_id", episode_id).del();
  },
};
