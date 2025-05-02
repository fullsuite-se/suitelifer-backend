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
  insertNewsletterImages,
  deleteNewsletterImageByImageUrlCon,
  unpublishIssue,
} from "../controllers/newsletterController.js";

const router = express.Router();

router.get("/issues", getIssues);

router.get("/issues/oldest", getOldestPublishedIssue);

router.get("/issues/current", getCurrentlyPublishedIssue);

router.post("/issues", insertIssue);

router.patch("/issues", updateCurrentlyPublished);

router.patch("/issues/unpublish", unpublishIssue);

router.get("/newsletter", getNewsletters);

router.get("/newsletter/:id", getNewsletterById);

router.post("/newsletter", insertNewsletter);
router.post("/newsletterImages", insertNewsletterImages);

router.put("/newsletter", updateNewsletter);

router.delete("/newsletter", deleteNewsletter);

router.delete(
  "/delete-newsletter-by-imageurl",
  deleteNewsletterImageByImageUrlCon
);

export default router;
