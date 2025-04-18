import express from "express";
import {
  addEmployeeBlog,
  getAllEmployeeBlogs,
  deleteEmployeeBlog,
  editEmployeeBlog,
} from "../controllers/blogController.js";

import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/all-employee-blog", verifyToken, getAllEmployeeBlogs);

router.post("/add-employee-blog", verifyToken, addEmployeeBlog);

router.post("/edit-employee-blog", editEmployeeBlog);

router.post("/delete-employee-blog", deleteEmployeeBlog);

export default router;
