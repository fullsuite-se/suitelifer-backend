import { db } from "../config/db.js";

export const News = {
    getAllNews: async () => {
        return await db("sl_news");
    },
}