import { db } from "../config/db.js";

export const Blogs = {
  getAllBlogs: async () => {
    return await db.select("*").from("sl_employee_blogs");
  },
};
