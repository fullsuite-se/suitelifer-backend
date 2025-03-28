import { Testimonial } from "../models/testimonialModel.js";
import { v7 as uuidv7 } from "uuid";
import { company_id } from "../config/companyConfig.js";
import { now } from "../utils/date.js";

export const getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.getAllTestimonials();

    res.status(200).json({ success: true, testimonials: testimonials });
  } catch (err) {
    console.error("Error fetching testimonials:", err.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};



export const insertTestimonial = async (req, res) => {
  try {
    const { employee_image_url, employee_name, position, testimony, is_shown, user_id } = req.body;

    console.log(req.body);
    
    // Validate required fields
    // if (!employee_image_url || !employee_name || !position || !testimony || !is_shown || !user_id) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Missing required fields: employee_image_url, employee_name, position, testimony, is_shown, or user_id",
    //   });
    // }

    const newTestimonial = {
      testimonial_id: uuidv7(),
      employee_image_url: employee_image_url,
      employee_name: employee_name,
      position: position,
      testimony: testimony,
      is_shown: is_shown,
      created_at: now(),
      created_by: user_id, 
    };

    console.log(newTestimonial);
    
    await Testimonial.insertTestimonial(newTestimonial);

    res.status(201).json({ success: true, message: "Testimonial added successfully." });
  } catch (err) {
    console.error("Error inserting testimonial:", err.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error: " + err.message,
    });
  }
};