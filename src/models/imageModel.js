import { db } from "../config/db.js";
import { v7 as uuidv7 } from "uuid";

const table = "sl_employee_blog_images";

export const Image = {
  getAllImages: async (id) => {
    return await db(table).where("content_id", id);
  },
  addImages: async (blogId, images) => {
    if (!Array.isArray(images) || images.length === 0) {
      throw new Error("No images to insert");
    }

    const imageRecords = images.map((url) => ({
      eblog_image_id: uuidv7(),
      image_url: url,
      eblog_id: blogId,
    }));

    return db(table).insert(imageRecords);
  },
};
