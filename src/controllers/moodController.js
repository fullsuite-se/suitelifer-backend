import { Mood } from "../models/moodModel.js";

// Submit a new mood entry
export const submitMood = async (req, res) => {
  try {
    const { mood_level, note } = req.body;
    const user_id = req.user.id;

    // Validate mood level
    if (!mood_level || mood_level < 1 || mood_level > 5) {
      return res.status(400).json({
        success: false,
        message: "Mood level must be between 1 and 5"
      });
    }

    // Always create a new mood entry (stacking)
    const moodEntry = await Mood.createMoodEntry(user_id, mood_level, note);
    return res.status(201).json({
      success: true,
      message: "Mood submitted successfully",
      data: moodEntry
    });
  } catch (error) {
    console.error("Error submitting mood:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get today's mood
export const getTodayMood = async (req, res) => {
  try {
    const user_id = req.user.id;
    
    const todayMood = await Mood.getTodayMood(user_id);
    
    return res.status(200).json({
      success: true,
      data: todayMood
    });

  } catch (error) {
    console.error("Error fetching today's mood:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get mood history
export const getMoodHistory = async (req, res) => {
  try {
    const user_id = req.user.id;
    const limit = parseInt(req.query.limit) || 30;
    
    const moodHistory = await Mood.getMoodHistory(user_id, limit);
    
    return res.status(200).json({
      success: true,
      data: moodHistory
    });

  } catch (error) {
    console.error("Error fetching mood history:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get overall mood statistics
export const getMoodStats = async (req, res) => {
  try {
    const user_id = req.user.id;
    
    const stats = await Mood.getMoodStats(user_id);
    
    return res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error("Error fetching mood stats:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get weekly mood statistics
export const getWeeklyStats = async (req, res) => {
  try {
    const user_id = req.user.id;
    
    const weeklyStats = await Mood.getWeeklyStats(user_id);
    
    return res.status(200).json({
      success: true,
      data: weeklyStats
    });

  } catch (error) {
    console.error("Error fetching weekly mood stats:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get monthly mood statistics
export const getMonthlyStats = async (req, res) => {
  try {
    const user_id = req.user.id;
    
    const monthlyStats = await Mood.getMonthlyStats(user_id);
    
    return res.status(200).json({
      success: true,
      data: monthlyStats
    });

  } catch (error) {
    console.error("Error fetching monthly mood stats:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get yearly mood statistics
export const getYearlyStats = async (req, res) => {
  try {
    const user_id = req.user.id;
    
    const yearlyStats = await Mood.getYearlyStats(user_id);
    
    return res.status(200).json({
      success: true,
      data: yearlyStats
    });

  } catch (error) {
    console.error("Error fetching yearly mood stats:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get all mood data (combined endpoint for frontend fetchAllData function)
export const getAllMoodData = async (req, res) => {
  try {
    const user_id = req.user.id;
    
    // Fetch all data in parallel
    const [
      todayMood,
      moodHistory,
      moodStats,
      weeklyStats,
      monthlyStats,
      yearlyStats
    ] = await Promise.all([
      Mood.getTodayMood(user_id),
      Mood.getMoodHistory(user_id, 30),
      Mood.getMoodStats(user_id),
      Mood.getWeeklyStats(user_id),
      Mood.getMonthlyStats(user_id),
      Mood.getYearlyStats(user_id)
    ]);
    
    return res.status(200).json({
      success: true,
      data: {
        todayMood,
        moodHistory,
        moodStats,
        weeklyStats,
        monthlyStats,
        yearlyStats
      }
    });

  } catch (error) {
    console.error("Error fetching all mood data:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get mood distribution for charts
export const getMoodDistribution = async (req, res) => {
  try {
    const user_id = req.user.id;
    const days = parseInt(req.query.days) || 30;
    
    const distribution = await Mood.getMoodDistribution(user_id, days);
    
    return res.status(200).json({
      success: true,
      data: distribution
    });

  } catch (error) {
    console.error("Error fetching mood distribution:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get mood trends over time
export const getMoodTrends = async (req, res) => {
  try {
    const user_id = req.user.id;
    const days = parseInt(req.query.days) || 30;
    
    const trends = await Mood.getMoodTrends(user_id, days);
    
    return res.status(200).json({
      success: true,
      data: trends
    });

  } catch (error) {
    console.error("Error fetching mood trends:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Delete mood entry
export const deleteMoodEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    
    const deleted = await Mood.deleteMoodEntry(id, user_id);
    
    if (deleted === 0) {
      return res.status(404).json({
        success: false,
        message: "Mood entry not found or unauthorized"
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Mood entry deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting mood entry:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};
