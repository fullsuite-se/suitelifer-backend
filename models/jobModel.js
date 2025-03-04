import { db } from "../config/db.js";

export const Job = {
  getAllJobs: async () => {
    return await db.select("*").from("sl_company_jobs").join('job_setup', { 'job_setup.setup_id': 'sl_company_jobs.setup_id'});
  },
  getJobDetails: async (job_id) => {
    return await db("sl_company_jobs").where("job_id", job_id);
  },
};
