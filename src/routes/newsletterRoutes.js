import express from "express";
import {
  deleteNewsletter,
  getIssues,
  getNewsletters,
  insertIssue,
  insertNewsletter,
  updateNewsletter,
} from "../controllers/newsletterController.js";

const router = express.Router();

router.get("/issues", getIssues);

router.post("/issues", insertIssue);

router.get("/newsletter", getNewsletters);

router.post("/newsletter", insertNewsletter);

router.put("/newsletter", updateNewsletter);

router.delete("/newsletter", deleteNewsletter);

export default router;
