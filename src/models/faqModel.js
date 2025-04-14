import { db } from "../config/db.js";
const table = () => db("sl_faqs");
export const Faq = {
  getAllFaqs: async () => {
    return await db
      .select(
        "faq_id",
        "question",
        "answer",
        "is_shown",
        "created_at",
        db.raw(
          "CONCAT(hris_user_infos.first_name, ' ', LEFT(hris_user_infos.middle_name, 1), '. ', hris_user_infos.last_name) AS createdBy"
        )
      )
      .from("sl_faqs")
      .innerJoin("hris_user_infos", {
        "sl_faqs.created_by": "hris_user_infos.user_id",
      })
      .orderBy("created_at", "asc"); 
  },  insertFaq: async (newFaq) => {
    return await table().insert(newFaq);
  },
  updateFaq: async (faq_id, updatedFaq) => {
    return await table().where({ faq_id }).update(updatedFaq);
  },deleteFaq: async (faq_id) => {
    return await table().where({ faq_id }).del();
  },
};
