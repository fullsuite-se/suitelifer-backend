import { db } from "../config/db.js";

const table = () => db("sl_terms_of_use");

export const TermsOfUse = {
  getAllTerms: async () => {
    return await db
      .select(
        "terms_id AS termsId",
        "title",
        "description",
        "sl_terms_of_use.created_at AS createdAt",
        db.raw(`
          CONCAT(
            first_name, ' ',
            IF(middle_name IS NOT NULL AND middle_name != '', CONCAT(LEFT(middle_name, 1), '. '), ''),
            last_name
          ) AS createdBy
        `)
      )
      .from("sl_terms_of_use")
      .innerJoin("sl_user_accounts", {
        "sl_terms_of_use.created_by": "sl_user_accounts.user_id",
      });
  },

  addTerms: async (data) => {
    return await table().insert(data);
  },

  updateTerms: async (id, data) => {
    return await table().where({ terms_id: id }).update(data);
  },

  deleteTerms: async (id) => {
    return await table().where({ terms_id: id }).del();
  },
};
