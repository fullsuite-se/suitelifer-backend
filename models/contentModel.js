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
        "created_at AS createdAt",
        db.raw(
          "CONCAT(hris_user_infos.first_name, ' ', LEFT(hris_user_infos.middle_name, 1), '. ', hris_user_infos.last_name) AS createdBy"
        )
      )
      .from("sl_content")
      .orderBy("content_id", "desc")
      .first();
  },
};
