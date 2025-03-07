import { SpotifyEpisode } from "../models/spotifyEpisodeModel.js";

export const getLatestEpisode = async (req, res) => {
  try {
    const latestEpisode = await SpotifyEpisode.getLatestEpisode();
    res.status(200).json({ success: true, data: latestEpisode });
  } catch (err) {
    console.error("Error fetching latest episode:", err.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getLatestThreeEpisodes = async (req, res) => {
  try {
    const latestThreeEpisodes = await SpotifyEpisode.getLatestThreeEpisodes();
    res.status(200).json({ success: true, data: latestThreeEpisodes });
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
    const episodes = await SpotifyEpisode.getAllEpisodes();
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
    const { url, user_id } = req.body;

    // VALIDATE REQUIRED FIELDS
    if (!url || !user_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: url or userId",
      });
    }

    // EXTRACT ID FROM THE URL
    const parts = url.split("episodes/");
    if (parts.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Invalid URL format",
      });
    }

    const id = parts[1].split("?")[0];

    // INSERT EPISODE INTO THE DATABASE
    await SpotifyEpisode.addEpisode(id, user_id);

    res.status(201).json({
      success: true,
      message: "Episode added successfully",
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
    const { episode_id, url, user_id } = req.body;

    // VALIDATE REQUIRED FIELDS
    if (!episode_id || !url) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: episode_id or url",
      });
    }

    // EXTRACT ID FROM THE URL
    const parts = url.split("episodes/");
    if (parts.length < 2) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid URL format" });
    }

    const id = parts[1].split("?")[0];

    // ATTEMPT TO UPDATE THE EPISODE
    const updatedEpisode = await SpotifyEpisode.updateEpisode(
      episode_id,
      id,
      user_id
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
    const { episode_id, user_id } = req.body;

    // VALIDATE REQUIRED FIELD
    if (!episode_id) {
      return res.status(400).json({
        success: false,
        message: "Missing: episode id",
      });
    }

    // ATTEMPT TO DELETE THE EPISODE
    const deletedEpisode = await SpotifyEpisode.deleteEpisode(episode_id);

    if (!deleteEpisode) {
      return res.status(404).json({
        success: false,
        message: "Episode not found or already deleted",
      });
    }

    res.status(200).json({
      success: true,
      message: "Episode deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting episode:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
