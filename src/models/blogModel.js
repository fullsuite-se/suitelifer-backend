import knex from "knex";
import { db } from "../config/db.js";

const tableEmployee = "sl_employee_blogs";
const tableEmployeeImages = "sl_employee_blog_images";

const tableCompany = "sl_company_blogs";
const tableCompanyImages = "sl_company_blog_images";

export const Blogs = {
  getAllEmployeeBlogs: async () => {
    return await db(tableEmployee)
      .leftJoin(
        tableEmployeeImages,
        `${tableEmployee}.eblog_id`,
        `${tableEmployeeImages}.eblog_id`
      )
      .select(
        `${tableEmployee}.*`,
        db.raw(`JSON_ARRAYAGG(${tableEmployeeImages}.image_url) AS images`)
      )
      .groupBy(`${tableEmployee}.eblog_id`);
  },

  addEmployeeBlog: async (blog) => {
    return await db(tableEmployee).insert(blog);
  },

  getAllCompanyBlogs: async () => {
    return await db(tableCompany)
      .leftJoin(
        tableCompanyImages,
        `${tableCompany}.eblog_id`,
        `${tableCompanyImages}.eblog_id`
      )
      .select(
        `${tableCompany}.*`,
        db.raw(`JSON_ARRAYAGG(${tableCompanyImages}.image_url) AS images`)
      )
      .groupBy(`${tableCompany}.eblog_id`);
  },
};
