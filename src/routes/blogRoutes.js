import express from "express";
import {
  addEmployeeBlog,
  getAllEmployeeBlogs,
} from "../controllers/blogController.js";
import verifyJWT from "../middlewares/verifyJWT.js";

const router = express.Router();

router.get("/employee-allblog", getAllEmployeeBlogs);
router.post("/employee-blog", verifyJWT, addEmployeeBlog);

export default router;
