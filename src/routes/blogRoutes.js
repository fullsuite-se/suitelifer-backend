import express from "express";
import {
  addEmployeeBlog,
  getAllEmployeeBlogs,
} from "../controllers/blogController.js";

import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/all-employee-blog", verifyToken, getAllEmployeeBlogs);

router.post("/add-employee-blog", verifyToken, addEmployeeBlog);

router.get("/all-tags", verifyToken, getAllCompanyBlogTags);

router.get("/all-company-blogs", verifyToken, getAllCompanyBlogs);

router.get("/all-company-blogs/:tag_id", verifyToken, getFilteredCompanyBlogs);

router.get("/get-company-blog/:cblog_id", verifyToken, getCompanyBlogById);

router.post("/add-company-blog", verifyToken, addCompanyBlog);

export default router;
