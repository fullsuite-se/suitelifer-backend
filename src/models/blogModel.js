import { db } from "../config/db.js";

const tableEmployee = "sl_employee_blogs";
const tableEmployeeImages = "sl_employee_blog_images";
const tableEmployeeInfos = "sl_user_accounts";

export const Blogs = {
  // Employee
  getAllEmployeeBlogs: async () => {
    return await db(tableEmployee)
      .leftJoin(
        tableEmployeeImages,
        `${tableEmployee}.eblog_id`,
        `${tableEmployeeImages}.eblog_id`
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

  addEmployeeBlog: async (blog) => {
    return await db(tableEmployee).insert(blog);
  },
};

