import { db } from "../config/db.js";
import { v7 as uuidv7 } from "uuid";

const table = "sl_employee_blogs";

export const Blogs = {
  getAllBlogs: async () => {
    return await db.select("*").from(table);
  },

  addBlog: async (data) => {
    const blog = {
      eblog_id: uuidv7(),
      title: data.title,
      description: data.description,
      created_by: userId,
      updated_by: userId,
    };

    await knex(table).insert(blog);

    const imagesData = data.images.map((image) => {
      return {
        content_id: data.eblog_id,
        image_url: image.url,
      };
    });

    return blog;
  },
};
