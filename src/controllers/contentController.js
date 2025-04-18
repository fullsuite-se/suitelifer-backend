import { Content } from "../models/contentModel.js";
import { now } from "../utils/date.js";
import { v7 as uuidv7 } from "uuid";
import { youtubeLinkToEmbed } from "../utils/youtubeEmbed.js";

export const getHome = async (req, res) => {
  try {
    const homeContent = await Content.getHome();
    res.status(200).json({ success: true, homeContent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const patchHome = async (req, res) => {
  try {
    const { contentId, kickstartVideo } = req.body;

    const kickstartEmbed = youtubeLinkToEmbed(kickstartVideo);

    console.log(kickstartEmbed);

    await Content.patchHome(kickstartEmbed, contentId);

    res
      .status(200)
      .json({ success: true, message: "Home Content Successfully Updated!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getAbout = async (req, res) => {
  try {
    const aboutContent = await Content.getAboutUs();
    res.status(200).json({ success: true, aboutContent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const patchAbout = async (req, res) => {
  try {
    const {
      contentId,
      textBanner,
      aboutHeroImage,
      aboutBackgroundImage,
      teamPlayerVideo,
      understoodVideo,
      focusedVideo,
      upholdsVideo,
      harmonyVideo,
      missionSlogan,
      visionSlogan,
      mission,
      vision,
      missionVideo,
      visionVideo,
      dayInPodUrl,
    } = req.body;

    if (
      !contentId ||
      !textBanner ||
      !aboutHeroImage ||
      !aboutBackgroundImage ||
      !teamPlayerVideo ||
      !understoodVideo ||
      !focusedVideo ||
      !upholdsVideo ||
      !harmonyVideo ||
      // !missionSlogan ||
      !visionSlogan ||
      !mission ||
      !vision ||
      !missionVideo ||
      !visionVideo ||
      !dayInPodUrl
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }

    const updates = {
      text_banner: textBanner,
      about_background_image: aboutBackgroundImage,
      about_hero_image: aboutHeroImage,
      team_player_video: teamPlayerVideo,
      understood_video: understoodVideo,
      focused_video: focusedVideo,
      upholds_video: upholdsVideo,
      harmony_video: harmonyVideo,
      mission_slogan: missionSlogan,
      mission,
      mission_video: missionVideo,
      vision_slogan: visionSlogan,
      vision,
      vision_video: visionVideo,
      day_in_pod_url: dayInPodUrl,
    };

    await Content.patchAboutUs(updates, contentId);

    res
      .status(200)
      .json({ success: true, message: "About Content Updates Successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getCareers = async (req, res) => {
  try {
    const careersContent = await Content.getCareers();

    res.status(200).json({ success: true, careersContent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const patchCareers = async (req, res) => {
  try {
    const { contentId, careersLeftImage, careersMainImage, careersRightImage } =
      req.body;

    console.log("L: " + careersLeftImage);
    console.log("M: " + careersMainImage);
    console.log("R: " + careersRightImage);

    const updates = {
      careers_left_image: careersLeftImage,
      careers_main_image: careersMainImage,
      careers_right_image: careersRightImage,
    };

    await Content.patchCareers(updates, contentId);

    res.status(200).json({
      success: true,
      message: "Careers Page Images Updates Successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getContact = async (req, res) => {
  try {
    const contactContent = await Content.getContact();

    res.status(200).json({ success: true, contactContent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getAllContent = async (req, res) => {
  try {
    const content = await Content.getAllContent();
    res.status(200).json({ success: true, content });
  } catch (err) {
    console.error(err);
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
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
