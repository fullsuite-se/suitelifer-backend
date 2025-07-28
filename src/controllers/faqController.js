import { Faq } from "../models/faqModel.js";
import { v7 as uuidv7 } from "uuid";
import { company_id } from "../config/companyConfig.js";
import { now } from "../utils/date.js";

export const getAllFaqs = async (req, res) => {
  try {
    const faqs = await Faq.getAllFaqs();

    res.status(200).json({ success: true, faqs: faqs });
  } catch (err) {
    console.error("Error fetching faqs:", err.message);
    res.status(500).json({ success: false, message: err.message});
  }
};



export const insertFaq = async (req, res) => {
  try {
    const { question, answer, is_shown, user_id } = req.body;

    console.log("Received Data:", req.body);

    if (!question || !answer || is_shown === undefined || !user_id) {
      console.log("Missing required fields");
      return res.status(400).json({
        success: false,        message: "Missing required fields",
      });
    }

    // Ensure is_shown is a valid number (0 or 1)
    // if (is_shown !== 0 && is_shown !== 1) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Invalid value for is_shown. It must be 0 or 1.",
    //   });
    // }

    const newFaq = {
      faq_id: uuidv7(),
      question: question,
      answer: answer,
      is_shown: Number(is_shown), 
      created_at: now(),
      created_by: user_id, 
    };

    console.log(newFaq);
    
    await Faq.insertFaq(newFaq);

    res.status(201).json({ success: true, message: "Faq added successfully." });
    console.log("Faq added successfully:", newFaq);
  } catch (err) {
    console.error("Error inserting faq:", err.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error: " + err.message,
    });
  }
};



export const updateFaq = async (req, res) => {
  try {
    const {
      faq_id,
      question,
      answer,
      is_shown,
      user_id
    } = req.body;

    console.log(req.body);

    if (
      !faq_id ||
      !question ||
      !answer ||
      is_shown === undefined || 
      !user_id
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }


    const updates = {
     question,
     answer,
      is_shown: Number(is_shown),  
    };

    const updatedFaq = await Faq.updateFaq(
      faq_id,
      updates
    );
    
    if (!updatedFaq) {
      return res.status(404).json({
        success: false,
        message: "Faq not found or not updated",
      });
    }

    res.status(200).json({
      success: true,
      message: "Faq updated successfully",
      updatedFaq,  
    });
  } catch (err) {
    console.log("Error updating faq:", err.message);
    res.status(500).json({ success: false, error: err.message});
  }
};




export const deleteFaq = async (req, res) => {
  try {
    const { faq_id } = req.body;
    if (!faq_id) {
      console.log("Missing faq_id in request body");
      return res.status(400).json({
        success: false,
        message: "Missing required field: faq id",
      });
    }

    const deleteFaq = await Faq.deleteFaq(faq_id);

    if (!deleteFaq) {
      return res.status(404).json({
        success: false,
        message: "Faq not found or already deleted",
      });
    }

    res.status(200).json({
      success: true,
      message: "Faq deleted successfully",
    });
  } catch (err) {
    console.log("Error deleting faq:", err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

