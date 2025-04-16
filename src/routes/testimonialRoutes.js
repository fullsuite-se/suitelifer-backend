import express from "express";
import {
  deleteTestimonial,
  editTestimonial,
  getAllTestimonials,
  getShownTestimonials,
  insertTestimonial,
} from "../controllers/testimonialController.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/testimonials/shown", getShownTestimonials);

router.get("/testimonials", getAllTestimonials);

router.post("/testimonials", verifyToken, insertTestimonial);

router.put("/testimonials", verifyToken, editTestimonial);

router.delete("/testimonials", verifyToken, deleteTestimonial);

export default router;
