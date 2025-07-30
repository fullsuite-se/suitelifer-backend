import { db } from '../config/db.js';

class ShopCommentsModel {
  // Get all comments for a product with nested replies
  static async getCommentsByProductId(productId) {
    try {
      console.log('🔍 Getting comments for productId:', productId);
      
      const comments = await db('sl_shop_comments')
        .join('sl_user_accounts', 'sl_shop_comments.user_id', 'sl_user_accounts.user_id')
        .select(
          'sl_shop_comments.comment_id',
          'sl_shop_comments.product_id',
          'sl_shop_comments.user_id',
          'sl_shop_comments.parent_comment_id',
          'sl_shop_comments.comment_text',
          'sl_shop_comments.created_at',
          'sl_shop_comments.updated_at',
          'sl_user_accounts.first_name',
          'sl_user_accounts.last_name',
          'sl_user_accounts.user_email',
          'sl_user_accounts.profile_pic'
        )
        .where('sl_shop_comments.product_id', productId)
        .where('sl_shop_comments.is_deleted', false)
        .orderBy('sl_shop_comments.parent_comment_id', 'asc')
        .orderBy('sl_shop_comments.created_at', 'asc');
      
      // Build nested structure
      const commentMap = new Map();
      const rootComments = [];
      
      comments.forEach(comment => {
        commentMap.set(comment.comment_id, {
          ...comment,
          replies: []
        });
      });
      
      comments.forEach(comment => {
        if (comment.parent_comment_id === null) {
          rootComments.push(commentMap.get(comment.comment_id));
        } else {
          const parent = commentMap.get(comment.parent_comment_id);
          if (parent) {
            parent.replies.push(commentMap.get(comment.comment_id));
          }
        }
      });
      
      return rootComments;
    } catch (error) {
      console.error('Error getting comments:', error);
      throw error;
    }
  }

  // Add a new comment
  static async addComment(productId, userId, parentCommentId, commentText) {
    try {
      const [commentId] = await db('sl_shop_comments').insert({
        product_id: productId,
        user_id: userId,
        parent_comment_id: parentCommentId,
        comment_text: commentText,
        created_at: new Date()
      });
      
      // Get the newly created comment with user info
      const newComment = await db('sl_shop_comments')
        .join('sl_user_accounts', 'sl_shop_comments.user_id', 'sl_user_accounts.user_id')
        .select(
          'sl_shop_comments.comment_id',
          'sl_shop_comments.product_id',
          'sl_shop_comments.user_id',
          'sl_shop_comments.parent_comment_id',
          'sl_shop_comments.comment_text',
          'sl_shop_comments.created_at',
          'sl_shop_comments.updated_at',
          'sl_user_accounts.first_name',
          'sl_user_accounts.last_name',
          'sl_user_accounts.user_email',
          'sl_user_accounts.profile_pic'
        )
        .where('sl_shop_comments.comment_id', commentId)
        .first();
      
      return newComment;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  // Delete a comment (soft delete)
  static async deleteComment(commentId, userId) {
    try {
      // Check if user owns the comment
      const comment = await db('sl_shop_comments')
        .where('comment_id', commentId)
        .where('is_deleted', false)
        .first();
      
      if (!comment) {
        throw new Error('Comment not found');
      }
      
      if (comment.user_id !== userId) {
        throw new Error('Unauthorized to delete this comment');
      }
      
      // Soft delete the comment and all its replies
      await db('sl_shop_comments')
        .where('comment_id', commentId)
        .orWhere('parent_comment_id', commentId)
        .update({
          is_deleted: true,
          deleted_at: new Date()
        });
      
      return { success: true, message: 'Comment deleted successfully' };
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }

  // Get comment by ID
  static async getCommentById(commentId) {
    try {
      const comment = await db('sl_shop_comments')
        .join('sl_user_accounts', 'sl_shop_comments.user_id', 'sl_user_accounts.user_id')
        .select(
          'sl_shop_comments.comment_id',
          'sl_shop_comments.product_id',
          'sl_shop_comments.user_id',
          'sl_shop_comments.parent_comment_id',
          'sl_shop_comments.comment_text',
          'sl_shop_comments.created_at',
          'sl_shop_comments.updated_at',
          'sl_user_accounts.first_name',
          'sl_user_accounts.last_name',
          'sl_user_accounts.user_email',
          'sl_user_accounts.profile_pic'
        )
        .where('sl_shop_comments.comment_id', commentId)
        .where('sl_shop_comments.is_deleted', false)
        .first();
      
      return comment;
    } catch (error) {
      console.error('Error getting comment by ID:', error);
      throw error;
    }
  }
}

export default ShopCommentsModel; 