import { Certification } from "../models/certificationModel.js";
import { now } from "../utils/date.js";
import { v7 as uuidv7 } from "uuid";

export const getAllCertifications = async (req, res) => {
  try {
    const certifications = await Certification.getAllCertifications();

    res.status(200).json({ success: true, certifications });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch certifications", error });
  }
};

export const addCert = async (req, res) => {
  try {
    const { certImageUrl, userId } = req.body;

    if (!certImageUrl || !userId) {
      return res.status(400).json({
        success: true,
        message: "Missing required fields: certification image url or user id",
      });
    }

    const newCertification = {
      cert_id: uuidv7(),
      cert_img_url: certImageUrl,
      created_at: now(),
      created_by: userId,
    };

    await Certification.addCertification(newCertification);

    res
      .status(201)
      .json({ success: true, message: "Certification Added Successfully" });
  } catch (error) {
    console.error("Error adding certification:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateCert = async (req, res) => {
  try {
    const { certId, certImageUrl, userId } = req.body;

    if (!certId || !certImageUrl || !userId) {
      return res.status(400).json({
        success: true,
        message:
          "Missing required fields: certification id, certification image url, or user id",
      });
    }

    await Certification.updateCertification(certId, certImageUrl);

    res
      .status(200)
      .json({ success: true, message: "Certification updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update certification", error });
  }
};

export const deleteCert = async (req, res) => {
  try {
    const { certId } = req.body;

    if (!certId) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: certification id",
      });
    }

    await Certification.deleteCertification(certId);

    res.status(200).json({ success: true, message: "Certification Deleted Successfully" });
  } catch (error) {
    console.error("Server error while deleting cert:", error);
    res.status(500).json({ message: "Failed to delete certification", error });
  }
};
