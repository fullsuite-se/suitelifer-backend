import express from "express";
import getAllTestimonials from "../controllers/testimonialController.js";

const router = express.Router();

router.get("/get-all-testimonials", getAllTestimonials);

export default router;
