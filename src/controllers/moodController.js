import { Mood } from '../models/moodModel.js';

// Record user's mood
export const recordMood = async (req, res) => {
  try {
    const userId = req.user.id; // Use id instead of user_id
    const { mood, intensity, note } = req.body;

    if (!mood) {
      return res.status(400).json({
        success: false,
        message: 'Mood is required'
      });
    }

    // Validate mood value
    const validMoods = ['happy', 'sad', 'angry', 'excited', 'calm', 'anxious', 'tired', 'energetic'];
    if (!validMoods.includes(mood.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mood value',
        validMoods
      });
    }

    // Validate intensity if provided
    if (intensity !== undefined && (intensity < 1 || intensity > 10)) {
      return res.status(400).json({
        success: false,
        message: 'Intensity must be between 1 and 10'
      });
    }

    const moodEntry = await Mood.createMood(userId, {
      mood: mood.toLowerCase(),
      intensity: intensity || 5,
      note: note || null
    });
    
    res.status(201).json({
      success: true,
      data: moodEntry,
      message: 'Mood recorded successfully'
    });
  } catch (error) {
    console.error('Error recording mood:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record mood'
    });
  }
};

// Get user's mood history
export const getMoodHistory = async (req, res) => {
  try {
    const userId = req.user.id; // Use id instead of user_id
    const { 
      page = 1, 
      limit = 20, 
      startDate, 
      endDate,
      mood 
    } = req.query;

    const history = await Mood.getUserMoods(userId, {
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      startDate,
      endDate,
      mood
    });
    
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error fetching mood history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mood history'
    });
  }
};

// Get user's latest mood
export const getLatestMood = async (req, res) => {
  try {
    const userId = req.user.id; // Use id instead of user_id
    const latestMood = await Mood.getLatestMood(userId);
    
    res.json({
      success: true,
      data: latestMood
    });
  } catch (error) {
    console.error('Error fetching latest mood:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch latest mood'
    });
  }
};

// Enhanced mood analytics
export const getMoodAnalytics = async (req, res) => {
  try {
    const user_id = req.user.id; // Use id instead of user_id
    const { days = 30 } = req.query;

    const analytics = await Mood.getUserMoodAnalytics(user_id, parseInt(days));
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error("Error fetching mood analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch mood analytics"
    });
  }
};

export const getCompanyMoodAnalytics = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const analytics = await Mood.getCompanyMoodAnalytics(parseInt(days));
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error("Error fetching company mood analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch company mood analytics"
    });
  }
};

// Update a mood entry
export const updateMood = async (req, res) => {
  try {
    const userId = req.user.id; // Use id instead of user_id
    const { id } = req.params;
    const { mood, intensity, note } = req.body;

    // Validate mood value if provided
    if (mood) {
      const validMoods = ['happy', 'sad', 'angry', 'excited', 'calm', 'anxious', 'tired', 'energetic'];
      if (!validMoods.includes(mood.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid mood value',
          validMoods
        });
      }
    }

    // Validate intensity if provided
    if (intensity !== undefined && (intensity < 1 || intensity > 10)) {
      return res.status(400).json({
        success: false,
        message: 'Intensity must be between 1 and 10'
      });
    }

    const updates = {};
    if (mood) updates.mood = mood.toLowerCase();
    if (intensity !== undefined) updates.intensity = intensity;
    if (note !== undefined) updates.note = note;

    const updated = await Mood.updateMood(userId, id, updates);
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Mood entry not found or not authorized'
      });
    }

    res.json({
      success: true,
      message: 'Mood updated successfully'
    });
  } catch (error) {
    console.error('Error updating mood:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update mood'
    });
  }
};

// Delete a mood entry
export const deleteMood = async (req, res) => {
  try {
    const userId = req.user.id; // Use id instead of user_id
    const { id } = req.params;

    const deleted = await Mood.deleteMood(userId, id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Mood entry not found or not authorized'
      });
    }

    res.json({
      success: true,
      message: 'Mood entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting mood:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete mood entry'
    });
  }
};

// Get mood trends for user
export const getMoodTrends = async (req, res) => {
  try {
    const userId = req.user.id; // Use id instead of user_id
    const { days = 30, groupBy = 'day' } = req.query;
    
    const trends = await Mood.getMoodTrends(userId, parseInt(days), groupBy);
    
    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    console.error('Error fetching mood trends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mood trends'
    });
  }
};

// Get mood insights and recommendations
export const getMoodInsights = async (req, res) => {
  try {
    const userId = req.user.id; // Use id instead of user_id
    const { days = 30 } = req.query;
    
    const insights = await Mood.getMoodInsights(userId, parseInt(days));
    
    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('Error fetching mood insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mood insights'
    });
  }
};

// Admin: Get overall mood analytics
export const getOverallMoodAnalytics = async (req, res) => {
  try {
    const { days = 30, groupBy = 'day' } = req.query;
    
    const analytics = await Mood.getOverallMoodAnalytics(parseInt(days), groupBy);
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching overall mood analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch overall mood analytics'
    });
  }
};

// Admin: Get mood statistics
export const getMoodStatistics = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const statistics = await Mood.getMoodStatistics(parseInt(days));
    
    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Error fetching mood statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mood statistics'
    });
  }
};

// Get available mood options
export const getMoodOptions = async (req, res) => {
  try {
    const moodOptions = [
      { value: 'happy', label: 'Happy', emoji: '😊' },
      { value: 'sad', label: 'Sad', emoji: '😢' },
      { value: 'angry', label: 'Angry', emoji: '😠' },
      { value: 'excited', label: 'Excited', emoji: '🤩' },
      { value: 'calm', label: 'Calm', emoji: '😌' },
      { value: 'anxious', label: 'Anxious', emoji: '😰' },
      { value: 'tired', label: 'Tired', emoji: '😴' },
      { value: 'energetic', label: 'Energetic', emoji: '⚡' }
    ];
    
    res.json({
      success: true,
      data: moodOptions
    });
  } catch (error) {
    console.error('Error fetching mood options:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mood options'
    });
  }
};