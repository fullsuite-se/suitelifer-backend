import express from "express";
import { addBlog, getAllBlogs } from "../controllers/blogController.js";
import upload from "../utils/multer.js";
import verifyJWT from "../middlewares/verifyJWT.js";

const router = express.Router();

router.get("/all-employee-blog", getAllBlogs);

router.post(
  "/add-employee-blog",
  verifyJWT,
  upload.array("images", 10),
  addBlog
);

export default router;
