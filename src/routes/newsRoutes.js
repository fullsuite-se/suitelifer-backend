import express from "express";
import { addNewsArticle, getAllNews } from "../controllers/newsController.js";

const router = express.Router();

router.get("/all-news", getAllNews);

router.post("/add-news", addNewsArticle);

export default router;
