import knex from "knex";
import { db } from "../config/db.js";

const tableEmployee = "sl_employee_blogs";
const tableCompany = "sl_company_blogs";

export const Blogs = {
  getAllEmployeeBlogs: async () => {
    return await db(tableEmployee)
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
    return await db(tableEmployee).insert(blog);
  },

  getAllCompanyBlogs: async () => {
    return await db(tableCompany)
      .leftJoin(
        "sl_company_blog_images",
        "sl_company_blogs.eblog_id",
        "sl_company_blog_images.eblog_id"
      )
      .select(
        "sl_company_blogs.*",
        db.raw("JSON_ARRAYAGG(sl_company_blog_images.image_url) AS images")
      )
      .groupBy("sl_company_blogs.eblog_id");
  },
};
