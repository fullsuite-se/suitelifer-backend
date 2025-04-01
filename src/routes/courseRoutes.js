import express from "express";
import {
  insertCourse as insertCourse,
  getAllCourses,
  deleteCourse,
  updateCourse,
} from "../controllers/courseController.js";

const router = express.Router();

router.post("/add-course", insertCourse);

router.get("/all-courses", getAllCourses);

router.post("/delete-course", deleteCourse);

router.post("/update-course", updateCourse);

export default router;
