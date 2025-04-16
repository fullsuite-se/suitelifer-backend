import express from "express";
import {
  getAllCourses,
  insertCourse,
  deleteCourse,
  updateCourse,
} from "../controllers/courseController.js";
import verifyToken from "../middlewares/verifyToken.js";
import verifyAdmin from "../middlewares/verifyAdmin.js";

const router = express.Router();

router.get("/course", verifyToken, getAllCourses);

router.post("/course", verifyToken, verifyAdmin, insertCourse);

router.put("/course", verifyToken, verifyAdmin, updateCourse);

router.delete("/course", verifyToken, verifyAdmin, deleteCourse);

export default router;
