import express from "express";
import {
  addEmployeeBlog,
  getAllEmployeeBlogs,
} from "../controllers/blogController.js";

import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/all-employee-blog", verifyToken, getAllEmployeeBlogs);

router.post("/add-employee-blog", verifyToken, addEmployeeBlog);

export default router;
