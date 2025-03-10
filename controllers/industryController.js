import { Industry } from "../models/industryModel.js";
import { v7 as uuidv7 } from "uuid";
import { company_id } from "../config/companyConfig.js";
import { now } from "../utils/date.js";

export const getAllIndustries = async (req, res) => {
  try {
    const allIndustries = await Industry.getAllIndustries();
    res.status(200).json({ success: true, data: allIndustries });
  } catch (err) {
    console.error("Error fetching all industries:", err.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getAllIndustriesHR = async (req, res) => {
  try {
    const allIndustriesHR = await Industry.getAllIndustriesHR();
    res.status(200).json({ success: true, data: allIndustriesHR });
  } catch (err) {
    console.error("Error fetching all industries for HR:", err.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getAllIndustriesPR = async (req, res) => {
  try {
    const allIndustriesPR = await Industry.getAllIndustriesPR();
    res.status(200).json({ success: true, data: allIndustriesPR });
  } catch (err) {
    console.error("Error fetching all industries for PR:", err.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const insertIndustry = async (req, res) => {
  try {
    const { industry_name, assessment_url, user_id } = req.body;

    // VALIDATE REQUIRED FIELDS
    if (!industry_name || !assessment_url) {
      res.status(400).json({
        success: false,
        message: "Missing required fields: industry name or assessment url",
      });
    }

    const newIndustry = {
      job_id_id: uuidv7(),
      industry_name,
      company_id,
      image_url: null,
      assessment_url,
      created_at: now(),
      created_by: user_id,
    };

    // INSERT INDUSTRY INTO THE DATABASE
    await Industry.insertIndustry(newIndustry);

    res
      .status(201)
      .json({ success: true, message: "Job Industry added successfully." });
  } catch (err) {
    console.error("Error inserting industry:", err.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateIndustry = async (req, res) => {
  try {
    const { industry_id, industry_name, assessment_url, user_id } = req.body;

    if (!industry_id || !industry_name || !assessment_url) {
      res.status(400).json({
        success: false,
        message:
          "Missing required fields: industry id, industry name, or assessment url",
      });
    }

    const updates = {
      industry_name,
      assessment_url,
    };

    const updatedIndustry = await Industry.updateIndustry(industry_id, updates);

    if (!updatedIndustry) {
      res
        .status(404)
        .json({ success: false, message: "Industry not found or not updated" });
    }

    res
      .status(200)
      .json({ success: true, message: "Industry updated successfully" });
  } catch (err) {
    console.error("Error updating industry:", err.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateIndustryPR = async (req, res) => {
  try {
    const { industry_id, industry_name, image_url, user_id } = req.body;

    if (!industry_id || !industry_name || !image_url) {
      res.status(400).json({
        success: false,
        message:
          "Missing required fields: industry id, industry name, or image url",
      });
    }

    const updates = {
      industry_name,
      image_url,
    };

    const updatedIndustry = await Industry.updateIndustry(industry_id, updates);

    if (!updatedIndustry) {
      res
        .status(404)
        .json({ success: false, message: "Industry not found or not updated" });
    }

    res
      .status(200)
      .json({ success: true, message: "Industry updated successfully" });
  } catch (err) {
    console.error("Error updating industry:", err.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const deleteIndustry = async (req, res) => {
  try {
    const { industry_id } = req.body;

    // VALIDATE REQUIRED FIELD
    if (!industry_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: industry id",
      });
    }

    const deletedIndustry = await Industry.deleteIndustry(industry_id);

    if (!deletedIndustry) {
      return res.status(404).json({
        success: false,
        message: "Industry not found or already deleted",
      });
    }

    res.status(200).json({
      success: true,
      message: "Industry deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting industry:", err.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
