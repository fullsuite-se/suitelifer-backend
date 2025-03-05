import { db } from "../config/db.js";
import { v7 as uuidv7 } from "uuid";

const table = db("sl_company_jobs_setups");

export const Setup = {
  getAllSetups: async () => {
    return await table;
  },
  insertSetup: async (setup_name, user_id) => {
    await table.insert(uuidv7(), setup_name, Date.now(), user_id);
  },
  updateSetup: async (setup_id, setup_name) => {
    await table
      .where("setup_id", setup_id)
      .update({ setup_name: setup_name }, ["setup_id", "setup_name"]);
  },
  deleteSetup: async (setup_id) => {
    await table.where("setup_id", setup_id).del();
  },
};
