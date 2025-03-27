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

export const insertContent = async (req, res) => {
  try {
    const { homeVideo, textBanner, heroImage, storyImg, } = req.body;
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}
