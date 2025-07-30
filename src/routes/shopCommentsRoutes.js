import express from 'express';
import ShopCommentsController from '../controllers/shopCommentsController.js';
import verifyToken from '../middlewares/verifyToken.js';

const router = express.Router();

// Get all comments for a product
router.get('/:productId', ShopCommentsController.getComments);

// Add a new comment (requires authentication)
router.post('/:productId', verifyToken, ShopCommentsController.addComment);

// Delete a comment (requires authentication)
router.delete('/:commentId', verifyToken, ShopCommentsController.deleteComment);

// Get a single comment by ID
router.get('/comment/:commentId', ShopCommentsController.getComment);

export default router; 