import { db } from "../config/db.js";

const moodsTable = () => db("sl_moods");

export const Mood = {
  // Submit daily mood
  submitMood: async (user_id, moodData) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if user already submitted mood today
    const existingMood = await moodsTable()
      .where({ user_id })
      .where(db.raw("DATE(mood_date) = ?", [today]))
      .first();

    if (existingMood) {
      // Update existing mood
      return await moodsTable()
        .where({ mood_id: existingMood.mood_id })
        .update({
          mood: moodData.mood,
          comment: moodData.comment,
          tags: JSON.stringify(moodData.tags || []),
          updated_at: new Date()
        });
    } else {
      // Create new mood entry
      return await moodsTable().insert({
        user_id,
        mood: moodData.mood,
        comment: moodData.comment,
        tags: JSON.stringify(moodData.tags || []),
        mood_date: today,
        created_at: new Date()
      });
    }
  },

  // Get user's mood history
  getUserMoodHistory: async (user_id, limit = 30, offset = 0) => {
    const moods = await moodsTable()
      .select(
        "mood_id AS moodId",
        "mood",
        "comment", 
        "tags",
        "mood_date AS date",
        "created_at AS createdAt"
      )
      .where({ user_id })
      .orderBy("mood_date", "desc")
      .limit(limit)
      .offset(offset);

    return moods.map(mood => ({
      ...mood,
      tags: mood.tags ? JSON.parse(mood.tags) : []
    }));
  },

  // Get today's mood for user
  getTodayMood: async (user_id) => {
    const today = new Date().toISOString().split('T')[0];
    
    const mood = await moodsTable()
      .select(
        "mood_id AS moodId",
        "mood",
        "comment",
        "tags", 
        "mood_date AS date",
        "created_at AS createdAt"
      )
      .where({ user_id })
      .where(db.raw("DATE(mood_date) = ?", [today]))
      .first();

    if (mood && mood.tags) {
      mood.tags = JSON.parse(mood.tags);
    }

    return mood;
  },

  // Enhanced mood analytics
  getUserMoodAnalytics: async (user_id, days = 30) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const moods = await moodsTable()
      .select("mood", "mood_date")
      .where({ user_id })
      .where("mood_date", ">=", startDate.toISOString().split('T')[0])
      .orderBy("mood_date", "desc");

    // Calculate analytics
    const moodCounts = moods.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {});

    const totalEntries = moods.length;
    const averageScore = moods.reduce((sum, entry) => {
      const moodValues = { excellent: 5, good: 4, okay: 3, 'not-great': 2, poor: 1 };
      return sum + (moodValues[entry.mood] || 3);
    }, 0) / (totalEntries || 1);

    // Find streaks
    const consecutiveDays = Mood.calculateConsecutiveDays(moods);
    const bestMood = Object.entries(moodCounts).sort(([,a], [,b]) => b - a)[0];

    return {
      totalEntries,
      averageScore: Math.round(averageScore * 10) / 10,
      moodDistribution: moodCounts,
      consecutiveDays,
      mostCommonMood: bestMood ? bestMood[0] : null,
      recentTrend: Mood.calculateMoodTrend(moods.slice(0, 7)),
      weeklyData: Mood.groupByWeek(moods)
    };
  },

  getCompanyMoodAnalytics: async (days = 30) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const moods = await moodsTable()
      .select("mood", "mood_date", "user_id")
      .where("mood_date", ">=", startDate.toISOString().split('T')[0])
      .orderBy("mood_date", "desc");

    const moodCounts = moods.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {});

    const totalUsers = await db("sl_user_accounts").where("is_active", true).count("* as count").first();
    const activeUsers = new Set(moods.map(m => m.user_id)).size;
    const participationRate = Math.round((activeUsers / (totalUsers.count || 1)) * 100);

    const averageScore = moods.reduce((sum, entry) => {
      const moodValues = { excellent: 5, good: 4, okay: 3, 'not-great': 2, poor: 1 };
      return sum + (moodValues[entry.mood] || 3);
    }, 0) / (moods.length || 1);

    return {
      totalEntries: moods.length,
      activeUsers,
      participationRate,
      averageScore: Math.round(averageScore * 10) / 10,
      moodDistribution: moodCounts,
      dailyAverages: Mood.calculateDailyAverages(moods)
    };
  },

  calculateConsecutiveDays: (moods) => {
    if (moods.length === 0) return 0;
    
    let consecutive = 1;
    let maxConsecutive = 1;
    
    for (let i = 1; i < moods.length; i++) {
      const prevDate = new Date(moods[i-1].mood_date);
      const currDate = new Date(moods[i].mood_date);
      const diffDays = (prevDate - currDate) / (1000 * 60 * 60 * 24);
      
      if (diffDays === 1) {
        consecutive++;
        maxConsecutive = Math.max(maxConsecutive, consecutive);
      } else {
        consecutive = 1;
      }
    }
    
    return maxConsecutive;
  },

  calculateMoodTrend: (recentMoods) => {
    if (recentMoods.length < 3) return 'stable';
    
    const moodValues = { excellent: 5, good: 4, okay: 3, 'not-great': 2, poor: 1 };
    const values = recentMoods.slice(0, 7).map(m => moodValues[m.mood] || 3);
    
    const trend = values.slice(0, 3).reduce((a, b) => a + b, 0) / 3 - 
                  values.slice(-3).reduce((a, b) => a + b, 0) / 3;
    
    if (trend > 0.5) return 'improving';
    if (trend < -0.5) return 'declining';
    return 'stable';
  },

  groupByWeek: (moods) => {
    const weeks = {};
    moods.forEach(mood => {
      const date = new Date(mood.mood_date);
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeks[weekKey]) weeks[weekKey] = [];
      weeks[weekKey].push(mood);
    });
    
    return Object.entries(weeks).map(([week, entries]) => ({
      week,
      count: entries.length,
      averageScore: entries.reduce((sum, entry) => {
        const moodValues = { excellent: 5, good: 4, okay: 3, 'not-great': 2, poor: 1 };
        return sum + (moodValues[entry.mood] || 3);
      }, 0) / entries.length
    }));
  },

  calculateDailyAverages: (moods) => {
    const dailyData = {};
    moods.forEach(mood => {
      const date = mood.mood_date;
      if (!dailyData[date]) dailyData[date] = [];
      dailyData[date].push(mood);
    });

    return Object.entries(dailyData).map(([date, entries]) => ({
      date,
      count: entries.length,
      averageScore: entries.reduce((sum, entry) => {
        const moodValues = { excellent: 5, good: 4, okay: 3, 'not-great': 2, poor: 1 };
        return sum + (moodValues[entry.mood] || 3);
      }, 0) / entries.length
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
  },

  // Admin functions
  getMoodAnalytics: async (days = 30) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Overall mood distribution
    const moodDistribution = await moodsTable()
      .select(
        "mood",
        db.raw("COUNT(*) as count"),
        db.raw("ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage")
      )
      .where("mood_date", ">=", startDate.toISOString().split('T')[0])
      .groupBy("mood")
      .orderBy("count", "desc");

    // Daily mood trends
    const dailyTrends = await moodsTable()
      .select(
        "mood_date AS date",
        db.raw("COUNT(*) as totalEntries"),
        db.raw("AVG(CASE WHEN mood = 'excellent' THEN 5 WHEN mood = 'good' THEN 4 WHEN mood = 'okay' THEN 3 WHEN mood = 'not-great' THEN 2 WHEN mood = 'poor' THEN 1 END) as averageScore"),
        db.raw("COUNT(DISTINCT user_id) as uniqueUsers")
      )
      .where("mood_date", ">=", startDate.toISOString().split('T')[0])
      .groupBy("mood_date")
      .orderBy("mood_date", "desc");

    // Mood by department
    const moodByDepartment = await moodsTable()
      .select(
        "sl_user_accounts.department",
        "sl_moods.mood",
        db.raw("COUNT(*) as count")
      )
      .innerJoin("sl_user_accounts", "sl_moods.user_id", "sl_user_accounts.user_id")
      .where("mood_date", ">=", startDate.toISOString().split('T')[0])
      .groupBy("sl_user_accounts.department", "sl_moods.mood")
      .orderBy("sl_user_accounts.department");

    // Top mood contributors
    const topContributors = await moodsTable()
      .select(
        "sl_moods.user_id",
        db.raw("CONCAT(sl_user_accounts.first_name, ' ', sl_user_accounts.last_name) AS userName"),
        db.raw("COUNT(*) as totalEntries"),
        db.raw("AVG(CASE WHEN mood = 'excellent' THEN 5 WHEN mood = 'good' THEN 4 WHEN mood = 'okay' THEN 3 WHEN mood = 'not-great' THEN 2 WHEN mood = 'poor' THEN 1 END) as averageScore")
      )
      .innerJoin("sl_user_accounts", "sl_moods.user_id", "sl_user_accounts.user_id")
      .where("mood_date", ">=", startDate.toISOString().split('T')[0])
      .groupBy("sl_moods.user_id", "sl_user_accounts.first_name", "sl_user_accounts.last_name")
      .orderBy("totalEntries", "desc")
      .limit(10);

    return {
      period: { days, startDate: startDate.toISOString().split('T')[0] },
      moodDistribution,
      dailyTrends,
      moodByDepartment,
      topContributors
    };
  },

  // Get all moods for admin view
  getAllMoods: async (limit = 50, offset = 0, mood = null, startDate = null, endDate = null) => {
    let query = moodsTable()
      .select(
        "sl_moods.mood_id AS moodId",
        "sl_moods.user_id AS userId",
        "sl_moods.mood",
        "sl_moods.comment",
        "sl_moods.tags",
        "sl_moods.mood_date AS date",
        "sl_moods.created_at AS createdAt",
        db.raw("CONCAT(sl_user_accounts.first_name, ' ', sl_user_accounts.last_name) AS userName"),
        "sl_user_accounts.user_email AS userEmail",
        "sl_user_accounts.department"
      )
      .innerJoin("sl_user_accounts", "sl_moods.user_id", "sl_user_accounts.user_id")
      .orderBy("sl_moods.mood_date", "desc")
      .limit(limit)
      .offset(offset);

    if (mood) {
      query = query.where("sl_moods.mood", mood);
    }

    if (startDate) {
      query = query.where("sl_moods.mood_date", ">=", startDate);
    }

    if (endDate) {
      query = query.where("sl_moods.mood_date", "<=", endDate);
    }

    const moods = await query;

    return moods.map(mood => ({
      ...mood,
      tags: mood.tags ? JSON.parse(mood.tags) : []
    }));
  },

  // Get mood participation statistics
  getMoodParticipation: async (days = 30) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const totalUsers = await db("sl_user_accounts")
      .where("is_active", true)
      .count("* as count")
      .first();

    const participatingUsers = await moodsTable()
      .where("mood_date", ">=", startDate.toISOString().split('T')[0])
      .countDistinct("user_id as count")
      .first();

    const totalMoodEntries = await moodsTable()
      .where("mood_date", ">=", startDate.toISOString().split('T')[0])
      .count("* as count")
      .first();

    const participationRate = totalUsers.count > 0 
      ? ((participatingUsers.count / totalUsers.count) * 100).toFixed(2)
      : 0;

    return {
      period: { days, startDate: startDate.toISOString().split('T')[0] },
      totalUsers: totalUsers.count,
      participatingUsers: participatingUsers.count,
      totalMoodEntries: totalMoodEntries.count,
      participationRate: parseFloat(participationRate),
      averageEntriesPerUser: participatingUsers.count > 0 
        ? (totalMoodEntries.count / participatingUsers.count).toFixed(2)
        : 0
    };
  }
};
