
import { db } from "../config/db.js";
const tableEmployee = "sl_employee_blogs";
const tableEmployeeImages = "sl_employee_blog_images";
const tableEmployeeInfos = "sl_user_accounts";
const tableEmployeeLikes = "sl_eblog_likes"
const tableEmployeeComments = "sl_eblog_comments"

export const Blogs = {
  // Employee
  getAllEmployeeBlogs: async () => {
  const commentsSubquery = db(tableEmployeeComments)
    .select('content_id')
    .count('* as commentCount')
    .groupBy('content_id')
    .as('comment_summary');

  const likesSubquery = db(tableEmployeeLikes)
    .select('eblog_id')
    .count('* as likeCount')
    .groupBy('eblog_id')
    .as('like_summary');

  const imagesSubquery = db(tableEmployeeImages)
    .select('eblog_id')
    .select(db.raw('JSON_ARRAYAGG(image_url) as images'))
    .groupBy('eblog_id')
    .as('image_summary');

  return await db(tableEmployee)
    .leftJoin(likesSubquery, `${tableEmployee}.eblog_id`, 'like_summary.eblog_id')
    .leftJoin(commentsSubquery, `${tableEmployee}.eblog_id`, 'comment_summary.content_id')
    .leftJoin(imagesSubquery, `${tableEmployee}.eblog_id`, 'image_summary.eblog_id')
    .innerJoin(
      tableEmployeeInfos,
      `${tableEmployee}.created_by`,
      `${tableEmployeeInfos}.user_id`
    )
    .select(
      `${tableEmployee}.eblog_id as eblogId`,
      'title',
      'description',
      'is_shown',
      db.raw('COALESCE(like_summary.likeCount, 0) as likeCount'),
      db.raw('COALESCE(comment_summary.commentCount, 0) as commentCount'),
      db.raw('COALESCE(image_summary.images, JSON_ARRAY()) as images'),
      `${tableEmployee}.created_at as createdAt`,
      `${tableEmployee}.created_by as createdById`,
      `${tableEmployeeInfos}.first_name as firstName`,
      `${tableEmployeeInfos}.last_name as lastName`,
      `${tableEmployeeInfos}.middle_name as middleName`,
      `${tableEmployeeInfos}.profile_pic as userPic`
    )
    .groupBy(`${tableEmployee}.eblog_id`);
},

  editEmployeeBlog: async (eblog_id, is_shown) => {
    return await db(tableEmployee).where({ eblog_id }).update({ is_shown });
  },

  deleteEmployeeBlog: async (eblog_id) => {
    try {
      await db(tableEmployeeComments).where({ content_id: eblog_id }).del();

      await db(tableEmployeeImages).where({ eblog_id }).del();

      await db(tableEmployeeLikes).where({ eblog_id }).del();

      await db(tableEmployee).where({ eblog_id }).del();

      return { success: true, message: "Blog and related data deleted successfully" };
    } catch (error) {
      console.error("Error deleting employee blog:", error);
      throw error;
    }
  },

  addEmployeeBlog: async (blog) => {
    return await db(tableEmployee).insert(blog);
  },

  getEmployeeBlogsById : async (eblog_id) => {
    
  const commentsSubquery = db(tableEmployeeComments)
    .select('content_id')
    .count('* as commentCount')
    .groupBy('content_id')
    .as('comment_summary');

  const likesSubquery = db(tableEmployeeLikes)
    .select('eblog_id')
    .count('* as likeCount')
    .groupBy('eblog_id')
    .as('like_summary');

  const imagesSubquery = db(tableEmployeeImages)
    .select('eblog_id')
    .select(db.raw('JSON_ARRAYAGG(image_url) as images'))
    .groupBy('eblog_id')
    .as('image_summary');

  return await db(tableEmployee)
    .leftJoin(likesSubquery, `${tableEmployee}.eblog_id`, 'like_summary.eblog_id')
    .leftJoin(commentsSubquery, `${tableEmployee}.eblog_id`, 'comment_summary.content_id')
    .leftJoin(imagesSubquery, `${tableEmployee}.eblog_id`, 'image_summary.eblog_id')
    .innerJoin(
      tableEmployeeInfos,
      `${tableEmployee}.created_by`,
      `${tableEmployeeInfos}.user_id`
    )
    .where(`${tableEmployee}.eblog_id`, eblog_id)
    .first(
      `${tableEmployee}.eblog_id as eblogId`,
      'title',
      'description',
      'is_shown',
      db.raw('COALESCE(like_summary.likeCount, 0) as likeCount'),
      db.raw('COALESCE(comment_summary.commentCount, 0) as commentCount'),
      db.raw('COALESCE(image_summary.images, JSON_ARRAY()) as images'),
      `${tableEmployee}.created_at as createdAt`,
      `${tableEmployee}.created_by as createdById`,
      `${tableEmployeeInfos}.first_name as firstName`,
      `${tableEmployeeInfos}.last_name as lastName`,
      `${tableEmployeeInfos}.middle_name as middleName`,
      `${tableEmployeeInfos}.profile_pic as userPic`
    )
    .groupBy(`${tableEmployee}.eblog_id`);
  },

  // GetBlogByUserId

  getEmployeeBlogByUserId : async (user_id) => {
  
    const commentsSubquery = db(tableEmployeeComments)
    .select('content_id')
    .count('* as commentCount')
    .groupBy('content_id')
    .as('comment_summary');

  const likesSubquery = db(tableEmployeeLikes)
    .select('eblog_id')
    .count('* as likeCount')
    .groupBy('eblog_id')
    .as('like_summary');

  const imagesSubquery = db(tableEmployeeImages)
    .select('eblog_id')
    .select(db.raw('JSON_ARRAYAGG(image_url) as images'))
    .groupBy('eblog_id')
    .as('image_summary');

  return await db(tableEmployee)
    .leftJoin(likesSubquery, `${tableEmployee}.eblog_id`, 'like_summary.eblog_id')
    .leftJoin(commentsSubquery, `${tableEmployee}.eblog_id`, 'comment_summary.content_id')
    .leftJoin(imagesSubquery, `${tableEmployee}.eblog_id`, 'image_summary.eblog_id')
    .innerJoin(
      tableEmployeeInfos,
      `${tableEmployee}.created_by`,
      `${tableEmployeeInfos}.user_id`
    )
    .where( `${tableEmployee}.created_by`, user_id)
    .select(
      `${tableEmployee}.eblog_id as eblogId`,
      'title',
      'description',
      'is_shown',
      db.raw('COALESCE(like_summary.likeCount, 0) as likeCount'),
      db.raw('COALESCE(comment_summary.commentCount, 0) as commentCount'),
      db.raw('COALESCE(image_summary.images, JSON_ARRAY()) as images'),
      `${tableEmployee}.created_at as createdAt`,
      `${tableEmployee}.created_by as createdById`,
      `${tableEmployeeInfos}.first_name as firstName`,
      `${tableEmployeeInfos}.last_name as lastName`,
      `${tableEmployeeInfos}.middle_name as middleName`,
      `${tableEmployeeInfos}.profile_pic as userPic`
    )
    .groupBy(`${tableEmployee}.eblog_id`);
  },
  // Comment
  getAllComments: async (blog_id) => {
  return await db(tableEmployeeComments)
    .innerJoin(
      tableEmployeeInfos,
      `${tableEmployeeComments}.created_by`,
      `${tableEmployeeInfos}.user_id`
    )
    .select(
      `${tableEmployeeComments}.comment_id as commentId`,
      `${tableEmployeeComments}.comment as content`,
      `${tableEmployeeInfos}.first_name as firstName`,
      `${tableEmployeeInfos}.last_name as lastName`,
      `${tableEmployeeInfos}.profile_pic as userPic`,
      `${tableEmployeeComments}.created_at as createdAt`
    )
    .where(`${tableEmployeeComments}.content_id`, blog_id)
    .orderBy(`${tableEmployeeComments}.created_at`, 'desc');
  },

  addEblogComment: async (data) => {
    return await db(tableEmployeeComments).insert(data)
  },

  // Like
  isExistingLike: async (eblog_id, user_id) => {
    return await db(tableEmployeeLikes)
      .where({ eblog_id, user_id })
      .first();
  },

  // Insert
  insertLike: async (data) => {
    return await db(tableEmployeeLikes).insert(data);
  },

  // Delete
  deleteLike: async (like_id) => {
    return await db(tableEmployeeLikes).where({ like_id }).del();
  },
  

};
