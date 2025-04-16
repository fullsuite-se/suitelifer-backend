import express from "express";
import {
  getAllCourses,
  insertCourse,
  deleteCourse,
  updateCourse,
} from "../controllers/courseController.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/course", verifyToken, getAllCourses);

router.post("/course", verifyToken, insertCourse);

router.put("/course", verifyToken, updateCourse);

router.delete("/course", verifyToken, deleteCourse);

export default router;
