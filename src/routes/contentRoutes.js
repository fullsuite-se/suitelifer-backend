import express from "express";
import { getAboutUs } from "../controllers/contentController.js";

const router = express.Router();

router.get("/get-about-us", getAboutUs);

export default router;
