import { db } from "../config/db.js";

const table = () => db("sl_personality_tests");

export const PersonalityTest = {
  getAllPersonalityTests: async () => {
    return await db
      .select(
        "test_id AS testId",
        "test_title AS testTitle",
        "test_url AS testUrl",
        "test_description AS testDescription",
        "sl_personality_tests.created_at AS createdAt",
        db.raw(
          "CONCAT(sl_user_accounts.first_name, ' ', LEFT(sl_user_accounts.middle_name, 1), '. ', sl_user_accounts.last_name) AS createdBy"
        )
      )
      .from("sl_personality_tests")
      .innerJoin("sl_user_accounts", {
        "sl_personality_tests.created_by": "sl_user_accounts.user_id",
      });
  },

  insertPersonalityTest: async (newPersonalityTest) => {
    return await table().insert(newPersonalityTest);
  },

  updatePersonalityTest: async (test_id, updatedDetails) => {
    return await table().where({ test_id }).update(updatedDetails);
  },

  deletePersonalityTest: async (test_id) => {
    return await table().where({ test_id }).del();
  },
};
