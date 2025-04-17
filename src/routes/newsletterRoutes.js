import express from "express";
import {
  getNewsletters,
  insertNewsletter,
} from "../controllers/newsletterController.js";

const router = express.Router();

router.get("/newsletter", getNewsletters);

router.post("/newsletter", insertNewsletter);

export default router;
