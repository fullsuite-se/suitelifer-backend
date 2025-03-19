import { company_id } from "../config/companyConfig.js";
import { v7 as uuidv7 } from "uuid";
import { Job } from "../models/jobModel.js";
import { now } from "../utils/date.js";

export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.getAllJobs();

    res.status(200).json({ success: true, data: jobs });
  } catch (err) {
    console.error("Error fetching jobs:", err.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getFilteredAllJobs = async (req, res) => {
  try {
    const { industry_id } = req.params;

    if (!industry_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: industry id",
      });
    }

    const filteredJobs = await Job.getFilteredAllJobs(industry_id);

    res.status(200).json({ success: true, data: filteredJobs });
  } catch (err) {
    console.error("Error fetching open jobs:", err.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getOpenJobs = async (req, res) => {
  try {
    const openJobs = await Job.getOpenJobs();

    res.status(200).json({ success: true, data: openJobs });
  } catch (err) {
    console.error("Error fetching open jobs:", err.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getFilteredOpenJobs = async (req, res) => {
  try {
    const { industry_id } = req.params;

    if (!industry_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: industry id",
      });
    }

    const filteredJobs = await Job.getFilteredOpenJobs(industry_id);

    res.status(200).json({ success: true, data: filteredJobs });
  } catch (err) {
    console.error("Error fetching open jobs:", err.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getJobDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const jobDetails = await Job.getJobDetails(id);
    res.status(200).json({ success: true, data: jobDetails });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getJobAssessmentUrl = async (req, res) => {
  try {
    const { job_id } = req.body;
    const assessmentUrl = await Job.getJobAssessmentUrl(job_id);
    res.status(200).json({ success: true, data: assessmentUrl });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Internal Server Errror" });
  }
};

export const searchJob = async (req, res) => {
  try {
    const { search_val } = req.params;
    const searchResults = await Job.searchJob(search_val);
    res.status(200).json({ success: true, data: searchResults });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getJobsAdmin = async (req, res) => {
  try {
    const jobs = await Job.getAllJobsAdmin();
    res.status(200).json({ success: true, data: jobs });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const insertJob = async (req, res) => {
  try {
    const {
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
      user_id,
    } = req.body;

    // VALIDATE REQUIRED FIELDS
    if (
      !title ||
      !description ||
      !employment_type ||
      !setup_id ||
      !is_open ||
      !is_shown ||
      !industry_id
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const newJob = {
      job_id: uuidv7(),
      company_id,
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
      created_at: now(),
      created_by: user_id,
    };

    // INSERT JOB INTO THE DATABASE
    await Job.insertJob(newJob);

    res
      .status(201)
      .json({ success: true, message: "Company Job added successfully" });
  } catch (err) {
    console.log("Error inserting company job:", err.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export const updateJob = async (req, res) => {
  try {
    const {
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
      is_shown,
      user_id,
    } = req.body;

    console.dir(req.body, { depth: null });

    // VALIDATE REQUIRED FIELDS
    if (
      !title ||
      !description ||
      !employment_type ||
      !setup_id ||
      !is_open ||
      !is_shown ||
      !industry_id
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // ATTEMPT TO UPDATE THE JOB
    const updatedJob = await Job.updateJob(
      job_id,
      title,
      industry_id,
      employment_type,
      setup_id,
      description,
      salary_min ?? 0,
      salary_max ?? 0,
      responsibility,
      requirement,
      preferred_qualification,
      is_open,
      is_shown
    );

    if (!updatedJob) {
      return res
        .status(404)
        .json({ success: false, message: "Job not found or not updated" });
    }

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      data: updatedJob,
    });
  } catch (err) {
    console.log("Error updating job:", err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const { job_id } = req.body;

    // VALIDATE REQUIRED FIELD
    if (!job_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: job id",
      });
    }

    const deletedJob = await Job.deleteJob(job_id);

    if (!deleteJob) {
      return res.status(404).json({
        success: false,
        message: "Job not found or already deleted",
      });
    }

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (err) {
    console.log("Error deleting job:", err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
