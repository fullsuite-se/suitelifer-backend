import { Cert } from "../models/certificationModel.js";
import { now } from "../utils/date.js";
import { v7 as uuidv7 } from "uuid";

export const getAllCert = async (req, res) => {
  try {
    const certs = await Cert.getAllCert();

    res.status(200).json(certs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch certifications", error });
  }
};

export const addCert = async (req, res) => {
  console.log("req", req.body);

  const cert_id = uuidv7();
  const cert_img_url = req.body.certImageUrl;
  const created_by = req.body.createdBy;
  const created_at = new Date();

  try {
    console.log("Inserting:", {
      cert_id,
      cert_img_url,
      created_by,
      created_at,
    });

    await Cert.addCert({ cert_id, cert_img_url, created_by, created_at });

    res.status(201).json({ message: "Certification added successfully" });
  } catch (error) {
    console.error("Error adding certification:", error);

    res.status(500).json({
      message: "Failed to add certification",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

export const updateCert = async (req, res) => {
  try {
    const cert_id = req.body.certId;
    const cert_img_url = req.body.certImageUrl;
    const created_by = req.body.userId;
    const updated_at = new Date.now();

    await Cert.updateCert({ cert_id, cert_img_url, created_by, created_at: updated_at });

    res.status(200).json({ message: "Certification updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update certification", error });
  }
};

export const deleteCert = async (req, res) => {
  try {
    const { cert_id } = req.body;

    if (!cert_id) {
      return res.status(400).json({ message: "cert_id is required" });
    }

    await Cert.deleteCert(cert_id);

    res.status(200).json({ message: "Certification deleted successfully" });
  } catch (error) {
    console.error("Server error while deleting cert:", error);
    res.status(500).json({ message: "Failed to delete certification", error });
  }
};
