import { db } from "../config/db.js";
import { v7 as uuidv7 } from "uuid";

const table = "sl_news";

export const News = {
  getAllNews: async () => {
    return await db(`${table} as n`)
      .leftJoin("sl_news_images as ni", "n.news_id", "ni.news_id")
      .select(
        "n.news_id as id",
        "n.title as title",
        "n.article as article",
        "n.created_at as createdAt",
        "n.created_by as createdBy",
        db.raw("GROUP_CONCAT(ni.image_url) as imgUrls")
      )
      .groupBy("n.news_id");
  },

  getNewsArticle: async (id) => {
    return await db.select("*").from(table).where({ id: id });
  },

  addNewsArticle: async (data) => {
    const news_id = uuidv7();

    await db(table).insert({
      news_id,
      title: data.title,
      article: data.article,
      created_at: db.fn.now(),
      created_by: data.created_by,
    });

    return news_id;
  },
};
