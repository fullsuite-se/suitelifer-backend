import express from "express";
import { insertJobCourse as insertCourse } from "../controllers/courseController";

const router = express.Router();

router.post("add-course", insertCourse);

export default router;