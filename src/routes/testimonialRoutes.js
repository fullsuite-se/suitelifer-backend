import express from "express";
import {
  deleteTestimonial,
  editTestimonial,
  getAllTestimonials,
  getShownTestimonials,
  insertTestimonial,
} from "../controllers/testimonialController.js";

const router = express.Router();

router.get("/testimonials/shown", getShownTestimonials)

router.get("/testimonials", getAllTestimonials);

router.post("/testimonials", insertTestimonial);

router.put("/testimonials", editTestimonial);

router.delete("/testimonials", deleteTestimonial);

export default router;
