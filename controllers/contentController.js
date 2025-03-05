import { Content } from "../models/contentModel.js";

export const getAboutUs = async (req, res) => {
  try {
    const events = await Content.getAboutUs();
    res.status(200).json(events);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
