import express from "express";
import {
  testSubmitMood,
  testGetMoodHistory,
  testGetMoodStats,
  testGetAllMoodData,
  testDeleteMoodEntry
} from "../controllers/testMoodController.js";

const router = express.Router();

// Test routes without authentication for API testing
// These should be removed in production!

// Submit or update mood entry
router.post("/test/mood", testSubmitMood);

// Delete mood entry
router.delete("/test/mood/:id", testDeleteMoodEntry);

// Get all mood entries
router.get("/test/mood", testGetAllMoodData);

// Get mood history for specific user
router.get("/test/mood/history/:userId", testGetMoodHistory);

// Get mood statistics for specific user
router.get("/test/mood/stats/:userId", testGetMoodStats);

export default router;
