import { db } from "../config/db.js";

const moodTable = "sl_mood_logs";
const userTable = "sl_user_accounts";

export const Mood = {
  // Create a new mood entry
  createMoodEntry: async (user_id, mood_level, notes = null) => {
    const moodEntry = {
      user_id,
      mood_level,
      notes,
      created_at: new Date(),
      updated_at: new Date()
    };

    const [id] = await db(moodTable).insert(moodEntry);
    return { id, ...moodEntry };
  },

  // Get today's mood for a user
  getTodayMood: async (user_id) => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    return await db(moodTable)
      .where({ user_id })
      .whereBetween('created_at', [startOfDay, endOfDay])
      .orderBy('created_at', 'desc')
      .first();
  },

  // Get mood history for a user
  getMoodHistory: async (user_id, limit = 30) => {
    return await db(moodTable)
      .select(
        'id',
        'mood_level',
        'notes',
        'created_at',
        'updated_at'
      )
      .where({ user_id })
      .orderBy('created_at', 'desc')
      .limit(limit);
  },

  // Get overall mood statistics
  getMoodStats: async (user_id) => {
    const result = await db(moodTable)
      .where({ user_id })
      .select(
        db.raw('COUNT(*) as total_entries'),
        db.raw('AVG(mood_level) as avg_mood'),
        db.raw('MIN(mood_level) as min_mood'),
        db.raw('MAX(mood_level) as max_mood'),
        db.raw('MIN(created_at) as first_entry'),
        db.raw('MAX(created_at) as last_entry')
      )
      .first();

    return result;
  },

  // Get weekly mood statistics
  getWeeklyStats: async (user_id) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const result = await db(moodTable)
      .where({ user_id })
      .where('created_at', '>=', oneWeekAgo)
      .select(
        db.raw('COUNT(*) as total_entries'),
        db.raw('AVG(mood_level) as avg_mood'),
        db.raw('MIN(mood_level) as min_mood'),
        db.raw('MAX(mood_level) as max_mood')
      )
      .first();

    return result;
  },

  // Get monthly mood statistics
  getMonthlyStats: async (user_id) => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const result = await db(moodTable)
      .where({ user_id })
      .where('created_at', '>=', oneMonthAgo)
      .select(
        db.raw('COUNT(*) as total_entries'),
        db.raw('AVG(mood_level) as avg_mood'),
        db.raw('MIN(mood_level) as min_mood'),
        db.raw('MAX(mood_level) as max_mood')
      )
      .first();

    return result;
  },

  // Get yearly mood statistics
  getYearlyStats: async (user_id) => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const result = await db(moodTable)
      .where({ user_id })
      .where('created_at', '>=', oneYearAgo)
      .select(
        db.raw('COUNT(*) as total_entries'),
        db.raw('AVG(mood_level) as avg_mood'),
        db.raw('MIN(mood_level) as min_mood'),
        db.raw('MAX(mood_level) as max_mood')
      )
      .first();

    return result;
  },

  // Update mood entry
  updateMoodEntry: async (id, user_id, mood_level, notes = null) => {
    const updated = await db(moodTable)
      .where({ id, user_id })
      .update({
        mood_level,
        notes,
        updated_at: new Date()
      });

    return updated;
  },

  // Delete mood entry
  deleteMoodEntry: async (id, user_id) => {
    return await db(moodTable)
      .where({ id, user_id })
      .del();
  },

  // Get mood distribution for charts
  getMoodDistribution: async (user_id, days = 30) => {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);

    const result = await db(moodTable)
      .where({ user_id })
      .where('created_at', '>=', dateLimit)
      .select(
        'mood_level',
        db.raw('COUNT(*) as count')
      )
      .groupBy('mood_level')
      .orderBy('mood_level');

    return result;
  },

  // Get mood trends over time
  getMoodTrends: async (user_id, days = 30) => {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);

    const result = await db(moodTable)
      .where({ user_id })
      .where('created_at', '>=', dateLimit)
      .select(
        db.raw('DATE(created_at) as date'),
        db.raw('AVG(mood_level) as avg_mood'),
        db.raw('COUNT(*) as entries')
      )
      .groupBy(db.raw('DATE(created_at)'))
      .orderBy('date');

    return result;
  },

  // Get all mood data (for admin/testing purposes)
  getAllMoodData: async (limit = 50, offset = 0) => {
    return await db(moodTable)
      .select(
        'id',
        'user_id',
        'mood_level',
        'notes',
        'created_at',
        'updated_at'
      )
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
  }
};
