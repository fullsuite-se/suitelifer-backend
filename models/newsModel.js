import { db } from "../config/db.js";

export const News = {
    getAllNews: async () => {
        return await db("sl_news");
    },
    getNewsArticle: async (id) => {
        return await db.select("*").from("sl_news").where({id: id});
    }
}