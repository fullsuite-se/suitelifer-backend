import express from "express";
import {
  getAllFaqs,
  insertFaq,
  updateFaq,
  deleteFaq,
} from "../controllers/faqController.js";
import verifyToken from "../middlewares/verifyToken.js";
import verifyAdmin from "../middlewares/verifyAdmin.js";

const router = express.Router();

router.get("/get-all-faqs", getAllFaqs);

router.post("/add-faq", verifyToken, verifyAdmin, insertFaq);

router.post("/edit-faq", verifyToken, verifyAdmin, updateFaq);

router.post("/delete-faq", verifyToken, verifyAdmin, deleteFaq);

export default router;
