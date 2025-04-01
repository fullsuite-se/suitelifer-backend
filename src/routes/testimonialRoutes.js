import express from "express";
import {getAllTestimonials, insertTestimonial, updateTestimonial, deleteTestimonial} from "../controllers/testimonialController.js";

const router = express.Router();

router.get("/get-all-testimonials", getAllTestimonials);

router.post("/add-testimonial", insertTestimonial);

router.post("/edit-testimonial", updateTestimonial);

router.delete("/delete-testimonial/:testimonial_id", deleteTestimonial);
export default router;
