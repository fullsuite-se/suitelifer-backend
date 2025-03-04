import { SpotifyEpisode } from "../models/spotifyEpisodeModel.js";

export const getEpisodes = async (req, res) => {
  try {
    const episodes = await SpotifyEpisode.getAllEpisodes();
    res.status(200).json(episodes);
  } catch (err) {
    console.log(err);
  }
};

export const insertEpisode = async (req, res) => {
  try {
    console.log(req.body);
    const { url, userId } = req.body;

    if (!url || !userId) {
      return res
        .status(400)
        .json({ error: "Missing required fields: url or userId" });
    }

    const parts = url.split("episodes/");
    if (parts.length < 2) {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    const episode_id = parts[1].split("?")[0];

    await SpotifyEpisode.addEpisode(episode_id, userId);

    res.status(201).json({ message: "Episode added successfully", episode_id });
  } catch (err) {
    console.error("Error inserting episode:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
