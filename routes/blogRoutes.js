import express from "express";
import { getAllBlogs } from "../controllers/blogController.js";

const router = express.Router();

router.get("/all-employee-blog", getAllBlogs);

export default router;
