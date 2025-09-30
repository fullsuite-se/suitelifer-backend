import express from 'express'
import { getBlogs, addBlog, editBlog, deleteBlog } from '../controllers/companyBlogController.js'
import verifyToken from '../middlewares/verifyToken.js'
import verifyAdmin from '../middlewares/verifyAdmin.js'

const router = express.Router()

router.get('/blogs', getBlogs)
router.post('/blogs',verifyToken, verifyAdmin, addBlog)
router.put('/blogs', verifyToken, verifyAdmin, editBlog)
router.delete('/blogs',verifyToken, verifyAdmin, deleteBlog)

export default router