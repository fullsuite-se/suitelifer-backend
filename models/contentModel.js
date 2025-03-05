import { db } from "../config/db.js";

export const Content = {
  getAboutUs: async () => {
    return await db("sl_content").orderBy("content_id", "desc").first();
  },
};
