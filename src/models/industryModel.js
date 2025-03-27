import { db } from "../config/db.js";
import { v7 as uuidv7 } from "uuid";

const table = () => db("sl_job_industries");

export const Industry = {
  getAllIndustries: async () => {
    return db
      .select(
        "job_ind_id AS industryId",
        "industry_name AS industryName",
        "assessment_url AS assessmentUrl"
      )
      .from("sl_job_industries");
  },
  getAllIndustriesHR: async () => {
    return db
      .select(
        "job_ind_id AS industryId",
        "industry_name AS industryName",
        "assessment_url AS assessmentUrl",
        db.raw(
          "CONCAT(hris_user_infos.first_name, ' ', LEFT(hris_user_infos.middle_name, 1), '. ', hris_user_infos.last_name) AS createdBy"
        ),
        "created_at AS createdAt"
      )
      .from("sl_job_industries")
      .join("hris_user_infos", {
        "hris_user_infos.user_id": "sl_job_industries.created_by",
      });
  },
  getAllIndustriesPR: async () => {
    return db
      .select(
        "job_ind_id AS industryId",
        "industry_name AS industryName",
        "image_url AS imageUrl"
      )
      .from("sl_job_industries");
  },
  insertIndustry: async (newIndustry) => {
    return await table().insert(newIndustry);
  },
  updateIndustry: async (industry_id, updatedIndustry) => {
    console.log(industry_id);

    return table().where({ job_ind_id: industry_id }).update(updatedIndustry);
  },
  deleteIndustry: async (industry_id) => {
    return table().where({ job_ind_id: industry_id }).del();
  },
};
