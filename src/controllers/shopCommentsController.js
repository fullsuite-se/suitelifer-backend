import ShopCommentsModel from '../models/shopCommentsModel.js';

class ShopCommentsController {
  // Get all comments for a product
  static async getComments(req, res) {
    try {
      const { productId } = req.params;
      
      if (!productId) {
        return res.status(400).json({
          success: false,
          message: 'Product ID is required'
        });
      }

      const comments = await ShopCommentsModel.getCommentsByProductId(productId);
      
      res.json({
        success: true,
        comments: comments
      });
    } catch (error) {
      console.error('Error getting comments:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get comments',
        error: error.message
      });
    }
  }

  // Add a new comment
  static async addComment(req, res) {
    try {
      const { productId } = req.params;
      const { parentCommentId, commentText } = req.body;
      const userId = req.user.user_id; // From auth middleware

      if (!productId || !commentText) {
        return res.status(400).json({
          success: false,
          message: 'Product ID and comment text are required'
        });
      }

      if (commentText.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Comment text cannot be empty'
        });
      }

      // If this is a reply, verify the parent comment exists
      if (parentCommentId) {
        const parentComment = await ShopCommentsModel.getCommentById(parentCommentId);
        if (!parentComment) {
          return res.status(400).json({
            success: false,
            message: 'Parent comment not found'
          });
        }
      }

      const newComment = await ShopCommentsModel.addComment(
        productId,
        userId,
        parentCommentId || null,
        commentText.trim()
      );

      res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        comment: newComment
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add comment',
        error: error.message
      });
    }
  }

  // Delete a comment
  static async deleteComment(req, res) {
    try {
      const { commentId } = req.params;
      const userId = req.user.user_id; // From auth middleware

      if (!commentId) {
        return res.status(400).json({
          success: false,
          message: 'Comment ID is required'
        });
      }

      const result = await ShopCommentsModel.deleteComment(commentId, userId);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      
      if (error.message === 'Comment not found') {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }
      
      if (error.message === 'Unauthorized to delete this comment') {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own comments'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to delete comment',
        error: error.message
      });
    }
  }

  // Get a single comment by ID
  static async getComment(req, res) {
    try {
      const { commentId } = req.params;

      if (!commentId) {
        return res.status(400).json({
          success: false,
          message: 'Comment ID is required'
        });
      }

      const comment = await ShopCommentsModel.getCommentById(commentId);

      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }

      res.json({
        success: true,
        comment: comment
      });
    } catch (error) {
      console.error('Error getting comment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get comment',
        error: error.message
      });
    }
  }
}

export default ShopCommentsController; 