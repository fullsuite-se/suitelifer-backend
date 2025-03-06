import { Content } from "../models/contentModel.js";

export const getAboutUs = async (req, res) => {
  try {
    const events = await Content.getAboutUs();
    res.status(200).json({ success: true, data: events });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
