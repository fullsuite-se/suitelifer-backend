import { SpotifyEpisode as SpotifyEmbed } from "../models/spotifyEpisodeModel.js";
import { v7 as uuidv7 } from "uuid";
import { now } from "../utils/date.js";

export const getThreeLatestEpisodes = async (req, res) => {
  try {
    const threeLatestEpisodes = await SpotifyEmbed.getThreeLatestEpisodes();
    res.status(200).json({ success: true, threeLatestEpisodes });
  } catch (err) {
    console.error("Error fetching latest three episodes:", err.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getPlaylists = async (req, res) => {
  try {
    const playlists = await SpotifyEmbed.getPlaylists();
    res.status(200).json({ success: true, playlists });
  } catch (err) {
    console.error("Error fetching playlists:", err.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getEmbeds = async (req, res) => {
  try {
    const { embedType } = req.query;
    const episodes = await SpotifyEmbed.getAllEmbeds(embedType);
    
    res.status(200).json({ 
      success: true, 
      data: episodes,
      episodes: episodes, // Add this for backward compatibility
      count: episodes.length 
    });
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

    if (!url || !userId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: url or user id",
      });
    }

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

    await SpotifyEmbed.insertEmbed(newEpisode);

    res.status(201).json({
      success: true,
      message: `${embedType} added successfully`,
    });
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

    if (!episodeId || !url) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: episode id or url",
      });
    }

    const embedType = url.indexOf("episode/") !== -1 ? "EPISODE" : "PLAYLIST";

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

    const updatedEpisode = await SpotifyEmbed.updateEmbed(
      episodeId,
      updates,
      userId
    );

    if (!updatedEpisode) {
      return res.status(404).json({
        success: false,
        message: `${embedType} not found or not updated`,
      });
    }

    res.status(200).json({
      success: true,
      message: `${embedType} updated successfully`,
      data: updatedEpisode, // Fixed typo: was updateEpisode, now updatedEpisode
    });
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

    if (!episodeId) {
      return res.status(400).json({
        success: false,
        message: "Missing: episode id",
      });
    }

    const deletedEpisode = await SpotifyEmbed.deleteEmbed(episodeId, userId);

    if (!deletedEpisode) {
      return res.status(404).json({
        success: false,
        message: `Spotify link not found or already deleted`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Spotify link deleted successfully`,
    });
  } catch (err) {
    console.error("Error deleting episode:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};