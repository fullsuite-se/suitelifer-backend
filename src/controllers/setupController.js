import { Setup } from "../models/setupModel.js";
import { v7 as uuidv7 } from "uuid";
import { now } from "../utils/date.js";

export const getAllSetups = async (req, res) => {
  try {
    const setups = await Setup.getAllSetups();

    res.status(200).json({ success: true, data: setups });
  } catch (err) {
    console.error("Error fetching setups:", err.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const insertSetup = async (req, res) => {
  try {
    const { setup_name, user_id } = req.body;

    // VALIDATE REQUIRED FIELDS
    if (!setup_name) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: setup name",
      });
    }

    const newSetup = {
      setup_id: uuidv7(),
      setup_name,
      created_at: now(),
      created_by: user_id,
    };

    // INSERT SETUP INTO THE DATABASE
    await Setup.insertSetup(newSetup);

    res
      .status(201)
      .json({ success: true, message: "Setup added successfully" });
  } catch (err) {
    console.error("Error inserting setup:", err.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateSetup = async (req, res) => {
  try {
    const { setup_id, setup_name, user_id } = req.body;

    // VALIDATE REQUIRED FIELDS
    if (!setup_id || !setup_name) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: setup id or setup name",
      });
    }

    // ATTEMPT TO UPDATE THE SETUP
    const updatedSetup = await Setup.updateSetup(setup_id, setup_name);

    if (!updatedSetup) {
      return res.status(404).json({
        success: false,
        message: "Job setup not found or not updated",
      });
    }

    res.status(200).json({
      success: true,
      message: "Job setup updated successfully",
      data: updatedSetup,
    });
  } catch (err) {
    console.error("Error updating setup:", err.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const deleteSetup = async (req, res) => {
  try {
    const { setup_id, user_id } = req.body;

    // VALIDATE REQUIRED FIELD
    if (!setup_id) {
      return res.status(400).json({
        success: false,
        message: "Missing: setup id",
      });
    }

    // ATTEMPT TO DELETE THE SETUP
    const deletedSetup = await Setup.deleteSetup(setup_id);

    if (!deletedSetup) {
      return res.status(404).json({
        success: false,
        message: "Setup not found or already deleted",
      });
    }

    res.status(200).json({
      success: true,
      message: "Setup deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting setup:", err.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
