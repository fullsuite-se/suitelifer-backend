import express from 'express';
import {
  recordMood,
  getMoodHistory,
  getMoodStatistics,
  deleteMood,
  getMoodAnalytics,
  getCompanyMoodAnalytics
} from '../controllers/moodController.js';
import verifyToken from '../middlewares/verifyToken.js';
import verifyAdmin from '../middlewares/verifyAdmin.js';

const router = express.Router();

// User routes - require authentication
router.use(verifyToken);

// Submit daily mood
router.post('/', recordMood);

// Get user's mood history
router.get('/history', getMoodHistory);

// Get user's mood statistics
router.get('/stats', getMoodStatistics);

// Get enhanced mood analytics
router.get('/analytics', getMoodAnalytics);

// Delete mood entry
router.delete('/:mood_id', deleteMood);

// Admin routes - require admin authentication
router.use(verifyAdmin);

// Get company-wide mood analytics
router.get('/admin/analytics', getCompanyMoodAnalytics);

export default router;
