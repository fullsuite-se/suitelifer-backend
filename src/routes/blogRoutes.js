import express from "express";
import {
  addEmployeeBlog,
  getAllEmployeeBlogs,
  deleteEmployeeBlog,
  editEmployeeBlog,
  likeEmployeeBlog,
  isBlogLiked,
  showBlogComments
} from "../controllers/blogController.js";

import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/all-employee-blog", verifyToken, getAllEmployeeBlogs);

router.get("/employee-blog/:id", verifyToken, getAllEmployeeBlogs);

// Fetch Comment 

router.get("/show-comments/:id", verifyToken, showBlogComments)

router.post("/add-employee-blog", verifyToken, addEmployeeBlog);

router.post("/edit-employee-blog", editEmployeeBlog);

router.post("/delete-employee-blog", deleteEmployeeBlog);

// Like

router.get('/:eblogId/is-liked', verifyToken, isBlogLiked)
router.post("/:eblogId/like", verifyToken, likeEmployeeBlog)


export default router;
