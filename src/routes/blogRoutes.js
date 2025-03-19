import express from "express";
import {
  addCompanyBlog,
  addEmployeeBlog,
  getAllCompanyBlogs,
  getAllEmployeeBlogs,
} from "../controllers/blogController.js";

import verifyJWT from "../middlewares/verifyJWT.js";

const router = express.Router();

router.get("/all-employee-blog", getAllEmployeeBlogs);

router.post("/add-employee-blog", verifyJWT, addEmployeeBlog);

router.get("/all-company-blog", getAllCompanyBlogs);

router.post("/add-company-blog", verifyJWT, addCompanyBlog);

export default router;
