import { db } from "../config/db.js";

const contentTable = () => db("sl_content");

export const Content = {
  getHome: async () => {
    return await contentTable()
      .select(
        "content_id AS contentId",
        // "get_in_touch_image AS getInTouchImage",
        "kickstart_video AS kickstartVideo",
        "sl_content.created_at AS createdAt"
      )
      .orderBy("sl_content.created_at", "desc")
      .first();
  },

  patchHome: async (kickstart_video, content_id) => {
    return await contentTable()
      .update({ kickstart_video })
      .where({ content_id });
  },

  getAboutUs: async () => {
    return await contentTable()
      .select(
        "text_banner AS textBanner",
        "hero_image AS heroImage",
        "story_image AS storyImage",
        "about_video AS aboutVideo",
        "team_player_video AS teamPlayerVideo",
        "understood_video AS understoodVideo",
        "focused_video AS focusedVideo",
        "upholds_video AS upholdsVideo",
        "harmony_video AS harmonyVideo",
        "mission_slogan AS missionSlogan",
        "mission",
        "mission_video AS missionVideo",
        "vision_slogan AS visionSlogan",
        "vision",
        "vision_video AS visionVideo",
        "day_in_pod_url AS dayInPodUrl",
        "sl_content.created_at AS createdAt"
      )
      .orderBy("sl_content.created_at", "desc")
      .first();
  },

  getCareers: async () => {
    return await contentTable()
      .select(
        "careers_main_image AS careersMainImage",
        "careers_left_image AS careersLeftImage",
        "careers_right_image AS careersRightImage",
        "sl_content.created_at AS createdAt"
      )
      .orderBy("sl_content.created_at", "desc")
      .first();
  },

  getContact: async () => {
    return await contentTable()
      .select(
        "contact_email AS contactEmail",
        "contact_landline AS contactLandline",
        "contact_phone AS contactPhone",
        "sl_content.created_at AS createdAt"
      )
      .orderBy("sl_content.created_at", "desc")
      .first();
  },

  getAllContent: async () => {
    return await contentTable()
      .innerJoin("sl_user_accounts", {
        "sl_user_accounts.user_id": "sl_content.created_by",
      })
      .select(
        "get_in_touch_image AS getInTouchImage",
        "home_video AS homeVideo",
        "text_banner AS textBanner",
        "hero_image AS heroImage",
        "story_image AS storyImage",
        "about_video AS aboutVideo",
        "team_player_video AS teamPlayerVideo",
        "understood_video AS understoodVideo",
        "focused_video AS focusedVideo",
        "upholds_video AS upholdsVideo",
        "harmony_video AS harmonyVideo",
        "mission_slogan AS missionSlogan",
        "mission",
        "mission_video AS missionVideo",
        "vision_slogan AS visionSlogan",
        "vision",
        "vision_video AS visionVideo",
        "day_in_pod_url AS dayInPodUrl",
        "careers_main_image AS careersMainImage",
        "careers_left_image AS careersLeftImage",
        "careers_right_image AS careersRightImage",
        "contact_email AS contactEmail",
        "contact_landline AS contactLandline",
        "contact_phone AS contactPhone",
        "sl_content.created_at AS createdAt",
        db.raw(
          "CONCAT(sl_user_accounts.first_name, ' ', LEFT(sl_user_accounts.middle_name, 1), '. ', sl_user_accounts.last_name) AS createdBy"
        )
      )
      .orderBy("sl_content.created_at", "desc")
      .first();
  },

  insertContent: async (newAboutUs) => {
    return await contentTable().insert(newAboutUs);
  },
};
