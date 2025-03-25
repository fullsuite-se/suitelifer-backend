import { db } from "../config/db.js";

const table = () => db("sl_personality_tests");

export const PersonalityTest = {
  getAllPersonalityTests: async () => {
    return await db
      .select(
        "test_id AS testId",
        "test_title AS testTitle",
        "url",
        "created_at AS createdAt",
        db.raw(
          "CONCAT(hris_user_infos.first_name, ' ', LEFT(hris_user_infos.middle_name, 1), '. ', hris_user_infos.last_name) AS createdBy"
        )
      )
      .from("sl_personality_tests")
      .innerJoin("hris_user_infos", {
        "sl_personality_tests.created_by": "hris_user_infos.user_id",
      });
  },

  insertPersonalityTest: async (newPersonalityTest) => {
    return await table().insert(newPersonalityTest);
  },

  updatePersonalityTest: async (test_id, updatedPersonalityTest) => {
    return await table().where({ test_id }).update(updatedPersonalityTest);
  },

  deletePersonalityTest: async (test_id) => {
    return await table(0).where({ test_id }).del();
  },
};
