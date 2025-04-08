import { SpotifyEpisode } from "../models/spotifyEpisodeModel.js";
import { v7 as uuidv7 } from "uuid";
import { now } from "../utils/date.js";

export const getThreeLatestEpisodes = async (req, res) => {
  try {
    const threeLatestEpisodes = await SpotifyEpisode.getThreeLatestEpisodes();
    res.status(200).json({ success: true, threeLatestEpisodes });
  } catch (err) {
    console.error("Error fetching latest three episodes:", err.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getEpisodes = async (req, res) => {
  try {
    const episodes = await SpotifyEpisode.getAllEmbeds();
    res.status(200).json({ success: true, data: episodes });
  } catch (err) {
    console.error("Error fetching episodes:", err.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const insertEpisode = async (req, res) => {
  try {
    const { url, userId } = req.body;

    const embedType = url.indexOf("episode/") !== -1 ? "EPISODE" : "PLAYLIST";

    // VALIDATE REQUIRED FIELDS
    if (!url || !userId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: url or user id",
      });
    }

    // EXTRACT ID FROM THE URL
    const parts = url.split(embedType === "EPISODE" ? "episode/" : "playlist/");
    if (parts.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Invalid URL format",
      });
    }

    const spotify_id = parts[1].split("?")[0];

    const newEpisode = {
      episode_id: uuidv7(),
      spotify_id,
      embed_type: embedType,
      created_at: now(),
      created_by: userId,
    };

    // INSERT EPISODE INTO THE DATABASE
    await SpotifyEpisode.insertEmbed(newEpisode);

    res.status(201).json({
      success: true,
      message: "Episode added successfully",
    });

    // TODO: LOG SPOTIFY EMBED INSERT
  } catch (err) {
    console.error("Error inserting episode:", err.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateEpisode = async (req, res) => {
  try {
    const { episodeId, url, userId } = req.body;

    // VALIDATE REQUIRED FIELDS
    if (!episodeId || !url) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: episode id or url",
      });
    }

    const embedType = url.indexOf("episode/") !== -1 ? "EPISODE" : "PLAYLIST";

    // EXTRACT ID FROM THE URL
    const parts = url.split(embedType === "EPISODE" ? "episode/" : "playlist/");
    if (parts.length < 2) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid URL format" });
    }

    const spotify_id = parts[1].split(/[?#]/)[0];

    const updates = {
      embed_type: embedType,
      spotify_id,
    };

    // ATTEMPT TO UPDATE THE EPISODE
    const updatedEpisode = await SpotifyEpisode.updateEmbed(
      episodeId,
      updates,
      userId
    );

    if (!updatedEpisode) {
      return res.status(404).json({
        success: false,
        message: "Episode not found or not updated",
      });
    }

    res.status(200).json({
      success: true,
      message: "Episode updated successfully",
      data: updateEpisode,
    });

    // TODO: LOG SPOTIFY EMBED UPDATE
  } catch (err) {
    console.error("Error updating episode:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const deleteEpisode = async (req, res) => {
  try {
    const { episodeId, userId } = req.body;

    // VALIDATE REQUIRED FIELD
    if (!episodeId) {
      return res.status(400).json({
        success: false,
        message: "Missing: episode id",
      });
    }

    // ATTEMPT TO DELETE THE EPISODE
    const deletedEpisode = await SpotifyEpisode.deleteEmbed(episodeId, userId);

    if (!deletedEpisode) {
      return res.status(404).json({
        success: false,
        message: "Episode not found or already deleted",
      });
    }

    res.status(200).json({
      success: true,
      message: "Episode deleted successfully",
    });

    // TODO: LOG SPOTIFY EMBED DELETE
  } catch (err) {
    console.error("Error deleting episode:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
