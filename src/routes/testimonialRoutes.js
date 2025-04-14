import express from "express";
import {
  getAllTestimonials, insertTestimonial, updateTestimonial, deleteTestimonial,
} from "../controllers/testimonialController.js";

const router = express.Router();

router.get("/testimonials", getAllTestimonials);

router.post("/testimonials", insertTestimonial);

router.post("/edit-testimonial", updateTestimonial);

router.post("/delete-testimonial", deleteTestimonial);
export default router;
