import { Mood } from "../models/moodModel.js";
import { db } from "../config/db.js";

// Test version of submitMood that accepts user_id in request body
export const testSubmitMood = async (req, res) => {
  try {
    const { user_id, mood_level, notes } = req.body;

    // Validate required fields
    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id is required"
      });
    }

    // Validate mood level
    if (!mood_level || mood_level < 1 || mood_level > 5) {
      return res.status(400).json({
        success: false,
        message: "Mood level must be between 1 and 5"
      });
    }

    // Check if user already submitted mood today
    const todayMood = await Mood.getTodayMood(user_id);
    
    if (todayMood) {
      // Update existing mood entry for today
      await Mood.updateMoodEntry(todayMood.id, user_id, mood_level, notes);
      
      return res.status(200).json({
        success: true,
        message: "Mood updated successfully",
        data: {
          id: todayMood.id,
          mood_level,
          notes,
          updated_at: new Date()
        }
      });
    } else {
      // Create new mood entry
      const moodEntry = await Mood.createMoodEntry(user_id, mood_level, notes);
      
      return res.status(201).json({
        success: true,
        message: "Mood submitted successfully",
        data: moodEntry
      });
    }

  } catch (error) {
    console.error("Error submitting mood:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Test version of getMoodHistory that accepts userId from URL params
export const testGetMoodHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 30, offset = 0 } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required"
      });
    }

    const moodHistory = await Mood.getMoodHistory(userId, parseInt(limit), parseInt(offset));

    return res.status(200).json({
      success: true,
      data: moodHistory
    });

  } catch (error) {
    console.error("Error getting mood history:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Test version of getMoodStats that accepts userId from URL params
export const testGetMoodStats = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required"
      });
    }

    const stats = await Mood.getMoodStats(userId);

    return res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error("Error getting mood stats:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Test version of getAllMoodData
export const testGetAllMoodData = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const allMoods = await Mood.getAllMoodData(parseInt(limit), parseInt(offset));

    return res.status(200).json({
      success: true,
      data: allMoods
    });

  } catch (error) {
    console.error("Error getting all mood data:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Test version of deleteMoodEntry
export const testDeleteMoodEntry = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Mood entry ID is required"
      });
    }

    // For testing, we'll delete by ID only (modify the model call)
    const deleted = await db('sl_mood_logs').where({ id }).del();
    
    if (deleted) {
      return res.status(200).json({
        success: true,
        message: "Mood entry deleted successfully"
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Mood entry not found"
      });
    }

  } catch (error) {
    console.error("Error deleting mood entry:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};
