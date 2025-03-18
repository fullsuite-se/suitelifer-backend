import express from "express";
import {
  deleteJob,
  getJobDetails,
  getJobs,
  getOpenJobs,
  insertJob,
  searchJob,
  updateJob,
} from "../controllers/jobController.js";

const router = express.Router();

router.get("/all-jobs", getJobs);

router.get("/all-jobs/:industry_id", getFilteredAllJobs);

router.get("/all-open-jobs", getOpenJobs);

router.get("/get-job-details/:id", getJobDetails)

router.post("/add-job", insertJob);

router.post("/edit-job", updateJob);

router.post("/delete-job", deleteJob);

router.get("/search-job/:search_val", searchJob);

export default router;
