import { Content } from "../models/contentModel.js";
import { now } from "../utils/date.js";
import { v7 as uuidv7 } from "uuid";

export const getHome = async (req, res) => {
  try {
    const homeContent = await Content.getAboutUs();
    res.status(200).json({ success: true, homeContent });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getAboutUs = async (req, res) => {
  try {
    const aboutContent = await Content.getAboutUs();
    res.status(200).json({ success: true, aboutContent });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getCareers = async (req, res) => {
  try {
    const careersContent = await Content.getCareers();

    res.status(200).json({ success: true, careersContent });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getContact = async (req, res) => {
  try {
    const contactContent = await Content.getContact();

    res.status(200).json({ success: true, contactContent });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getAllContent = async (req, res) => {
  try {
    const content = await Content.getAllContent();
    res.status(200).json({ success: true, content });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const insertContent = async (req, res) => {
  try {
    const {
      homeVideo,
      textBanner,
      heroImage,
      storyImage,
      aboutVideo,
      missionSlogan,
      mission,
      visionSlogan,
      vision,
      dayInPodUrl,
      user_id,
    } = req.body;

    if (
      homeVideo === undefined ||
      textBanner === undefined ||
      heroImage === undefined ||
      storyImage === undefined ||
      aboutVideo === undefined ||
      missionSlogan === undefined ||
      mission === undefined ||
      visionSlogan === undefined ||
      vision === undefined ||
      dayInPodUrl === undefined ||
      !user_id
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const newAboutUs = {
      content_id: uuidv7(),
      home_video: homeVideo,
      text_banner: textBanner,
      hero_image: heroImage,
      story_image: storyImage,
      about_video: aboutVideo,
      mission_slogan: missionSlogan,
      mission,
      vision_slogan: visionSlogan,
      vision,
      day_in_pod_url: dayInPodUrl,
      created_at: now(),
      created_by: user_id,
    };

    await Content.insertContent(newAboutUs);

    res
      .status(201)
      .json({ success: true, message: "About Us successfully updated" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
