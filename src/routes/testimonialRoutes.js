import express from "express";
import {
  deleteTestimonial,
  editTestimonial,
  getAllTestimonials,
  getShownTestimonials,
  insertTestimonial,
} from "../controllers/testimonialController.js";
import verifyToken from "../middlewares/verifyToken.js";
import verifyAdmin from "../middlewares/verifyAdmin.js";

const router = express.Router();

router.get("/testimonials/shown", getShownTestimonials);

router.get("/testimonials", getAllTestimonials);

router.post("/testimonials", verifyToken, verifyAdmin, insertTestimonial);

router.put("/testimonials", verifyToken, verifyAdmin, editTestimonial);

router.delete("/testimonials", verifyToken, verifyAdmin, deleteTestimonial);

export default router;
