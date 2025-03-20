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

export const getNewsById = async (req, res) => {
  try {
    const { id } = req.params;

    const newsArticle = await News.getNewsById(id);

    res.status(200).json(newsArticle);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const addNewsArticle = async (req, res) => {
  try {
    const data = req.body;

    if (!data.title || !data.article || !data.created_by) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newsId = await News.addNewsArticle(data);

    res.status(201).json({
      message: "News article added successfully",
      isSuccess: true,
      id: newsId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
