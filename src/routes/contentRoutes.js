import express from "express";
import { getAboutUs, insertContent } from "../controllers/contentController.js";

const router = express.Router();

router.get("/get-content", getAboutUs);

router.post("/add-content", insertContent);

export default router;
