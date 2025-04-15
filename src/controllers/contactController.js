import { v7 as uuidv7 } from "uuid";
import { now } from "../utils/date.js";
import { Contact } from "../models/contactModel.js";

export const getContact = async (req, res) => {
  try {
    const contact = await Contact.getContact();

    res.status(200).json({ success: true, contact });
  } catch (err) {
    console.error("Error fetching contact:", err.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const insertContact = async (req, res) => {
  try {
    const {
      websiteEmail,
      websiteTel,
      websitePhone,
      careersEmail,
      internshipEmail,
      careersPhone,
      userId,
    } = req.body;

    if (
      !websiteEmail ||
      !websiteTel ||
      !websitePhone ||
      !careersEmail ||
      !internshipEmail ||
      !careersPhone ||
      !userId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: website email, website tel, website phone, careers email, internship email, careers phone, or user id",
      });
    }

    const newContact = {
      contact_id: uuidv7(),
      website_email: websiteEmail,
      website_tel: websiteTel,
      website_phone: websitePhone,
      careers_email: careersEmail,
      internship_email: internshipEmail,
      careers_phone: careersPhone,
      created_at: now(),
      created_by: userId,
    };

    await Contact.insertContact(newContact);

    res
      .status(201)
      .json({ success: true, message: "Contacts successfully updated" });
  } catch (err) {
    console.error("Error inserting contact:", err.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
