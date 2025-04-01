import { Testimonial } from "../models/testimonialModel.js";
import { v7 as uuidv7 } from "uuid";
import { company_id } from "../config/companyConfig.js";
import { now } from "../utils/date.js";
import cloudinary from "../utils/cloudinary.js";
import { Image } from "../models/imageModel.js";
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
    const { employee_image, employee_name, position, testimony, is_shown, user_id } = req.body;

    console.log("Received Data:", req.body);

    if (!employee_image || !employee_name || !position || !testimony || is_shown === undefined || !user_id) {
      console.log("Missing required fields");
      return res.status(400).json({
        success: false,
        message: "Missing required fields: employee_image, employee_name, position, testimony, is_shown, or user_id",
      });
    }

    if (is_shown !== 0 && is_shown !== 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid value for is_shown. It must be 0 or 1.",
      });
    }

    const cloudinaryUploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "suitelifer/employees" },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      stream.end(employee_image.buffer); 
    });

    const newTestimonial = {
      testimonial_id: uuidv7(),
      employee_image_url: cloudinaryUploadResult.secure_url, 
      employee_name,
      position,
      testimony,
      is_shown: Number(is_shown),
      created_at: now(),
      created_by: user_id, 
    };

    console.log(newTestimonial);

    await Testimonial.insertTestimonial(newTestimonial);

    res.status(201).json({ success: true, message: "Testimonial added successfully." });
    console.log("Testimonial added successfully:", newTestimonial);
  } catch (err) {
    console.error("Error inserting testimonial:", err.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error: " + err.message,
    });
  }
};




export const updateTestimonial = async (req, res) => {
  try {
    const {
      testimonial_id,
      employee_image_url,
      employee_name,
      position,
      testimony,
      is_shown,
      user_id
    } = req.body;

    console.log(req.body);

    if (
      !testimonial_id ||
      !employee_image_url ||
      !employee_name ||
      !position ||
      !testimony ||
      is_shown === undefined ||  
      !user_id
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    if (is_shown !== 0 && is_shown !== 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid value for is_shown. It must be 0 or 1.",
      });
    }

    const updates = {
      employee_image_url,
      employee_name,
      position,
      testimony,
      is_shown: Number(is_shown),  
    };

    const updatedTestimonial = await Testimonial.updateTestimonial(
      testimonial_id,
      updates
    );
    
    if (!updatedTestimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found or not updated",
      });
    }

    res.status(200).json({
      success: true,
      message: "Testimonial updated successfully",
      updatedTestimonial,  
    });
  } catch (err) {
    console.log("Error updating testimonial:", err.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};



// export const deleteTestimonial = async (req, res) => {
//   try {
//     const { testimonial_id } = req.body;

    
//     if (!testimonial_id) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing required field: testimonial id",
//       });
//     }

//     const deleteTestimonial = await Testimonial.deleteTestimonial(testimonial_id);

//     if (!deleteTestimonial) {
//       return res.status(404).json({
//         success: false,
//         message: "Testimonial not found or already deleted",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Testimonial deleted successfully",
//     });
//   } catch (err) {
//     console.log("Error deleting testimonial:", err);
//     res.status(500).json({ success: false, error: "Internal Server Error" });
//   }
// };


export const deleteTestimonial = async (req, res) => {
  try {
    const { testimonial_id } = req.params;

    if (!testimonial_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: testimonial id",
      });
    }

    const deleteTestimonial = await Testimonial.deleteTestimonial(testimonial_id);

    if (!deleteTestimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found or already deleted",
      });
    }

    res.status(200).json({
      success: true,
      message: "Testimonial deleted successfully",
    });
  } catch (err) {
    console.log("Error deleting testimonial:", err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};