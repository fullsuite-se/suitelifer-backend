import { Job } from "../models/jobModel.js";

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

export const getJobDetails = async (req, res) => {
  try {
    const { jobId } = req.params;
    const jobDetails = await Job.getJobDetails(jobId);
    res.status(200).json(jobDetails);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const insertJob = async (req, res) => {
  try {
    const {
      title,
      description,
      employment_type,
      setup_id,
      is_open,
      industry_id,
      user_id,
    } = req.body;

    // VALIDATE REQUIRED FIELDS
    if (
      !title ||
      !description ||
      !employment_type ||
      !setup_id ||
      !is_open ||
      !industry_id
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    await Job.insertJob(
      title,
      description,
      employment_type,
      setup_id,
      is_open,
      industry_id,
      user_id
    );

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
      description,
      employment_type,
      setup_id,
      is_open,
      industry_id,
      user_id,
    } = req.body;

    // VALIDATE REQUIRED FIELDS
    if (
      !title ||
      !description ||
      !employment_type ||
      !setup_id ||
      !is_open ||
      !industry_id
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const updatedJob = await Job.updateJob(
      job_id,
      title,
      description,
      employment_type,
      setup_id,
      is_open,
      industry_id,
      user_id
    );

    if (!updateJob) {
      return res
        .status(404)
        .json({ success: false, message: "Job not found or not updated" });
    }

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      data: updateJob,
    });
  } catch (err) {
    console.log("Error updating job:", err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
