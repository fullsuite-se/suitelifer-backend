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
  try {
    const { cert_img_url } = req.body;
    const created_by = req.user.user_id;
    const created_at = new Date();

    await Cert.addCert({ cert_img_url, created_by, created_at });

    res.status(201).json({ message: "Certification added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to add certification", error });
  }
};

export const updateCert = async (req, res) => {
  try {
    const { cert_id, cert_img_url } = req.body;
    const updated_at = new Date.now();

    await Cert.updateCert(cert_id, { cert_img_url, updated_at });

    res.status(200).json({ message: "Certification updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update certification", error });
  }
};

export const deleteCert = async (req, res) => {
  try {
    const { cert_id } = req.body;

    await Cert.deleteCert(cert_id);

    res.status(200).json({ message: "Certification deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete certification", error });
  }
};
