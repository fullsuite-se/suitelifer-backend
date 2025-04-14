import { Testimonial } from "../models/testimonialModel.js";
import { v7 as uuidv7 } from "uuid";
import { now } from "../utils/date.js";

export const getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.getAllTestimonials();

    res.status(200).json({ success: true, testimonials });
  } catch (err) {
    console.error("Error fetching testimonials:", err.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const insertTestimonial = async (req, res) => {
  try {
    const {
      employeeName,
      position,
      testimony,
      employeeImageUrl,
      isShown,
      userId,
    } = req.body;

    const newTestimonial = {
      testimonial_id: uuidv7(),
      employee_name: employeeName,
      position,
      testimony,
      employee_image_url: employeeImageUrl,
      created_at: now(),
      created_by: userId,
    };

    await Testimonial.insertTestimonial(newTestimonial);

    res
      .status(201)
      .json({ success: true, message: "Testimonial Successfully Added" });
  } catch (err) {
    console.error("Error inserting testimonial:", err.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
