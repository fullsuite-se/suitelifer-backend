import knex from "knex";
import { db } from "../config/db.js";

const table = "sl_employee_blogs";

export const Blogs = {
  getAllBlogs: async () => {
    return await db.select("*").from(table);
  },
  addBlog: async (blog) => {
    return await db(table).insert(blog);
  },
};
