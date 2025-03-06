import express from "express";
import {
  deleteJob,
  getJobs,
  getOpenJobs,
  insertJob,
  updateJob,
} from "../controllers/jobController.js";

const router = express.Router();

router.get("/all-jobs", getJobs);

router.get("/all-open-jobs", getOpenJobs);

router.post("/add-job", insertJob);

router.post("/edit-job", updateJob);

router.post("/delete-job", deleteJob);

export default router;
