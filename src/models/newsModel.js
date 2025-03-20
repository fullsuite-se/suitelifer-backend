import { db } from "../config/db.js";
import { v7 as uuidv7 } from "uuid";

const table = "sl_news";

export const News = {
  getAllNews: async () => {
    const news = await db("sl_news as n")
      .leftJoin("sl_news_images as ni", "n.news_id", "ni.news_id")
      .innerJoin("hris_user_infos as u", "u.user_id", "n.created_by")
      .select(
        "n.news_id as id",
        "n.title as title",
        "n.article as article",
        "n.created_at as createdAt",
        "n.created_by as createdBy",
        db.raw(
          `CONCAT(u.first_name, " ", LEFT(u.middle_name, 1), ". ", u.last_name) as createdByName`
        ),
        db.raw("COALESCE(GROUP_CONCAT(ni.image_url), '') as imgUrls")
      )
      .groupBy("n.news_id");

    return news.map((item) => ({
      ...item,
      imgUrls: item.imgUrls ? item.imgUrls.split(",") : [],
    }));
  },

  getNewsById: async (id) => {
    const news = await db("sl_news as n")
      .leftJoin("sl_news_images as ni", "n.news_id", "ni.news_id")
      .select(
        "n.news_id as id",
        "n.title",
        "n.article",
        "n.created_at as createdAt",
        "n.created_by as createdBy",
        db.raw("COALESCE(GROUP_CONCAT(ni.image_url), '') as imgUrls")
      )
      .where("n.news_id", id)
      .groupBy("n.news_id")
      .first();

    return {
      ...news,
      imgUrls: news.imgUrls ? news.imgUrls.split(",") : [],
    };
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
