import { db } from "../config/db.js";
import { getEmployeeBlogsById } from "../controllers/blogController.js";

const tableEmployee = "sl_employee_blogs";
const tableEmployeeImages = "sl_employee_blog_images";
const tableEmployeeInfos = "sl_user_accounts";
const tableEmployeeLikes = "sl_eblog_likes"
const tableEmployeeComments = "sl_eblog_comments"

export const Blogs = {
  // Employee
  getAllEmployeeBlogs: async () => {
    return await db(tableEmployee)
      .leftJoin(
        tableEmployeeImages,
        `${tableEmployee}.eblog_id`,
        `${tableEmployeeImages}.eblog_id`
      )
      .leftJoin(
        tableEmployeeLikes,
        `${tableEmployee}.eblog_id`,
        `${tableEmployeeLikes}.eblog_id`
      )
      .
      leftJoin(
        tableEmployeeComments,
        `${tableEmployee}.created_by`,
        `${tableEmployeeComments}.created_by`
      )
      .innerJoin(
        tableEmployeeInfos,
        `${tableEmployee}.created_by`,
        `${tableEmployeeInfos}.user_id`
      )
      .select(
        `${tableEmployee}.eblog_id as eblogId`,
        "title",
        "description",
        "is_shown",
        db.raw(`COUNT(DISTINCT ${tableEmployeeLikes}.like_id) AS likeCount`),
        db.raw(`COUNT(DISTINCT ${tableEmployeeComments}.comment_id) AS commentCount`),
        `${tableEmployee}.created_at as createdAt`,
        `${tableEmployee}.created_by as createdById`,
        `${tableEmployeeInfos}.first_name as firstName`,
        `${tableEmployeeInfos}.last_name as lastName`,
        `${tableEmployeeInfos}.middle_name as middleName`,
        `${tableEmployeeInfos}.profile_pic as userPic`,
        db.raw(`JSON_ARRAYAGG(${tableEmployeeImages}.image_url) AS images`)
      )
      .groupBy(`${tableEmployee}.eblog_id`);
  },

  editEmployeeBlog: async (eblog_id, is_shown) => {
    return await db(tableEmployee).where({ eblog_id }).update({ is_shown });
  },

  deleteEmployeeBlog: async (eblog_id) => {
    db(tableEmployeeImages).where({eblog_id}).del().then( ()=> db(tableEmployee).where({ eblog_id }).del())
    return
  },

  addEmployeeBlog: async (blog) => {
    return await db(tableEmployee).insert(blog);
  },

  // GetBlogById

  getEmployeeBlogById : async (eblog_id) => {
     return await db(tableEmployee)
      .leftJoin(
        tableEmployeeImages,
        `${tableEmployee}.eblog_id`,
        `${tableEmployeeImages}.eblog_id`
      )
      .leftJoin(
        tableEmployeeLikes,
        `${tableEmployee}.eblog_id`,
        `${tableEmployeeLikes}.eblog_id`
      )
      .
      leftJoin(
        tableEmployeeComments,
        `${tableEmployee}.created_by`,
        `${tableEmployeeComments}.created_by`
      )
      .innerJoin(
        tableEmployeeInfos,
        `${tableEmployee}.created_by`,
        `${tableEmployeeInfos}.user_id`
      )
      .where(
        `${tableEmployee}.created_by`, eblog_id
      )
      .select(
        `${tableEmployee}.eblog_id as eblogId`,
        "title",
        "description",
        "is_shown",
        db.raw(`COUNT(DISTINCT ${tableEmployeeLikes}.like_id) AS likeCount`),
        db.raw(`COUNT(DISTINCT ${tableEmployeeComments}.comment_id) AS commentCount`),
        `${tableEmployee}.created_at as createdAt`,
        `${tableEmployee}.created_by as createdById`,
        `${tableEmployeeInfos}.first_name as firstName`,
        `${tableEmployeeInfos}.last_name as lastName`,
        `${tableEmployeeInfos}.middle_name as middleName`,
        `${tableEmployeeInfos}.profile_pic as userPic`,
        db.raw(`JSON_ARRAYAGG(${tableEmployeeImages}.image_url) AS images`)
      )
      .groupBy(`${tableEmployee}.eblog_id`);
  },

  // Comment
  getAllComments: async (blog_id) => {
  return await db(tableEmployeeComments)
    .select('*')
    .where(`${tableEmployeeComments}.content_id`, blog_id)
    .orderBy(`${tableEmployeeComments}.created_at`, 'desc');
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
