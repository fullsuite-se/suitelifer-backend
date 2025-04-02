import { db } from "../config/db.js";

const table = () => db("sl_company_jobs_setups");

export const Setup = {
  getAllSetups: async () => {
    return await db
      .select(
        "setup_id AS setupId",
        "setup_name AS setupName",
        "created_at AS createdAt",
        db.raw(
          "CONCAT(hris_user_infos.first_name, ' ', LEFT(hris_user_infos.middle_name, 1), '. ', hris_user_infos.last_name) AS createdBy"
        )
      )
      .from("sl_company_jobs_setups")
      .innerJoin("hris_user_infos", {
        "hris_user_infos.user_id": "sl_company_jobs_setups.created_by",
      });
  },
  insertSetup: async (newSetup) => {
    return await table().insert(newSetup);
  },
  updateSetup: async (setup_id, setup_name) => {
    return await table().where("setup_id", setup_id).update({ setup_name });
  },
  deleteSetup: async (setup_id) => {
    return await table().where("setup_id", setup_id).del();
  },
};
