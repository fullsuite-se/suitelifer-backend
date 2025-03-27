import { Content } from "../models/contentModel.js";
import { now } from "../utils/date.js";

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
      !homeVideo ||
      !textBanner ||
      !heroImage ||
      !storyImage ||
      !aboutVideo ||
      !missionSlogan ||
      !mission ||
      !visionSlogan ||
      !vision ||
      !dayInPodUrl ||
      !user_id
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const newAboutUs = {
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

    await Content.insertAboutUs(newAboutUs);

    res
      .status(201)
      .json({ success: true, message: "About Us successfully updated" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
