import knex from "knex";
import { db } from "../config/db.js";

const table = "sl_employee_blogs";

export const Blogs = {
  getAllEmployeeBlogs: async () => {
    return await db(table)
      .leftJoin(
        "sl_employee_blog_images",
        "sl_employee_blogs.eblog_id",
        "sl_employee_blog_images.eblog_id"
      )
      .select(
        "sl_employee_blogs.*",
        db.raw("JSON_ARRAYAGG(sl_employee_blog_images.image_url) AS images")
      )
      .groupBy("sl_employee_blogs.eblog_id");
  },
  addEmployeeBlog: async (blog) => {
    return await db(table).insert(blog);
  },
};
