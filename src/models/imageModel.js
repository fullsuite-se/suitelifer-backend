import { db } from "../config/db.js";
import { v7 as uuidv7 } from "uuid";

const eBlogTable = "sl_employee_blog_images";
const cBlogTable = "sl_company_blog_images";
const cNewsTable = "sl_news_images";

export const Image = {
  getAllImages: async (id) => {
    return await db(eBlogTable).where("content_id", id);
  },
  addEmployeeBlogImages: async (blogId, images) => {
    if (!Array.isArray(images) || images.length === 0) {
      throw new Error("No images to insert");
    }

    const imageRecords = images.map((url) => ({
      eblog_image_id: uuidv7(),
      image_url: url,
      eblog_id: blogId,
    }));

    return db(eBlogTable).insert(imageRecords);
  },

  addCompanyNewsImages: async (id, images) => {
    if (!Array.isArray(images) || images.length === 0) {
      throw new Error("No images to insert");
    }

    const records = images.map((url) => ({
      news_image_id: uuidv7(),
      image_url: url,
      news_id: id,
    }));

    return db(cNewsTable).insert(records);
  },

  addCompanyBlogImages: async (id, images) => {
    if (!Array.isArray(images) || images.length === 0) {
      throw new Error("No images to insert");
    }

    const records = images.map((url) => ({
      cblog_image_id: uuidv7(),
      image_url: url,
      cblog_id: id,
    }));

    return db(cBlogTable).insert(records);
  },
};
