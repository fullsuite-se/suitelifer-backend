import { company_id } from "../config/companyConfig.js";
import { db } from "../config/db.js";
import { v7 as uuidv7 } from "uuid";

const table = db("sl_company_jobs");

export const Job = {
  getAllJobs: async () => {
    return await db
      .select("*")
      .from("sl_company_jobs")
      .join("job_setup", { "job_setup.setup_id": "sl_company_jobs.setup_id" });
  },
  getOpenJobs: async () => {
    return db
      .select("*")
      .from("sl_company_jobs")
      .join("job_setup", { "job_setup.setup_id": "sl_company_jobs.setup_id" })
      .where({ is_open: true });
  },
  getJobDetails: async (job_id) => {
    return await db
      .select("*")
      .from("sl_company_jobs")
      .join("job_setup", { "sl_company_jobs.setup_id": "job_setup.setup_id" })
      .join("sl_job_details", {
        "sl_company_jobs.job_id": "sl_job_details.job_id",
      })
      .join("sl_salary_ranges", {
        "sl_job_details.salary_range_id": "sl_salary_ranges.salary_range_id",
      })
      .join("sl_job_industries", {
        "sl_company_jobs.industry_id": "sl_job_industries.job_ind_id",
      });
  },
  insertJob: async (
    title,
    description,
    employment_type,
    setup_id,
    is_open,
    industry_id,
    user_id
  ) => {
    await db.insert(
      uuidv7(),
      company_id,
      title,
      description,
      employment_type,
      setup_id,
      is_open,
      industry_id,
      Date.now(),
      user_id,
      null,
      null
    );
  },
  updateJob: async (
    job_id,
    title,
    description,
    employment_type,
    setup_id,
    is_open,
    industry_id,
    user_id
  ) => {
    await table.where({ job_id: job_id }).update(
      {
        title: title,
        description: description,
        employment_type: employment_type,
        setup_id: setup_id,
        is_open: is_open,
        industry_id: industry_id,
        user_id: user_id,
      },
      ["job_id", "title"]
    );
  },
  deleteJob: async (job_id) => {
    await table.where("job_id", job_id).del();
  },
};
