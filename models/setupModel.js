import { db } from "../config/db.js";
import { v7 as uuidv7 } from "uuid";

const table = () => db("sl_company_jobs_setups");

export const Setup = {
  getAllSetups: async () => {
    return await table();
  },
  insertSetup: async (setup_name, user_id) => {
    return await table().insert({
      setup_id: uuidv7(),
      setup_name,
      created_at: new Date().toISOString(),
      created_by: user_id,
    }, ["*"]);
  },
  updateSetup: async (setup_id, setup_name) => {
    return await table()
      .where("setup_id", setup_id)
      .update({ setup_name })
      .returning(["setup_id", "setup_name"]);
  },
  deleteSetup: async (setup_id) => {
    return await table().where("setup_id", setup_id).del();
  },
};
