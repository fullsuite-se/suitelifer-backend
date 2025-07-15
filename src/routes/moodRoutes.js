import express from "express";
import {
  submitMood,
  getTodayMood,
  getMoodHistory,
  getMoodStats,
  getWeeklyStats,
  getMonthlyStats,
  getYearlyStats,
  getAllMoodData,
  getMoodDistribution,
  getMoodTrends,
  deleteMoodEntry
} from "../controllers/moodController.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

// Submit or update mood entry
router.post("/mood", verifyToken, submitMood);

// Get today's mood
router.get("/mood/today", verifyToken, getTodayMood);

// Get mood history
router.get("/mood/history", verifyToken, getMoodHistory);

// Get mood statistics
router.get("/mood/stats", verifyToken, getMoodStats);
router.get("/mood/stats/weekly", verifyToken, getWeeklyStats);
router.get("/mood/stats/monthly", verifyToken, getMonthlyStats);
router.get("/mood/stats/yearly", verifyToken, getYearlyStats);

// Get all mood data (combined endpoint)
router.get("/mood/all", verifyToken, getAllMoodData);

// Get mood distribution for charts
router.get("/mood/distribution", verifyToken, getMoodDistribution);

// Get mood trends
router.get("/mood/trends", verifyToken, getMoodTrends);

// Delete mood entry
router.delete("/mood/:id", verifyToken, deleteMoodEntry);

export default router;
