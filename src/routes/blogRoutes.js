import express from "express";
import {
  addCompanyBlog,
  addEmployeeBlog,
  getAllCompanyBlogs,
  getAllCompanyBlogTags,
  getAllEmployeeBlogs,
  getCompanyBlogById,
  getFilteredCompanyBlogs,
} from "../controllers/blogController.js";

import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/all-employee-blog", getAllEmployeeBlogs);

router.post("/add-employee-blog", verifyToken, addEmployeeBlog);

router.get("/all-tags", getAllCompanyBlogTags);

router.get("/all-company-blogs", getAllCompanyBlogs);

router.get("/all-company-blogs/:tag_id", getFilteredCompanyBlogs);

router.get("/get-company-blog/:cblog_id", getCompanyBlogById);

router.post("/add-company-blog", verifyToken, addCompanyBlog);

export default router;
