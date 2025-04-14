import express from "express";
import {
  getAllTestimonials, insertTestimonial
} from "../controllers/testimonialController.js";

const router = express.Router();

router.get("/testimonials", getAllTestimonials);

router.post("/testimonials", insertTestimonial);


export default router;
