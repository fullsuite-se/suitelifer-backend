import { db } from "../config/db.js";

const table = () => db("sl_privacy_policy");

export const PrivacyPolicy = {
  getAllPolicies: async () => {
    return await db
      .select(
        "policy_id AS policyId",
        "title",
        "description",
        "sl_privacy_policy.created_at AS createdAt",
        db.raw(`
          CONCAT(
            first_name, ' ',
            IF(middle_name IS NOT NULL AND middle_name != '', CONCAT(LEFT(middle_name, 1), '. '), ''),
            last_name
          ) AS createdBy
        `)
      )
      .from("sl_privacy_policy")
      .innerJoin("sl_user_accounts", {
        "sl_privacy_policy.created_by": "sl_user_accounts.user_id",
      });
  },

  addPolicy: async (data) => {
    return await table().insert(data);
  },

  updatePolicy: async (id, data) => {
    return await table().where({ policy_id: id }).update(data);
  },

  deletePolicy: async (id) => {
    return await table().where({ policy_id: id }).del();
  },
};
