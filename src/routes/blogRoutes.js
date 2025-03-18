import express from "express";
import {
  addEmployeeBlog,
  getAllCompanyBlogs,
  getAllEmployeeBlogs,
} from "../controllers/blogController.js";
import upload from "../utils/multer.js";
import verifyJWT from "../middlewares/verifyJWT.js";

const router = express.Router();

router.get("/all-employee-blog", getAllEmployeeBlogs);

router.post("/add-employee-blog", verifyJWT, addEmployeeBlog);

router.get("/all-company-blog", getAllCompanyBlogs);

export default router;
