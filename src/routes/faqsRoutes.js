import express from "express";
import {getAllFaqs, insertFaq, updateFaq, deleteFaq} from "../controllers/faqController.js";

const router = express.Router();

router.get("/get-all-faqs", getAllFaqs);

router.post("/add-faq", insertFaq);

router.post("/edit-faq", updateFaq);

router.post("/delete-faq", deleteFaq);

export default router;
