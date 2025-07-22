import { TermsOfUse } from "../models/termsOfUseModel.js";
import { now } from "../utils/date.js";
import { v7 as uuidv7 } from "uuid";

export const getAllTerms = async (req, res) => {
  try {
    const terms = await TermsOfUse.getAllTerms();
    res.status(200).json({ success: true, terms });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching terms", error });
  }
};

export const addTerms = async (req, res) => {
  try {
    const { title, description, userId } = req.body;
    const newTerms = {
      terms_id: uuidv7(),
      title,
      description,
      created_at: now(),
      created_by: userId,
    };

    await TermsOfUse.addTerms(newTerms);
    res.status(201).json({ success: true, message: "Terms added" });
  } catch (error) {
    console.error("Error adding terms:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to add terms", error });
  }
};

export const updateTerms = async (req, res) => {
  const { termsId, title, description } = req.body;
  if (!termsId || !title || !description) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  try {
    await TermsOfUse.updateTerms(termsId, { title, description });
    res.status(200).json({ success: true, message: "Terms updated" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to update terms", error });
  }
};

export const deleteTerms = async (req, res) => {
  const { termsId } = req.body;
  if (!termsId) {
    return res.status(400).json({ success: false, message: "Missing termsId" });
  }

  try {
    await TermsOfUse.deleteTerms(termsId);
    res.status(200).json({ success: true, message: "Terms deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to delete terms", error });
  }
};
