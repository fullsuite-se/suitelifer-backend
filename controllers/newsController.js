import { News } from "../models/newsModel.js";

export const getAllNews = async (req, res) => {
  try {
    const news = await News.getAllNews();
    res.status(200).json(news);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getNewsArticle = async (req, res) => {
  try {
    const { id } = req.params;

    const newsArticle = await News.getNewsArticle(id);

    res.status(200).json(newsArticle);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
