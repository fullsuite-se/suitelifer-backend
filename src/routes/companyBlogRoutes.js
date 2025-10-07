import express from 'express'
import { getBlogs, addBlog, editBlog, deleteBlog, getBlogById } from '../controllers/companyBlogController.js'
import verifyToken from '../middlewares/verifyToken.js'
import verifyAdmin from '../middlewares/verifyAdmin.js'

const router = express.Router()

router.get('/blogs', getBlogs)
router.get('/blogs/:blogId', getBlogById)
router.post('/blogs',verifyToken, verifyAdmin, addBlog)
router.put('/blogs', verifyToken, verifyAdmin, editBlog)
router.delete('/blogs/:blogId',verifyToken, verifyAdmin, deleteBlog)

export default router