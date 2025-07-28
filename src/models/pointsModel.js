import { db } from "../config/db.js";

const userPointsTable = () => db("sl_user_points");
const transactionsTable = () => db("sl_transactions");
const cheersTable = () => db("sl_cheers");
const cheerCommentsTable = () => db("sl_cheer_comments");
const cheerLikesTable = () => db("sl_cheer_likes");

export const Points = {
  // Helper function to get period start date
  getPeriodStartDate: (period) => {
    let startDate = new Date();
    
    switch (period) {
      case 'weekly':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'all':
      case 'alltime':
        startDate = new Date('2020-01-01');
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }
    
    return startDate;
  },

  // User Points Management - Heartbits System
  getUserPoints: async (user_id) => {
    return await userPointsTable()
      .select(
        "available_points AS availablePoints", // Spendable points (from received cheers)
        "total_earned AS totalEarned", 
        "total_spent AS totalSpent",
        "monthly_cheer_limit AS monthlyHeartbits", // Monthly heartbits allocation (100)
        "monthly_cheer_used AS monthlyHeartbitsUsed", // Heartbits used this month
        "last_monthly_reset AS lastMonthlyReset"
      )
      .where({ user_id })
      .first();
  },

  createUserPoints: async (user_id) => {
    const now = new Date();
    const pointsData = {
      user_id,
      available_points: 0, // No welcome bonus - points come from cheers
      total_earned: 0,
      total_spent: 0,
      monthly_cheer_limit: 100, // 100 heartbits per month
      monthly_cheer_used: 0, // No heartbits used yet
      last_monthly_reset: new Date(now.getFullYear(), now.getMonth(), 1),
      created_at: now,
      updated_at: now
    };
    
    await userPointsTable().insert(pointsData);
    return pointsData;
  },

  updateUserPoints: async (user_id, updates) => {
    return await userPointsTable()
      .where({ user_id })
      .update({
        ...updates,
        updated_at: new Date()
      });
  },

  // Transactions
  createTransaction: async (transactionData) => {
    return await transactionsTable().insert({
      ...transactionData,
      created_at: new Date()
    });
  },

  getUserTransactions: async (user_id, limit = 20, offset = 0, type = null) => {
    let query = transactionsTable()
      .select(
        "sl_transactions.transaction_id AS transactionId",
        "sl_transactions.from_user_id AS fromUserId",
        "sl_transactions.to_user_id AS toUserId", 
        "sl_transactions.type",
        "sl_transactions.amount",
        "sl_transactions.description",
        "sl_transactions.message",
        "sl_transactions.metadata",
        "sl_transactions.created_at AS createdAt",
        // Join to get the "other" user's name
        db.raw(`
          CASE 
            WHEN sl_transactions.from_user_id = ? THEN 
              CONCAT(to_user.first_name, ' ', to_user.last_name)
            ELSE 
              CONCAT(from_user.first_name, ' ', from_user.last_name)
          END AS related_user
        `, [user_id]),
        // Join to get the "other" user's avatar
        db.raw(`
          CASE 
            WHEN sl_transactions.from_user_id = ? THEN 
              to_user.profile_pic
            ELSE 
              from_user.profile_pic
          END AS related_user_avatar
        `, [user_id])
      )
      .leftJoin('sl_user_accounts as from_user', 'sl_transactions.from_user_id', 'from_user.user_id')
      .leftJoin('sl_user_accounts as to_user', 'sl_transactions.to_user_id', 'to_user.user_id')
      .where(function() {
        // Filter to show only relevant transactions for each user role
        this.where(function() {
          // User is sender - show outgoing transactions
          this.where("sl_transactions.from_user_id", user_id)
              .whereIn("sl_transactions.type", ["given", "purchase", "admin_deduct"]);
        }).orWhere(function() {
          // User is receiver - show incoming transactions  
          this.where("sl_transactions.to_user_id", user_id)
              .whereIn("sl_transactions.type", ["received", "admin_grant", "admin_added"]);
        });
      })
      .orderBy("sl_transactions.created_at", "desc")
      .limit(limit)
      .offset(offset);

    if (type) {
      query = query.where("sl_transactions.type", type);
    }

    return await query;
  },

  getTransactionCount: async (user_id, type = null) => {
    let query = transactionsTable()
      .where(function() {
        this.where("from_user_id", user_id)
            .orWhere("to_user_id", user_id);
      })
      .count("* as count");

    if (type) {
      query = query.where("type", type);
    }

    const result = await query.first();
    return result.count;
  },

  // Cheers/Peer Recognition
  createCheer: async (cheerData) => {
    return await cheersTable().insert({
      ...cheerData,
      created_at: new Date()
    });
  },

  getUserCheers: async (user_id, limit = 20, offset = 0) => {
    return await cheersTable()
      .select(
        "cheer_id AS cheerId",
        "from_user_id AS fromUserId",
        "to_user_id AS toUserId",
        "points",
        "message",
        "sl_cheers.created_at AS createdAt"
      )
      .leftJoin("sl_user_accounts as from_user", "sl_cheers.from_user_id", "from_user.user_id")
      .leftJoin("sl_user_accounts as to_user", "sl_cheers.to_user_id", "to_user.user_id")
      .select(
        db.raw("CONCAT(from_user.first_name, ' ', from_user.last_name) AS fromUserName"),
        db.raw("CONCAT(to_user.first_name, ' ', to_user.last_name) AS toUserName")
      )
      .where(function() {
        this.where("from_user_id", user_id)
            .orWhere("to_user_id", user_id);
      })
      .orderBy("sl_cheers.created_at", "desc")
      .limit(limit)
      .offset(offset);
  },

  // Leaderboards
  getPointsLeaderboard: async (limit = 10, period = 'all') => {
    let query = userPointsTable()
      .select(
        "sl_user_points.user_id",
        "sl_user_points.total_earned",
        "sl_user_points.available_points",
        db.raw("CONCAT(sl_user_accounts.first_name, ' ', sl_user_accounts.last_name) AS userName"),
        "sl_user_accounts.profile_pic AS avatar"
      )
      .innerJoin("sl_user_accounts", "sl_user_points.user_id", "sl_user_accounts.user_id")
      .where("sl_user_accounts.is_active", true)
      .orderBy("total_earned", "desc")
      .limit(limit);

    return await query;
  },

  // Admin functions
  getAllUserPoints: async (limit = 50, offset = 0, search = null) => {
    let query = userPointsTable()
      .select(
        "sl_user_points.user_id",
        "sl_user_points.available_points",
        "sl_user_points.total_earned",
        "sl_user_points.total_spent",
        "sl_user_points.monthly_cheer_limit",
        "sl_user_points.monthly_cheer_used",
        db.raw("CONCAT(sl_user_accounts.first_name, ' ', sl_user_accounts.last_name) AS userName"),
        "sl_user_accounts.user_email AS email",
        "sl_user_accounts.profile_pic AS avatar"
      )
      .innerJoin("sl_user_accounts", "sl_user_points.user_id", "sl_user_accounts.user_id")
      .orderBy("total_earned", "desc")
      .limit(limit)
      .offset(offset);

    if (search) {
      query = query.where(function() {
        this.whereILike("sl_user_accounts.first_name", `%${search}%`)
            .orWhereILike("sl_user_accounts.last_name", `%${search}%`)
            .orWhereILike("sl_user_accounts.user_email", `%${search}%`);
      });
    }

    return await query;
  },

  // Analytics
  getPointsAnalytics: async (days = 30) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dailyStats = await transactionsTable()
      .select(
        db.raw("DATE(created_at) as date"),
        db.raw("SUM(CASE WHEN type IN ('earned', 'received', 'bonus') THEN amount ELSE 0 END) as earned"),
        db.raw("SUM(CASE WHEN type IN ('spent', 'given') THEN amount ELSE 0 END) as spent"),
        db.raw("COUNT(*) as transactions")
      )
      .where("created_at", ">=", startDate)
      .groupBy(db.raw("DATE(created_at)"))
      .orderBy("date", "desc");

    return dailyStats;
  },

  // Heartbits System Management
  checkAndResetMonthlyHeartbits: async (user_id) => {
    const userPoints = await Points.getUserPoints(user_id);
    if (!userPoints) {
      return await Points.createUserPoints(user_id);
    }

    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastReset = new Date(userPoints.lastMonthlyReset);
    
    // Check if we need to reset monthly heartbits
    if (currentMonth > lastReset) {
      await Points.updateUserPoints(user_id, {
        monthly_cheer_used: 0, // Reset heartbits used to 0
        last_monthly_reset: currentMonth
      });
      
      return {
        ...userPoints,
        monthlyHeartbitsUsed: 0,
        lastMonthlyReset: currentMonth
      };
    }
    
    return userPoints;
  },

  getHeartbitsRemaining: async (user_id) => {
    const userPoints = await Points.checkAndResetMonthlyHeartbits(user_id);
    return userPoints.monthlyHeartbits - userPoints.monthlyHeartbitsUsed;
  },

  canSendHeartbits: async (user_id, amount) => {
    if (amount <= 0) return false;
    const remaining = await Points.getHeartbitsRemaining(user_id);
    return remaining >= amount;
  },

  useHeartbits: async (user_id, amount) => {
    const userPoints = await Points.checkAndResetMonthlyHeartbits(user_id);
    
    if (userPoints.monthlyHeartbitsUsed + amount > userPoints.monthlyHeartbits) {
      throw new Error(`Insufficient heartbits. You have ${userPoints.monthlyHeartbits - userPoints.monthlyHeartbitsUsed} heartbits remaining.`);
    }

    await Points.updateUserPoints(user_id, {
      monthly_cheer_used: userPoints.monthlyHeartbitsUsed + amount
    });

    return {
      used: amount,
      remaining: userPoints.monthlyHeartbits - (userPoints.monthlyHeartbitsUsed + amount)
    };
  },

  addPointsFromCheer: async (user_id, amount) => {
    const userPoints = await Points.getUserPoints(user_id) || await Points.createUserPoints(user_id);
    
    await Points.updateUserPoints(user_id, {
      available_points: userPoints.availablePoints + amount,
      total_earned: userPoints.totalEarned + amount
    });

    return {
      newBalance: userPoints.availablePoints + amount,
      totalEarned: userPoints.totalEarned + amount
    };
  },

  // Cheer Comments
  addCheerComment: async (cheer_id, user_id, comment) => {
    const commentData = {
      cheer_id,
      user_id,
      comment,
      created_at: new Date()
    };
    
    const [id] = await cheerCommentsTable().insert(commentData);
    return { id, ...commentData };
  },

  updateCheerComment: async (comment_id, user_id, comment) => {
    return await cheerCommentsTable()
      .where({ id: comment_id, user_id })
      .update({
        comment,
        updated_at: new Date()
      });
  },

  getCheerComments: async (cheer_id, limit = 20, offset = 0) => {
    const comments = await cheerCommentsTable()
      .join("sl_user_accounts", "sl_cheer_comments.user_id", "sl_user_accounts.user_id")
      .select(
        "sl_cheer_comments.*",
        "sl_user_accounts.first_name",
        "sl_user_accounts.last_name",
        "sl_user_accounts.profile_pic as avatar",
        db.raw("CONCAT(sl_user_accounts.first_name, ' ', sl_user_accounts.last_name) as userName")
      )
      .where("sl_cheer_comments.cheer_id", cheer_id)
      .orderBy("sl_cheer_comments.created_at", "desc")
      .limit(limit)
      .offset(offset);

    return comments.map(comment => ({
      _id: comment.id,
      comment: comment.comment,
      fromUser: {
        _id: comment.user_id,
        name: comment.userName,
        avatar: comment.avatar
      },
      createdAt: comment.created_at
    }));
  },

  deleteCheerComment: async (comment_id, user_id) => {
    return await cheerCommentsTable()
      .where({ id: comment_id, user_id })
      .del();
  },

  // Cheer Likes
  toggleCheerLike: async (cheer_id, user_id) => {
    // Check if like already exists
    const existingLike = await cheerLikesTable()
      .where({ cheer_id, user_id })
      .first();

    if (existingLike) {
      // Remove like
      await cheerLikesTable()
        .where({ cheer_id, user_id })
        .del();
      
      return { liked: false };
    } else {
      // Add like
      await cheerLikesTable()
        .insert({
          cheer_id,
          user_id,
          created_at: new Date(),
          updated_at: new Date()
        });
      
      return { liked: true };
    }
  },

  getCheerLikes: async (cheer_id) => {
    return await cheerLikesTable()
      .join("sl_user_accounts", "sl_cheer_likes.user_id", "sl_user_accounts.user_id")
      .select(
        "sl_user_accounts.user_id as id",
        "sl_user_accounts.first_name", 
        "sl_user_accounts.last_name",
        "sl_user_accounts.profile_pic as avatar"
      )
      .where({ cheer_id });
  },

  getCheerLikesCount: async (cheer_id) => {
    const result = await cheerLikesTable()
      .where({ cheer_id })
      .count("* as count")
      .first();
    return parseInt(result.count) || 0;
  },

  // Enhanced Cheer Feed
  getCheerFeed: async (limit = 20, offset = 0, user_id = null) => {
    let query = cheersTable()
      .join("sl_user_accounts as from_user", "sl_cheers.from_user_id", "from_user.user_id")
      .join("sl_user_accounts as to_user", "sl_cheers.to_user_id", "to_user.user_id")
      .leftJoin("sl_cheer_comments", "sl_cheers.cheer_id", "sl_cheer_comments.cheer_id")
      .leftJoin("sl_cheer_likes", "sl_cheers.cheer_id", "sl_cheer_likes.cheer_id");

    // If user_id is provided, add left join for user's likes
    if (user_id) {
      query = query.leftJoin(
        db.raw("sl_cheer_likes as user_likes ON sl_cheers.cheer_id = user_likes.cheer_id AND user_likes.user_id = ?", [user_id])
      );
    }

    const selectFields = [
      "sl_cheers.*",
      "from_user.first_name as from_first_name",
      "from_user.last_name as from_last_name", 
      "from_user.profile_pic as from_avatar",
      "to_user.first_name as to_first_name",
      "to_user.last_name as to_last_name",
      "to_user.profile_pic as to_avatar",
      db.raw("COUNT(DISTINCT sl_cheer_comments.id) as comment_count"),
      db.raw("COUNT(DISTINCT CONCAT(sl_cheer_likes.cheer_id, sl_cheer_likes.user_id)) as like_count")
    ];

    // Add user liked status if user_id is provided
    if (user_id) {
      selectFields.push(db.raw("CASE WHEN user_likes.user_id IS NOT NULL THEN 1 ELSE 0 END as user_liked"));
    }

    const cheers = await query
      .select(selectFields)
      .groupBy("sl_cheers.cheer_id")
      .orderBy("sl_cheers.created_at", "desc")
      .limit(limit)
      .offset(offset);

    return cheers.map(cheer => ({
      _id: cheer.cheer_id,
      cheer_id: cheer.cheer_id,
      fromUser: {
        _id: cheer.from_user_id,
        name: `${cheer.from_first_name} ${cheer.from_last_name}`,
        avatar: cheer.from_avatar
      },
      toUser: {
        _id: cheer.to_user_id,
        name: `${cheer.to_first_name} ${cheer.to_last_name}`,
        avatar: cheer.to_avatar
      },
      points: cheer.points,
      message: cheer.message,
      createdAt: cheer.created_at,
      commentCount: parseInt(cheer.comment_count) || 0,
      likeCount: parseInt(cheer.like_count) || 0, // Keep for compatibility
      heartCount: parseInt(cheer.like_count) || 0, // Add heart count
      userLiked: user_id ? Boolean(cheer.user_liked) : false,
      userHearted: user_id ? Boolean(cheer.user_liked) : false // Add hearted status
    }));
  },

  // Enhanced Cheer Feed with date filtering
  getCheerFeed: async (limit = 20, offset = 0, user_id = null, from = null, to = null) => {
    let query = cheersTable()
      .join("sl_user_accounts as from_user", "sl_cheers.from_user_id", "from_user.user_id")
      .join("sl_user_accounts as to_user", "sl_cheers.to_user_id", "to_user.user_id")
      .leftJoin("sl_cheer_comments", "sl_cheers.cheer_id", "sl_cheer_comments.cheer_id")
      .leftJoin("sl_cheer_likes", "sl_cheers.cheer_id", "sl_cheer_likes.cheer_id");

    // If user_id is provided, add left join for user's likes
    if (user_id) {
      query = query.leftJoin(
        db.raw("sl_cheer_likes as user_likes ON sl_cheers.cheer_id = user_likes.cheer_id AND user_likes.user_id = ?", [user_id])
      );
    }

    // Date filtering
    if (from) {
      query = query.where("sl_cheers.created_at", ">=", from);
    }
    if (to) {
      query = query.where("sl_cheers.created_at", "<=", to);
    }

    const selectFields = [
      "sl_cheers.*",
      "from_user.first_name as from_first_name",
      "from_user.last_name as from_last_name", 
      "from_user.profile_pic as from_avatar",
      "to_user.first_name as to_first_name",
      "to_user.last_name as to_last_name",
      "to_user.profile_pic as to_avatar",
      db.raw("COUNT(DISTINCT sl_cheer_comments.id) as comment_count"),
      db.raw("COUNT(DISTINCT CONCAT(sl_cheer_likes.cheer_id, sl_cheer_likes.user_id)) as like_count")
    ];

    // Add user liked status if user_id is provided
    if (user_id) {
      selectFields.push(db.raw("CASE WHEN user_likes.user_id IS NOT NULL THEN 1 ELSE 0 END as user_liked"));
    }

    const cheers = await query
      .select(selectFields)
      .groupBy("sl_cheers.cheer_id")
      .orderBy("sl_cheers.created_at", "desc")
      .limit(limit)
      .offset(offset);

    return cheers.map(cheer => ({
      _id: cheer.cheer_id,
      cheer_id: cheer.cheer_id,
      fromUser: {
        _id: cheer.from_user_id,
        name: `${cheer.from_first_name} ${cheer.from_last_name}`,
        avatar: cheer.from_avatar
      },
      toUser: {
        _id: cheer.to_user_id,
        name: `${cheer.to_first_name} ${cheer.to_last_name}`,
        avatar: cheer.to_avatar
      },
      points: cheer.points,
      message: cheer.message,
      createdAt: cheer.created_at,
      commentCount: parseInt(cheer.comment_count) || 0,
      likeCount: parseInt(cheer.like_count) || 0, // Keep for compatibility
      heartCount: parseInt(cheer.like_count) || 0, // Add heart count
      userLiked: user_id ? Boolean(cheer.user_liked) : false,
      userHearted: user_id ? Boolean(cheer.user_liked) : false // Add hearted status
    }));
  },

  // Get cheer statistics for a user
  getCheerStats: async (user_id) => {
    const sentStats = await transactionsTable()
      .count('* as totalSent')
      .sum('amount as pointsSent')
      .where('from_user_id', user_id)
      .whereIn('type', ['given', 'spent'])
      .first();

    const receivedStats = await transactionsTable()
      .count('* as totalReceived') 
      .sum('amount as pointsReceived')
      .where('to_user_id', user_id)
      .whereIn('type', ['received', 'earned'])
      .first();

    return {
      totalSent: parseInt(sentStats?.totalSent) || 0,
      totalReceived: parseInt(receivedStats?.totalReceived) || 0,
      pointsSent: parseInt(sentStats?.pointsSent) || 0,
      pointsReceived: parseInt(receivedStats?.pointsReceived) || 0
    };
  },

  // Get cheers received by a user
  getReceivedCheers: async (user_id, limit = 20, offset = 0) => {
    const cheers = await cheersTable()
      .join("sl_user_accounts as from_user", "sl_cheers.from_user_id", "from_user.user_id")
      .select(
        "sl_cheers.*",
        "from_user.first_name as fromFirstName",
        "from_user.last_name as fromLastName",
        "from_user.profile_pic as fromAvatar",
        "from_user.user_email as fromEmail",
        db.raw("CONCAT(from_user.first_name, ' ', from_user.last_name) as fromUserName")
      )
      .where("sl_cheers.to_user_id", user_id)
      .orderBy("sl_cheers.created_at", "desc")
      .limit(limit)
      .offset(offset);

    return cheers.map(cheer => ({
      _id: cheer.cheer_id,
      fromUser: {
        _id: cheer.from_user_id,
        name: cheer.fromUserName,
        avatar: cheer.fromAvatar,
        email: cheer.fromEmail,
        department: 'FullSuite'
      },
      points: cheer.points,
      message: cheer.message,
      createdAt: cheer.created_at
    }));
  },

  // Optimized leaderboard for large datasets
  getOptimizedLeaderboard: async (period = 'weekly', currentUserId = null, page = 1, limit = 20) => {
    const startDate = Points.getPeriodStartDate(period);
    const offset = (page - 1) * limit;
    
    // Use subquery to pre-filter and aggregate transactions efficiently
    const userTotalsSubquery = db('sl_transactions')
      .select('to_user_id')
      .sum('amount as totalPoints')
      .count('* as transactionCount')
      .whereIn('type', ['received', 'earned'])
      .where('created_at', '>=', startDate)
      .groupBy('to_user_id')
      .having('totalPoints', '>', 0) // Only include users with points
      .orderBy('totalPoints', 'desc')
      .as('user_totals');

    // Main query with optimized joins
    const leaderboard = await db('sl_user_accounts')
      .join(userTotalsSubquery, 'sl_user_accounts.user_id', 'user_totals.to_user_id')
      .select(
        'sl_user_accounts.user_id as _id',
        'sl_user_accounts.first_name',
        'sl_user_accounts.last_name',
        'sl_user_accounts.profile_pic as avatar',
        'sl_user_accounts.user_email',
        db.raw("CONCAT(sl_user_accounts.first_name, ' ', sl_user_accounts.last_name) as name"),
        'user_totals.totalPoints',
        'user_totals.transactionCount'
      )
      .where('sl_user_accounts.is_active', true)
      .orderBy('user_totals.totalPoints', 'desc')
      .limit(limit)
      .offset(offset);

    const processedLeaderboard = leaderboard.map((entry, index) => ({
      _id: entry._id,
      name: entry.name,
      department: 'FullSuite',
      email: entry.user_email,
      avatar: entry.avatar,
      totalPoints: parseInt(entry.totalPoints) || 0,
      transactionCount: parseInt(entry.transactionCount) || 0,
      rank: offset + index + 1
    }));

    // Get current user's position if provided
    let currentUser = null;
    if (currentUserId) {
      try {
        // Get user's total points for the period
        const userPoints = await db('sl_transactions')
          .sum('amount as totalPoints')
          .where('to_user_id', currentUserId)
          .whereIn('type', ['received', 'earned'])
          .where('created_at', '>=', startDate)
          .first();

        const userTotalPoints = parseInt(userPoints.totalPoints) || 0;

        if (userTotalPoints > 0) {
          // Count how many users have more points than current user
          const higherUsers = await db('sl_transactions')
            .join('sl_user_accounts', 'sl_transactions.to_user_id', 'sl_user_accounts.user_id')
            .select('sl_user_accounts.user_id')
            .sum('sl_transactions.amount as totalPoints')
            .whereIn('sl_transactions.type', ['received', 'earned'])
            .where('sl_transactions.created_at', '>=', startDate)
            .where('sl_user_accounts.is_active', true)
            .groupBy('sl_user_accounts.user_id')
            .having('totalPoints', '>', userTotalPoints)
            .count('* as count')
            .first();

          const userRank = (parseInt(higherUsers.count) || 0) + 1;

          // Get user info
          const userInfo = await db('sl_user_accounts')
            .select('user_id as _id', 'first_name', 'last_name', 'profile_pic as avatar', 'user_email')
            .where('user_id', currentUserId)
            .first();

          if (userInfo) {
            currentUser = {
              rank: userRank,
              info: {
                ...userInfo,
                name: `${userInfo.first_name} ${userInfo.last_name}`,
                department: 'FullSuite',
                totalPoints: userTotalPoints
              }
            };
          }
        }
      } catch (error) {
        console.warn('Could not calculate current user rank:', error.message);
        // Continue without current user info
      }
    }

    return {
      leaderboard: processedLeaderboard,
      currentUser,
      pagination: {
        page,
        limit,
        hasMore: processedLeaderboard.length === limit
      }
    };
  },

  // Cached leaderboard with Redis support
  getCachedLeaderboard: async (period = 'weekly', currentUserId = null) => {
    const cacheKey = `leaderboard:${period}`;
    const cacheTTL = 300; // 5 minutes

    try {
      // Check if Redis is available
      if (global.redis) {
        const cached = await global.redis.get(cacheKey);
        if (cached) {
          const data = JSON.parse(cached);
          // Add current user info if needed
          if (currentUserId && !data.currentUser) {
            data.currentUser = await Points.getCurrentUserPosition(currentUserId, period);
          }
          return data;
        }
      }

      // Get fresh data
      const data = await Points.getOptimizedLeaderboard(period, currentUserId, 1, 50);
      
      // Cache the result
      if (global.redis) {
        await global.redis.setex(cacheKey, cacheTTL, JSON.stringify(data));
      }

      return data;
    } catch (error) {
      console.error('Leaderboard cache error:', error);
      // Fallback to direct database query
      return await Points.getOptimizedLeaderboard(period, currentUserId, 1, 50);
    }
  },

  // Materialized view approach for very large datasets
  updateLeaderboardCache: async (period = 'weekly') => {
    const startDate = Points.getPeriodStartDate(period);
    const cacheTable = 'leaderboard_cache';

    try {
      // Create cache table if it doesn't exist
      await db.schema.createTableIfNotExists(cacheTable, (table) => {
        table.string('period', 20);
        table.string('user_id', 36);
        table.integer('total_points');
        table.integer('rank_position');
        table.timestamp('last_updated');
        table.primary(['period', 'user_id']);
        table.index(['period', 'rank_position']);
      });

      // Clear old cache for this period
      await db(cacheTable).where('period', period).del();

      // Get top 1000 users for this period
      const topUsers = await db('sl_transactions')
        .join('sl_user_accounts', 'sl_transactions.to_user_id', 'sl_user_accounts.user_id')
        .select(
          'sl_user_accounts.user_id',
          db.raw('SUM(sl_transactions.amount) as total_points')
        )
        .whereIn('sl_transactions.type', ['received', 'earned'])
        .where('sl_transactions.created_at', '>=', startDate)
        .where('sl_user_accounts.is_active', true)
        .groupBy('sl_user_accounts.user_id')
        .having('total_points', '>', 0)
        .orderBy('total_points', 'desc')
        .limit(1000);

      // Insert into cache table with rank
      const cacheData = topUsers.map((user, index) => ({
        period,
        user_id: user.user_id,
        total_points: parseInt(user.total_points),
        rank_position: index + 1,
        last_updated: new Date()
      }));

      if (cacheData.length > 0) {
        await db(cacheTable).insert(cacheData);
      }

      return { success: true, cachedUsers: cacheData.length };
    } catch (error) {
      console.error('Cache update error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get leaderboard from cache table
  getCachedLeaderboardData: async (period = 'weekly', limit = 50, offset = 0) => {
    const cacheTable = 'leaderboard_cache';

    try {
      const leaderboard = await db(cacheTable)
        .join('sl_user_accounts', 'leaderboard_cache.user_id', 'sl_user_accounts.user_id')
        .select(
          'sl_user_accounts.user_id as _id',
          'sl_user_accounts.first_name',
          'sl_user_accounts.last_name',
          'sl_user_accounts.profile_pic as avatar',
          'sl_user_accounts.user_email',
          db.raw("CONCAT(sl_user_accounts.first_name, ' ', sl_user_accounts.last_name) as name"),
          'leaderboard_cache.total_points as totalPoints',
          'leaderboard_cache.rank_position as rank'
        )
        .where('leaderboard_cache.period', period)
        .where('sl_user_accounts.is_active', true)
        .orderBy('leaderboard_cache.rank_position', 'asc')
        .limit(limit)
        .offset(offset);

      return leaderboard.map(entry => ({
        _id: entry._id,
        name: entry.name,
        department: 'FullSuite',
        email: entry.user_email,
        avatar: entry.avatar,
        totalPoints: parseInt(entry.totalPoints) || 0,
        rank: parseInt(entry.rank) || 0
      }));
    } catch (error) {
      console.error('Cached leaderboard error:', error);
      // Fallback to direct query
      return await Points.getOptimizedLeaderboard(period, null, Math.floor(offset / limit) + 1, limit);
    }
  },

  // Get current user position efficiently
  getCurrentUserPosition: async (currentUserId, period) => {
    const startDate = Points.getPeriodStartDate(period);
    
    try {
      // Get user's total points for the period
      const userPoints = await db('sl_transactions')
        .sum('amount as totalPoints')
        .where('to_user_id', currentUserId)
        .whereIn('type', ['received', 'earned'])
        .where('created_at', '>=', startDate)
        .first();

      const userTotalPoints = parseInt(userPoints.totalPoints) || 0;

      if (userTotalPoints > 0) {
        // Count how many users have more points than current user
        const higherUsers = await db('sl_transactions')
          .join('sl_user_accounts', 'sl_transactions.to_user_id', 'sl_user_accounts.user_id')
          .select('sl_user_accounts.user_id')
          .sum('sl_transactions.amount as totalPoints')
          .whereIn('sl_transactions.type', ['received', 'earned'])
          .where('sl_transactions.created_at', '>=', startDate)
          .where('sl_user_accounts.is_active', true)
          .groupBy('sl_user_accounts.user_id')
          .having('totalPoints', '>', userTotalPoints)
          .count('* as count')
          .first();

        const userRank = (parseInt(higherUsers.count) || 0) + 1;

        // Get user info
        const userInfo = await db('sl_user_accounts')
          .select('user_id as _id', 'first_name', 'last_name', 'profile_pic as avatar', 'user_email')
          .where('user_id', currentUserId)
          .first();

        if (userInfo) {
          return {
            rank: userRank,
            info: {
              ...userInfo,
              name: `${userInfo.first_name} ${userInfo.last_name}`,
              department: 'FullSuite',
              totalPoints: userTotalPoints
            }
          };
        }
      }
    } catch (error) {
      console.warn('Could not calculate current user position:', error.message);
    }

    return null;
  },

  // Get heartbits received this month
  getMonthlyReceivedHeartbits: async (user_id) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const result = await transactionsTable()
      .where({
        to_user_id: user_id,
        type: 'received'
      })
      .whereBetween('created_at', [startOfMonth, endOfMonth])
      .sum('amount as totalReceived')
      .first();

    return parseInt(result?.totalReceived) || 0;
  },
};
