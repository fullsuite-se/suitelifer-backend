import { SalaryRange } from "../models/salaryRangeModel.js";

export const getLastSalaryRange = async (req, res) => {
  try {
    const lastSalaryRange = await SalaryRange.getLastSalaryRange();

    res.status(200).json({ success: true, data: lastSalaryRange });
  } catch (err) {
    console.error("Error fetching last salary range:", err.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getSalaryRange = async (req, res) => {
  try {
    const lastSalaryRange = await SalaryRange.getLastSalaryRange();

    res.status(200).json({ success: true, data: lastSalaryRange });
  } catch (err) {
    console.error("Error fetching last salary range:", err.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export const insertSalaryRange = async (req, res) => {
  try {
    const { min_value, max_value } = req.body;

    // INSERT SALARY RANGE INTO THE DATABASE
    await SalaryRange.insertSalaryRange(min_value, max_value);

    res
      .status(201)
      .json({ success: true, message: "Salary range added successfully" });
  } catch (err) {
    console.error("Error inserting salary range:", err.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateSalaryRange = async (req, res) => {
  try {
    const { salary_range_id, min_value, max_value } = req.body;

    // VALIDATE REQUIRED FIELDS
    if (!salary_range_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: salary range id",
      });
    }

    // ATTEMPT TO UPDATE THE SETUP
    const updatedSalaryRange = await SalaryRange.updateSalaryRange(
      salary_range_id,
      min_value,
      max_value
    );

    if (!updateSalaryRange) {
      return res.status(404).json({
        success: false,
        message: "Salary range not found or not updated",
      });
    }

    res.status(200).json({
        success: true,
        message: "Salary range updated successfully",
        data: updatedSalaryRange
    })
  } catch (err) {
    console.error("Error updating salary range:", err.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
