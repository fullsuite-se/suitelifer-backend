import express from 'express';
import { getJobs, getOpenJobs, insertJob, updateJob } from '../controllers/jobController.js';

const router = express.Router();

router.get("/all-jobs", getJobs);

router.get("/all-open-jobs", getOpenJobs);

router.post("/add-job", insertJob);

router.post("/edit-job", updateJob);

export default router;