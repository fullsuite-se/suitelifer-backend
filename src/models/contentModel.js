import { db } from "../config/db.js";

export const Content = {
  getAboutUs: async () => {
    return await db
      .select(
        "hero_video AS heroVideo",
        "text_banner AS textBanner",
        "hero_image AS heroImage",
        "story_img AS storyImg",
        "mission_slogan AS missionSlogan",
        "mission",
        "vision_slogan AS visionSlogan",
        "vision",
        "day_in_pod_url AS dayInPodUrl",
        "sl_content.created_at AS createdAt",
      )
      .from("sl_content")
      .orderBy("created_at", "desc")
      .first();
  },
};
