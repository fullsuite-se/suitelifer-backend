import { PersonalityTest } from "../models/personalityTestModel.js";
import { v7 as uuidv7 } from "uuid";
import { now } from "../utils/date.js";

export const getAllPersonalityTests = async (req, res) => {
  try {
    const personalityTests = await PersonalityTest.getAllPersonalityTests();

    res.status(200).json({ success: true, personalityTests });
  } catch (err) {
    console.error("Error fetching personality tests:", err.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const insertPersonalityTest = async (req, res) => {
  try {
    const { testTitle, testUrl, testDescription, userId } = req.body;

    if (!testTitle || !testUrl || !testDescription) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: test title, test description, or url",
      });
    }

    const newPersonalityTest = {
      test_id: uuidv7(),
      test_title: testTitle,
      test_url: testUrl,
      test_description: testDescription,
      created_at: now(),
      created_by: userId,
    };

    await PersonalityTest.insertPersonalityTest(newPersonalityTest);

    res
      .status(201)
      .json({ success: true, message: "Personality Test added successfully" });
  } catch (err) {
    console.error("Error inserting personality test:", err.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updatePersonalityTest = async (req, res) => {
  try {
    const { testId, testTitle, testUrl, testDescription, userId } = req.body;

    if (!testId || !testTitle || !testUrl || !testDescription) {
      return res.status(400).json({
        success: false,
        message: "Mising required fields: test_id, test_title, or url",
      });
    }

    const updatedDetails = {
      test_title: testTitle,
      test_url: testUrl,
      test_description: testDescription,
    };

    const updatedPersonalityTest = await PersonalityTest.updatePersonalityTest(
      testId,
      updatedDetails
    );

    if (!updatedPersonalityTest) {
      return res.status(404).json({
        success: false,
        message: "Personality Test not found or not updated",
      });
    }

    res.status(200).json({
      success: true,
      message: "Personality Test successfully updated",
    });
  } catch (err) {
    console.error("Error updating personality test:", err.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deletePersonalityTest = async (req, res) => {
  try {
    const { testId } = req.body;

    if (!testId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required field: test_id" });
    }

    const deletedPersonalityTest = await PersonalityTest.deletePersonalityTest(
      testId
    );

    if (!deletedPersonalityTest) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Personality Test not found or already deleted",
        });
    }

    res
      .status(200)
      .json({
        success: true,
        message: "Personality Test deleted successfully",
      });
  } catch (err) {
    console.error("Error deleting personality test:", err.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
