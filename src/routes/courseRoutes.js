import express from "express";
import {
  insertCourse as insertCourse,
  getJobCourses,
  addJobCourse,
} from "../controllers/courseController.js";

const router = express.Router();

router.post("/add-course", insertCourse);

router.get("/all-courses", getJobCourses);

router.post("/add-job-course", addJobCourse);

export default router;
