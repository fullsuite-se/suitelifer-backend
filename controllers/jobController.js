import { Job } from "../models/jobModel.js";

export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.getAllJobs();

    res.status(200).json(jobs);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
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
