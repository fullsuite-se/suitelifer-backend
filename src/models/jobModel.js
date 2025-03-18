import { company_id } from "../config/companyConfig.js";
import { db } from "../config/db.js";
import { v7 as uuidv7 } from "uuid";

const table = () => db("sl_company_jobs");

export const Job = {
  getAllJobs: async () => {
    return await db
      .select(
        "job_id AS jobId",
        "title AS jobTitle",
        "industry_id AS industryId",
        "industry_name AS industryName",
        "employment_type AS employmentType",
        "sl_company_jobs.setup_id AS setupId",
        "setup_name AS setupName",
        "description",
        "salary_min AS salaryMin",
        "salary_max AS salaryMax",
        "responsibility",
        "requirement",
        "preferred_qualification AS preferredQualification",
        "is_open AS isOpen",
        "is_shown AS isShown"
      )
      .from("sl_company_jobs")
      .join("sl_company_jobs_setups", {
        "sl_company_jobs_setups.setup_id": "sl_company_jobs.setup_id",
      })
      .join("sl_job_industries", {
        "sl_company_jobs.industry_id": "sl_job_industries.job_ind_id",
      });
  },
  getOpenJobs: async () => {
    return await db
      .select(
        "job_id AS jobId",
        "title AS jobTitle",
        "industry_name AS industryName",
        "employment_type AS employmentType",
        "setup_name AS setupName",
        "description",
        "salary_min AS salaryMin",
        "salary_max AS salaryMax",
        "responsibility",
        "requirement",
        "preferred_qualification AS preferredQualification",
        "is_open AS isOpen"
      )
      .from("sl_company_jobs")
      .join("sl_company_jobs_setups", {
        "sl_company_jobs_setups.setup_id": "sl_company_jobs.setup_id",
      })
      .join("sl_job_industries", {
        "sl_company_jobs.industry_id": "sl_job_industries.job_ind_id",
      })
      .where({ is_open: 1, is_shown: 1 });
  },
  getJobDetails: async (job_id) => {
    return await db
      .select(
        "job_id AS jobId",
        "title AS jobTitle",
        "industry_name AS industryName",
        "employment_type AS employmentType",
        "setup_name AS setupName",
        "description",
        "salary_min AS salaryMin",
        "salary_max AS salaryMax",
        "responsibility",
        "requirement",
        "preferred_qualification AS preferredQualification",
        "is_open AS isOpen"
      )
      .from("sl_company_jobs")
      .join("sl_company_jobs_setups", {
        "sl_company_jobs.setup_id": "sl_company_jobs_setups.setup_id",
      })
      .join("sl_job_industries", {
        "sl_company_jobs.industry_id": "sl_job_industries.job_ind_id",
      })
      .where({ is_shown: 1, job_id })
      .first();
  },
  searchJob: async (search_val) => {
    return await db
      .select(
        "job_id AS jobId",
        "title AS jobTitle",
        "industry_name AS industryName",
        "employment_type AS employmentType",
        "setup_name AS setupName",
        "description",
        "salary_min AS salaryMin",
        "salary_max AS salaryMax",
        "responsibility",
        "requirement",
        "preferred_qualification AS preferredQualification",
        "is_open AS isOpen"
      )
      .from("sl_company_jobs")
      .innerJoin("sl_company_jobs_setups", {
        "sl_company_jobs_setups.setup_id": "sl_company_jobs.setup_id",
      })
      .innerJoin("sl_job_industries", {
        "sl_company_jobs.industry_id": "sl_job_industries.job_ind_id",
      })
      .where({ is_shown: 1 })
      .whereILike("title", `%${search_val}%`)
      .orWhereILike("industry_name", `%${search_val}%`)
      .orWhereILike("employment_type", `%${search_val}%`)
      .orWhereILike("setup_name", `%${search_val}%`);
  },
  // FOR ADMIN
  getAllJobsAdmin: async () => {
    return await db
      .select(
        "job_id AS jobId",
        "title AS jobTitle",
        "industry_id AS industryId",
        "industry_name AS industryName",
        "employment_type AS employmentType",
        "sl_company_jobs.setup_id AS setupId",
        "setup_name AS setupName",
        "description",
        "salary_min AS salaryMin",
        "salary_max AS salaryMax",
        "responsibility",
        "requirement",
        "preferred_qualification AS preferredQualification",
        "is_open AS isOpen",
        "is_shown AS isShown",
        "sl_company_jobs.created_at AS createdAt",
        db.raw(
          "CONCAT(hris_user_infos.first_name, ' ', LEFT(hris_user_infos.middle_name, 1), '. ', hris_user_infos.last_name) AS createdBy"
        )
      )
      .from("sl_company_jobs")
      .innerJoin("sl_company_jobs_setups", {
        "sl_company_jobs_setups.setup_id": "sl_company_jobs.setup_id",
      })
      .innerJoin("sl_job_industries", {
        "sl_company_jobs.industry_id": "sl_job_industries.job_ind_id",
      })
      .innerJoin("hris_user_infos", {
        "sl_company_jobs.created_by": "hris_user_infos.user_id",
      });
  },
  insertJob: async (newJob) => {
    return await table().insert(newJob);
  },
  updateJob: async (
    job_id,
    title,
    industry_id,
    employment_type,
    setup_id,
    description,
    salary_min,
    salary_max,
    responsibility,
    requirement,
    preferred_qualification,
    is_open,
    is_shown
  ) => {
    return await table().where({ job_id }).update({
      title,
      industry_id,
      employment_type,
      setup_id,
      description,
      salary_min,
      salary_max,
      responsibility,
      requirement,
      preferred_qualification,
      is_open,
      is_shown,
    });
  },
  deleteJob: async (job_id) => {
    return await table().where({ job_id }).del();
  },
};
