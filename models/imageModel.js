import { db } from "../config/db.js";
import { v7 as uuidv7 } from "uuid";

const table = "sl_images";

export const Image = {
  getAllImages: async (id) => {
    return await db(table).where("content_id", id);
  },
  addImages: async (images) => {
    if (!Array.isArray(images) || images.length === 0) {
      throw new Error("No images to insert");
    }

    const imageRecords = images.map((image) => ({
      image_id: uuidv7(),
      content_id: image.content_id,
      image_url: image.image_url,
      caption: image.caption || null,
    }));

    return knex("images").insert(imageRecords);
  },
};
