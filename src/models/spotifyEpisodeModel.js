import { db } from "../config/db.js";

const table = () => db("sl_spotify_embeds");

export const SpotifyEpisode = {
  getThreeLatestEpisodes: async () => {
    return await db
      .select(
        "episode_id AS episodeId",
        "spotify_id AS spotifyId",
        "embed_type AS embedType",
        "created_at AS createdAt"
      )
      .where({ embed_type: "EPISODE" })
      .from("sl_spotify_embeds")
      .orderBy("created_at", "desc")
      .limit(3);
  },

  getPlaylists: async () => {
    return await db
      .select(
        "episode_id AS episodeId",
        "spotify_id AS spotifyId",
        "embed_type AS embedType",
        "created_at AS createdAt"
      )
      .from("sl_spotify_embeds")
      .where({ embed_type: "PLAYLIST" })
      .orderBy("created_at", "desc");
  },
  

  getAllEmbeds: async (embedType) => {
    const query = db
      .select(
        "episode_id AS episodeId",
        "spotify_id AS spotifyId",
        "embed_type AS embedType",
        "sl_spotify_embeds.created_at AS createdAt",
        db.raw(
          "CONCAT(sl_user_accounts.first_name, ' ', LEFT(sl_user_accounts.middle_name, 1), '. ', sl_user_accounts.last_name) AS createdBy"
        )
      )
      .from("sl_spotify_embeds")
      .leftJoin("sl_user_accounts", {
        "sl_spotify_embeds.created_by": "sl_user_accounts.user_id",
      });
    
    if (embedType) {
      query.where("embed_type", embedType);
    }

    return await query;
  },

  insertEmbed: async (newEpisode) => {
    return await table().insert(newEpisode);
  },

  updateEmbed: async (episode_id, updates, userId) => {
    return await table().where({ episode_id }).update(updates);
  },

  deleteEmbed: async (episode_id, userId) => {
    return await table().where({ episode_id }).del();
  },
};
