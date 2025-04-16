import express from "express";
import {
  addNewsArticle,
  getAllNews,
  getNewsById,
} from "../controllers/newsController.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/all-news", getAllNews);

router.get("/get-news/:id", getNewsById);

router.post("/add-news", verifyToken, addNewsArticle);

export default router;
