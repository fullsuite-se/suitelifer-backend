import express from "express";
import {getAllTestimonials, insertTestimonial} from "../controllers/testimonialController.js";

const router = express.Router();

router.get("/get-all-testimonials", getAllTestimonials);

router.post("/add-testimonial", insertTestimonial);

export default router;
