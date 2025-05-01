import { Testimonial } from "../models/testimonialModel.js";
import { v7 as uuidv7 } from "uuid";
import { now } from "../utils/date.js";

export const getShownTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.getShownTestimonials();

    res.status(200).json({ success: true, testimonials });
  } catch (err) {
    console.error("Error fetching shown testimonials:", err.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.getAllTestimonials();

    res.status(200).json({ success: true, testimonials })
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
      is_shown: isShown,
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

export const editTestimonial = async (req, res) => {
  try {
    const {
      testimonialId,
      employeeName,
      position,
      testimony,
      isShown,
      employeeImageUrl,
    } = req.body;

    if (
      !testimonialId ||
      !employeeName ||
      !position ||
      !testimony ||
      !employeeImageUrl
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: testimonial id, employee name, position, testimony, is shown, or employee image url",
      });
    }

    const updates = {
      employee_name: employeeName,
      position,
      testimony,
      is_shown: isShown,
      employee_image_url: employeeImageUrl,
    };

    await Testimonial.editTestimonial(testimonialId, updates);

    res
      .status(200)
      .json({ success: true, message: "Testimonial Successfully Updated!" });
  } catch (err) {
    console.error("Error updating testimonial:", err.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteTestimonial = async (req, res) => {
  try {
    const { testimonialId } = req.body;

    await Testimonial.deleteTestimonial(testimonialId);

    res
      .status(200)
      .json({ success: true, message: "Testimony Deleted Successfully" });
  } catch (err) {
    console.error("Error deleting testimonial:", err.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};