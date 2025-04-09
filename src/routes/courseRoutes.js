import express from "express";
import {
  getAllCourses,
  insertCourse,
  deleteCourse,
  updateCourse,
} from "../controllers/courseController.js";

const router = express.Router();

router.get("/course", getAllCourses);

router.post("/course", insertCourse);

router.put("/course", updateCourse);

router.delete("/course", deleteCourse);


export default router;
