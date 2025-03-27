import { Testimonial } from "../models/testimonialModel.js";

export const getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.getAllTestimonials();

    res.status(200).json({ success: true, data: testimonials });
  } catch (err) {
    console.error("Error fetching testimonials:", err.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
