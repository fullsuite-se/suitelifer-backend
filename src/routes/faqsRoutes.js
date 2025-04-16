import express from "express";
import {
  getAllFaqs,
  insertFaq,
  updateFaq,
  deleteFaq,
} from "../controllers/faqController.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/get-all-faqs", getAllFaqs);

router.post("/add-faq", verifyToken, insertFaq);

router.post("/edit-faq", verifyToken, updateFaq);

router.post("/delete-faq", verifyToken, deleteFaq);

export default router;
