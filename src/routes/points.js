import express from 'express';
import { 
  getPointsBalance,
  getTransactionHistory,
  cheerUser,
  getLeaderboard,
  getAllUserPoints,
  addPointsToUser,
  deductPointsFromUser,
  getPointsAnalytics,
  getCheerFeed,
  addCheerComment,
  getCheerComments,
  toggleCheerLike,
  searchUsers,
  getCheerStats,
  getReceivedCheers,
  getLeaderboardWithPeriod,
  updateLeaderboardCache,
  getLeaderboardPerformance,
  updateCheerComment,
  deleteCheerComment
} from '../controllers/pointsController.js';
import verifyToken from '../middlewares/verifyToken.js';
import verifyAdmin from '../middlewares/verifyAdmin.js';

const router = express.Router();

// User routes - require authentication
router.use(verifyToken);

// Get user's current points balance
router.get('/balance', getPointsBalance);

// Get user's transaction history
router.get('/transactions', getTransactionHistory);

// Cheer/Give points to another user
router.post('/cheer', (req, res, next) => {
  console.log('🚀 CHEER ROUTE HIT - Request body:', JSON.stringify(req.body, null, 2));
  next();
}, cheerUser);

// Get points leaderboard - OPTIMIZED VERSION
router.get('/leaderboard', getLeaderboardWithPeriod);

// Enhanced cheer features
router.get('/stats', getCheerStats);
router.get('/received', getReceivedCheers);

// GET /feed - Get cheer feed (paginated, filterable)
// Query params:
//   page: page number (default 1)
//   limit: results per page (default 20)
//   from: ISO date string (optional, filter cheers created at or after this date)
//   to: ISO date string (optional, filter cheers created at or before this date)
router.get('/feed', getCheerFeed);
router.get('/search-users', searchUsers);

// Cheer interactions
router.post('/cheer/:cheer_id/comment', addCheerComment);
router.get('/cheer/:cheer_id/comments', getCheerComments);
router.put('/cheer/:cheer_id/comment/:comment_id', updateCheerComment);
router.delete('/cheer/:cheer_id/comment/:comment_id', deleteCheerComment);
router.post('/cheer/:cheer_id/like', toggleCheerLike);

// Leaderboard performance monitoring
router.get('/leaderboard/performance', getLeaderboardPerformance);

// Admin routes - require admin authentication
router.use(verifyAdmin);

// Admin: Get all user points
router.get('/admin/users', getAllUserPoints);

// Admin: Add points to user
router.post('/admin/add', addPointsToUser);

// Admin: Deduct points from user  
router.post('/admin/deduct', deductPointsFromUser);

// Admin: Get points analytics
router.get('/admin/analytics', getPointsAnalytics);

// Admin: Update leaderboard cache
router.post('/admin/leaderboard/cache', updateLeaderboardCache);

export default router;
