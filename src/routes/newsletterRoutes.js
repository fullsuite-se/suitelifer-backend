import express from "express";
import {
  deleteNewsletter,
  getCurrentlyPublishedIssue,
  getOldestPublishedIssue,
  getIssues,
  getNewsletters,
  getNewsletterById,
  insertIssue,
  insertNewsletter,
  updateCurrentlyPublished,
  updateNewsletter,
} from "../controllers/newsletterController.js";

const router = express.Router();

router.get("/issues", getIssues);

router.get("/issues/oldest", getOldestPublishedIssue);

router.get("/issues/current", getCurrentlyPublishedIssue);

router.post("/issues", insertIssue);

router.patch("/issues", updateCurrentlyPublished);

router.get("/newsletter", getNewsletters);

router.get("/newsletter/:id", getNewsletterById);

router.post("/newsletter", insertNewsletter);

router.put("/newsletter", updateNewsletter);

router.delete("/newsletter", deleteNewsletter);

export default router;
