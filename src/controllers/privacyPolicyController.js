import { PrivacyPolicy } from "../models/privacyPolicyModel.js";
import { now } from "../utils/date.js";
import { v7 as uuidv7 } from "uuid";

export const getAllPolicy = async (req, res) => {
  try {
    const policy = await PrivacyPolicy.getAllPolicies();
    res.status(200).json({ success: true, policy });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching policy", error });
  }
};

export const addPolicy = async (req, res) => {
  try {
    const { title, description, userId } = req.body;
    const newPolicy = {
      policy_id: uuidv7(),
      title,
      description,
      created_at: now(),
      created_by: userId,
    };

    await PrivacyPolicy.addPolicy(newPolicy);
    res.status(201).json({ success: true, message: "Privacy Policy added" });
  } catch (error) {
    console.error("Error adding policy:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to add policy", error });
  }
};

export const updatePolicy = async (req, res) => {
  const { policyId, title, description } = req.body;
  if (!policyId || !title || !description) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  try {
    await PrivacyPolicy.updatePolicy(policyId, { title, description });
    res.status(200).json({ success: true, message: "Privacy Policy updated" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to update policy", error });
  }
};

export const deletePolicy = async (req, res) => {
  const { policyId } = req.body;
  if (!policyId) {
    return res.status(400).json({ success: false, message: "Missing policyId" });
  }

  try {
    await PrivacyPolicy.deletePolicy(policyId);
    res.status(200).json({ success: true, message: "Privacy Policy deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to delete policy", error });
  }
};
