import { db } from "../config/db.js";

const table = () => db("sl_content");

export const Content = {
  getAboutUs: async () => {
    return await db
      .select(
        "home_video AS homeVideo",
        "text_banner AS textBanner",
        "hero_image AS heroImage",
        "story_img AS storyImg",
        "about_video AS aboutVideo",
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
      .innerJoin("hris_user_infos", {
        "hris_user_infos.user_id": "sl_content.created_by",
      })
      .orderBy("created_at", "desc")
      .first();
  },

  insertAboutUs: async (newAboutUs) => {
    return await table().insert(newAboutUs);
  },
};
