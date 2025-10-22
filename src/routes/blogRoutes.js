import express from "express";
import {
  addEmployeeBlog,
  getAllEmployeeBlogs,
  deleteEmployeeBlog,
  editEmployeeBlog,
  likeEmployeeBlog,
  isBlogLiked,
  showBlogComments,
  getEmployeeBlogsById,
  getEmployeeBlogsByUserId,
  addEblogComment
} from "../controllers/blogController.js";

import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/all-employee-blog", verifyToken, getAllEmployeeBlogs);
router.get('/employee-blog/:id', verifyToken, getEmployeeBlogsById)
router.get("/employee-blog", verifyToken, getEmployeeBlogsByUserId);
router.post("/add-employee-blog", verifyToken, addEmployeeBlog);
router.put("/edit-employee-blog", editEmployeeBlog);
router.delete("/delete-employee-blog/:eblogId", deleteEmployeeBlog);

// Like

router.get('/:eblogId/is-liked', verifyToken, isBlogLiked)
router.post("/:eblogId/like", verifyToken, likeEmployeeBlog)

// Fetch Comment 

router.get("/show-comments/:id", verifyToken, showBlogComments)
router.post('/add-comment', verifyToken, addEblogComment)


export default router;
