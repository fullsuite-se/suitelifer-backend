import { db } from "../config/db.js";
import { v7 as uuidv7 } from "uuid";

const table = () => db("sl_salary_ranges");

export const SalaryRange = {
  getLastSalaryRange: async () => {
    return await table().orderBy("salary_range_id", "desc").first();
  },
  getSalaryRange: async (salary_range_id) => {
    return await table().where("salary_range_id", salary_range_id);
  },
  insertSalaryRange: async (min_value, max_value) => {
    return await table().insert({
      salary_range_id: uuidv7(),
      min_value,
      max_value,
    });
  },
  updateSalaryRange: async (salary_range_id, min_value, max_value) => {
    return await table()
      .where("salary_range_id", salary_range_id)
      .update({ min_value, max_value })
      .returning(["salary_range_id", "min_value", "max_value"]);
  },
};
