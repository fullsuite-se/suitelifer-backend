import { Points } from "../models/pointsModel.js";
import { AuditLog } from "../models/auditLogModel.js";
import { User } from "../models/userModel.js";
import { db } from "../config/db.js";
import { v7 as uuidv7 } from "uuid";
import { now } from "../utils/date.js";

// Get current user's points balance and heartbits stats
export const getPointsBalance = async (req, res) => {
  try {
    const { id: user_id } = req.user; // Extract id as user_id

    // Check and reset monthly heartbits if needed
    const userPoints = await Points.checkAndResetMonthlyHeartbits(user_id);

    // Calculate heartbits remaining
    const heartbitsRemaining = userPoints.monthlyHeartbits - userPoints.monthlyHeartbitsUsed;

    // Get heartbits received this month
    const monthlyReceivedHeartbits = await Points.getMonthlyReceivedHeartbits(user_id);

    res.status(200).json({
      success: true,
      data: {
        // Spendable points (from received cheers)
        availablePoints: userPoints.availablePoints,
        currentBalance: userPoints.availablePoints, // For frontend compatibility
        totalEarned: userPoints.totalEarned,
        totalSpent: userPoints.totalSpent,

        // Heartbits system
        monthlyHeartbits: userPoints.monthlyHeartbits, // Total allocation (100)
        monthlyHeartbitsUsed: userPoints.monthlyHeartbitsUsed, // Used this month
        heartbitsRemaining, // Available to give
        monthlyReceivedHeartbits, // received this month
        lastMonthlyReset: userPoints.lastMonthlyReset,

        // For compatibility with existing frontend
        monthlyCheerLimit: userPoints.monthlyHeartbits,
        monthlyCheerUsed: userPoints.monthlyHeartbitsUsed,
      }
    });
  } catch (error) {
    console.error("Error fetching points balance:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// Get user's transaction history
export const getTransactionHistory = async (req, res) => {
  try {
    const { id: user_id } = req.user; // Extract id as user_id
    const { limit = 20, offset = 0, type } = req.query;

    const transactions = await Points.getUserTransactions(
      user_id,
      parseInt(limit),
      parseInt(offset),
      type
    );

    const totalCount = await Points.getTransactionCount(user_id, type);

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: totalCount
      }
    });
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// Send heartbits to cheer another user
export const cheerUser = async (req, res) => {
  try {
    const { id: user_id } = req.user;
    const { to_user_id, recipientId, points, amount, message, created_at } = req.body;

    const utcDate = new Date(created_at).toISOString().slice(0, 19).replace("T", " ");


    // Support both parameter names for compatibility - prioritize amount over points
    const targetUserId = to_user_id || recipientId;

    // Parse the heartbits amount, ensuring it's a valid number
    let heartbitsToSend;
    if (amount !== undefined && amount !== null && amount !== '') {
      heartbitsToSend = parseInt(amount, 10);

    } else if (points !== undefined && points !== null && points !== '') {
      heartbitsToSend = parseInt(points, 10);

    } else {
      heartbitsToSend = 10; // Default fallback
    }

    // Validate that it's a valid number
    if (isNaN(heartbitsToSend)) {
      return res.status(400).json({
        success: false,
        message: "Invalid heartbits amount provided"
      });
    }

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: "Recipient user ID is required"
      });
    }

    if (user_id === targetUserId) {
      return res.status(400).json({
        success: false,
        message: "You cannot cheer yourself"
      });
    }

    if (heartbitsToSend < 1 || heartbitsToSend > 100) {
      return res.status(400).json({
        success: false,
        message: "Heartbits must be between 1 and 100"
      });
    }

    // Get sender's points record and check/reset monthly heartbits
    let senderPoints = await Points.getUserPoints(user_id);
    if (!senderPoints) {
      senderPoints = await Points.createUserPoints(user_id);
    }

    // Reset monthly heartbits if needed
    await Points.checkAndResetMonthlyHeartbits(user_id);

    // Get updated points after potential reset
    senderPoints = await Points.getUserPoints(user_id);

    // Check if sender can send heartbits
    const canSend = await Points.canSendHeartbits(user_id, heartbitsToSend);
    if (!canSend) {
      const heartbitsRemaining = await Points.getHeartbitsRemaining(user_id);
      return res.status(400).json({
        success: false,
        message: `Insufficient heartbits. You have ${heartbitsRemaining} heartbits remaining this month.`
      });
    }

    // Get or create recipient's points
    let recipientPoints = await Points.getUserPoints(targetUserId);
    if (!recipientPoints) {
      recipientPoints = await Points.createUserPoints(targetUserId);
    }

    // Perform the heartbits transaction
    const transactionId = uuidv7();
    const cheerId = uuidv7();

    // Use heartbits from sender (deduct from monthly allocation)
    await Points.useHeartbits(user_id, heartbitsToSend);

    // Add points to recipient from the cheer
    await Points.addPointsFromCheer(targetUserId, heartbitsToSend);

    // Create transaction records
    await Points.createTransaction({
      transaction_id: transactionId,
      from_user_id: user_id,
      to_user_id: targetUserId,
      type: "given",
      amount: heartbitsToSend,
      description: `cheered ${heartbitsToSend} ${heartbitsToSend < 2 ? "heartbit" : "heartbits"}`,
      message,
      metadata: JSON.stringify({ cheer_id: cheerId, type: "cheer" }),
      created_at: utcDate,
      updated_at: utcDate
    });


    await Points.createTransaction({
      transaction_id: uuidv7(),
      from_user_id: user_id,
      to_user_id: targetUserId,
      type: "received",
      amount: heartbitsToSend,
      description: `received ${heartbitsToSend} ${heartbitsToSend < 2 ? "heartbit" : "heartbits"}`,
      message,
      metadata: JSON.stringify({ cheer_id: cheerId, type: "cheer" }),
      created_at: utcDate,
      updated_at: utcDate

    });


    // Create cheer record
    await Points.createCheer({
      cheer_id: cheerId,
      from_user_id: user_id,
      to_user_id: targetUserId,
      points: heartbitsToSend,
      message,
      created_at: utcDate,
      updated_at: utcDate
    });

    // Get updated heartbits remaining for response
    const heartbitsRemaining = await Points.getHeartbitsRemaining(user_id);


    // Get user names for audit logging
    let senderName = 'Unknown User';
    let recipientName = 'Unknown User';

    try {
      const [sender, recipient] = await Promise.all([
        User.getUser(user_id),
        User.getUser(targetUserId)
      ]);

      if (sender) {
        senderName = `${sender.first_name} ${sender.last_name}`.trim();
      }

      if (recipient) {
        recipientName = `${recipient.first_name} ${recipient.last_name}`.trim();
      }
    } catch (nameError) {
      console.error("Error getting user names for audit log:", nameError);
      // Continue with default names if user lookup fails
    }

    // Log the cheer action to audit logs
    try {
      const auditData = {
        user_id: user_id,
        action: "CREATE",
        description: `${senderName} sent ${heartbitsToSend} heartbits to ${recipientName}${message ? ` with message: "${message}"` : ''}`,
        date: utcDate,
      };

      await AuditLog.addLog(auditData);
    } catch (auditError) {
      console.error("Error logging audit entry:", auditError);
      // Don't fail the main request if audit logging fails
    }


    res.status(200).json({
      success: true,
      message: "Heartbits sent successfully",
      data: {
        transactionId,
        cheerId,
        heartbitsSent: heartbitsToSend,
        heartbitsRemaining: heartbitsRemaining
      }
    });
  } catch (error) {
    console.error("Error sending cheer:", error);

    // Log failed cheer attempt to audit logs
    try {
      const { id: user_id } = req.user;
      const { to_user_id, recipientId, points, amount, message, created_at } = req.body;
      const targetUserId = to_user_id || recipientId;


      const utcDate = new Date(created_at).toISOString().slice(0, 19).replace("T", " ");

      // Get user names for failed audit logging
      let senderName = 'Unknown User';
      let recipientName = 'Unknown User';

      try {
        const [sender, recipient] = await Promise.all([
          User.getUser(user_id),
          targetUserId ? User.getUser(targetUserId) : null
        ]);

        if (sender) {
          senderName = `${sender.first_name} ${sender.last_name}`.trim();
        }

        if (recipient) {
          recipientName = `${recipient.first_name} ${recipient.last_name}`.trim();
        }
      } catch (nameError) {
        console.error("Error getting user names for failed audit log:", nameError);
        // Continue with default names if user lookup fails
      }

      const failedAuditData = {
        user_id: user_id,
        action: "UPDATE",
        description: `${senderName} failed to send ${amount || points || 'unknown'} heartbits to ${recipientName || 'unknown user'}. Error: ${error.message}`,
        date: utcDate,
      };

      await AuditLog.addLog(failedAuditData);
    } catch (auditError) {
      console.error("Error logging failed audit entry:", auditError);
      // Don't fail the main request if audit logging fails
    }

    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// Get points leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const { limit = 10, period = 'all' } = req.query;

    // Use the new optimized leaderboard function
    const leaderboardData = await Points.getOptimizedLeaderboard(period, null, 1, parseInt(limit));

    res.status(200).json({
      success: true,
      data: leaderboardData.leaderboard,
      period
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// Admin: Get all user points
export const getAllUserPoints = async (req, res) => {
  try {
    const { search } = req.query;

    const userPoints = await Points.getAllUserPoints(
      search
    );

    res.status(200).json({
      success: true,
      data: userPoints,
    });
  } catch (error) {
    console.error("Error fetching all user points:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// Admin: Add points to user
export const addPointsToUser = async (req, res) => {
  try {
    const { user_id, points, reason = "Admin bonus" } = req.body;
    const admin_user_id = req.user?.id || req.user?.user_id || 'unknown';

    if (!user_id || !points) {
      return res.status(400).json({
        success: false,
        message: "User ID and points are required"
      });
    }

    if (points <= 0) {
      return res.status(400).json({
        success: false,
        message: "Points must be positive"
      });
    }

    // Get admin user details for audit log
    let adminUser = null;
    let targetUser = null;

    try {
      adminUser = await User.getUser(admin_user_id);
    } catch (error) {
      console.error("Error getting admin user:", error);
    }

    try {
      targetUser = await User.getUser(user_id);
    } catch (error) {
      console.error("Error getting target user:", error);
    }

    // Get or create user points
    let userPoints = await Points.getUserPoints(user_id);
    if (!userPoints) {
      userPoints = await Points.createUserPoints(user_id);
    }

    // Update points
    await Points.updateUserPoints(user_id, {
      available_points: userPoints.availablePoints + points,
      total_earned: userPoints.totalEarned + points
    });

    // Create transaction for admin grant
    await Points.createTransaction({
      transaction_id: uuidv7(),
      from_user_id: admin_user_id,
      to_user_id: user_id,
      type: "admin_grant",
      amount: points,
      description: `received ${points} heartbits from Admin`,
      message: reason,
      metadata: JSON.stringify({ admin_action: true, admin_user_id })
    });

    // Log admin action to audit logs with enhanced details
    try {
      const adminName = adminUser ? `${adminUser.first_name} ${adminUser.last_name}` : `Admin ${admin_user_id}`;
      const targetUserName = targetUser ? `${targetUser.first_name} ${targetUser.last_name}` : `User ${user_id}`;

      await AuditLog.addLog({
        user_id: admin_user_id,
        action: "UPDATE",
        description: `${adminName} granted ${points} heartbits to ${targetUserName}. Reason: ${reason}`,
        date: now()
      });
    } catch (auditError) {
      console.error("Error logging admin action to audit logs:", auditError);
      // Don't fail the main request if audit logging fails
    }

    res.status(200).json({
      success: true,
      message: "Heartbits added successfully",
      data: {
        pointsAdded: points,
        newBalance: userPoints.availablePoints + points
      }
    });
  } catch (error) {
    console.error("Error adding points to user:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// Admin: Deduct points from user
export const deductPointsFromUser = async (req, res) => {
  try {
    const { user_id, points, reason = "Admin deduction" } = req.body;
    const admin_user_id = req.user?.id || req.user?.user_id || 'unknown';

    if (!user_id || !points) {
      return res.status(400).json({
        success: false,
        message: "User ID and points are required"
      });
    }

    if (points <= 0) {
      return res.status(400).json({
        success: false,
        message: "Points must be positive"
      });
    }

    // Get admin user details for audit log
    let adminUser = null;
    let targetUser = null;

    try {
      adminUser = await User.getUser(admin_user_id);
    } catch (error) {
      console.error("Error getting admin user:", error);
    }

    try {
      targetUser = await User.getUser(user_id);
    } catch (error) {
      console.error("Error getting target user:", error);
    }

    const userPoints = await Points.getUserPoints(user_id);
    if (!userPoints) {
      return res.status(400).json({
        success: false,
        message: "User points record not found"
      });
    }

    if (userPoints.availablePoints < points) {
      return res.status(400).json({
        success: false,
        message: "User has insufficient points"
      });
    }

    // Update points
    await Points.updateUserPoints(user_id, {
      available_points: userPoints.availablePoints - points,
      total_spent: userPoints.totalSpent + points
    });

    // Create transaction
    await Points.createTransaction({
      transaction_id: uuidv7(),
      from_user_id: admin_user_id,
      to_user_id: user_id,
      type: "admin_deduct",
      amount: -points,
      description: reason,
      metadata: JSON.stringify({ admin_action: true, admin_user_id })
    });

    // Log admin action to audit logs with enhanced details
    try {
      const adminName = adminUser ? `${adminUser.first_name} ${adminUser.last_name}` : `Admin ${admin_user_id}`;
      const targetUserName = targetUser ? `${targetUser.first_name} ${targetUser.last_name}` : `User ${user_id}`;

      await AuditLog.addLog({
        user_id: admin_user_id,
        action: "UPDATE",
        description: `${adminName} deducted ${points} heartbits from ${targetUserName}. Reason: ${reason}`,
        date: now()
      });
    } catch (auditError) {
      console.error("Error logging admin action to audit logs:", auditError);
      // Don't fail the main request if audit logging fails
    }

    res.status(200).json({
      success: true,
      message: "Heartbits deducted successfully",
      data: {
        pointsDeducted: points,
        newBalance: userPoints.availablePoints - points
      }
    });
  } catch (error) {
    console.error("Error deducting points from user:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// Admin: Get points analytics
export const getPointsAnalytics = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const analytics = await Points.getPointsAnalytics(parseInt(days));

    res.status(200).json({
      success: true,
      data: analytics,
      period: { days: parseInt(days) }
    });
  } catch (error) {
    console.error("Error fetching points analytics:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// Enhanced cheer with social features and performance optimizations
export const getCheerFeed = async (req, res) => {
  try {
    const { page = 1, limit = 20, offset = 0, from, to } = req.query;
    const user_id = req.user.id; // Get current user ID

    // Use offset if provided, otherwise calculate from page
    const calculatedOffset = offset ? parseInt(offset) : (parseInt(page) - 1) * parseInt(limit);
    const calculatedLimit = parseInt(limit);

    // Pass from/to to model for date filtering
    const cheers = await Points.getCheerFeed(
      calculatedLimit,
      calculatedOffset,
      user_id,
      from || null,
      to || null
    );

    res.json({
      success: true,
      data: {
        cheers,
        pagination: {
          page: parseInt(page),
          limit: calculatedLimit,
          offset: calculatedOffset,
          hasMore: cheers.length === calculatedLimit
        }
      }
    });
  } catch (error) {
    console.error("Error fetching cheer feed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cheer feed"
    });
  }
};



export const addCheerComment = async (req, res) => {
  try {
    const { cheer_id } = req.params;
    const { comment } = req.body;
    const user_id = req.user.id; // Use id instead of user_id

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot be empty"
      });
    }

    const newComment = await Points.addCheerComment(cheer_id, user_id, comment.trim());

    res.json({
      success: true,
      data: newComment,
      message: "Comment added successfully"
    });
  } catch (error) {
    console.error("Error adding cheer comment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add comment"
    });
  }
};

// Get comments for a cheer
export const getCheerComments = async (req, res) => {
  try {
    const { cheer_id } = req.params;
    let { limit = 20, offset = 0, all = false } = req.query;

    let comments;
    if (all === 'true' || all === true) {
      // Fetch all comments for this cheer
      comments = await Points.getCheerComments(cheer_id, Number.MAX_SAFE_INTEGER, 0);
    } else {
      comments = await Points.getCheerComments(cheer_id, parseInt(limit), parseInt(offset));
    }

    res.status(200).json({
      success: true,
      data: comments
    });
  } catch (error) {
    console.error("Error fetching cheer comments:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// Toggle like on a cheer
export const toggleCheerLike = async (req, res) => {
  try {
    const { id: user_id } = req.user; // Extract id as user_id
    const { cheer_id } = req.params;

    const result = await Points.toggleCheerLike(cheer_id, user_id);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Error toggling cheer like:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;
    const user_id = req.user.id; // Use id instead of user_id

    if (!query || query.trim().length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }

    // Search users by name or email (excluding current user)
    const users = await db("sl_user_accounts")
      .select("user_id", "first_name", "last_name", "user_email", "profile_pic as avatar")
      .where("user_id", "!=", user_id)
      .where("is_active", true)
      .where(function () {
        this.whereRaw("LOWER(CONCAT(first_name, ' ', last_name)) LIKE ?", [`%${query.toLowerCase()}%`])
          .orWhereRaw("LOWER(user_email) LIKE ?", [`%${query.toLowerCase()}%`]);
      })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: users.map(user => ({
        ...user,
        name: `${user.first_name} ${user.last_name}`,
        email: user.user_email
      }))
    });
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search users"
    });
  }
};

// Get cheer statistics for current user
export const getCheerStats = async (req, res) => {
  try {
    const { id: user_id } = req.user; // Extract id as user_id

    const stats = await Points.getCheerStats(user_id);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("Error fetching cheer stats:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// Get cheers received by current user
export const getReceivedCheers = async (req, res) => {
  try {
    const { id: user_id } = req.user; // Extract id as user_id
    const { limit = 20, offset = 0 } = req.query;

    const receivedCheers = await Points.getReceivedCheers(
      user_id,
      parseInt(limit),
      parseInt(offset)
    );

    res.status(200).json({
      success: true,
      data: receivedCheers
    });
  } catch (error) {
    console.error("Error fetching received cheers:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// Get leaderboard with period support - OPTIMIZED VERSION
export const getLeaderboardWithPeriod = async (req, res) => {
  try {
    const { period = 'weekly', user_id } = req.query;
    const queryTime = Date.now();
    const useCache = req.query.useCache || 'true';



    const leaderboardData = await Points.getOptimizedLeaderboard(period, user_id, useCache === 'true');



    if (!leaderboardData || !Array.isArray(leaderboardData.leaderboard)) {
      throw new Error('Invalid leaderboard data structure');
    }

    // Sort the leaderboard by points in descending order, then by name A-Z for ties
    const sortedLeaderboard = leaderboardData.leaderboard.map(entry => ({
      ...entry,
      totalPoints: Number(entry.totalPoints || entry.total_earned || 0)
    })).sort((a, b) => {
      // First sort by points (descending)
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      // If points are equal, sort by name A-Z
      const nameA = (a.name || a.userName || '').toLowerCase();
      const nameB = (b.name || b.userName || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });



    // Assign sequential ranks (ties broken by alphabetical order)
    sortedLeaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    // Calculate current user's rank
    let currentUser = null;
    if (leaderboardData.currentUser && leaderboardData.currentUser.info) {
      const userPoints = Number(leaderboardData.currentUser.info.totalPoints || leaderboardData.currentUser.info.total_earned || 0);
      let userRank = 1;

      for (const entry of sortedLeaderboard) {
        if (userPoints < entry.totalPoints) {
          userRank++;
        } else {
          break;
        }
      }

      currentUser = {
        ...leaderboardData.currentUser,
        rank: userRank,
        info: {
          ...leaderboardData.currentUser.info,
          totalPoints: userPoints
        }
      };
    }



    res.status(200).json({
      success: true,
      data: sortedLeaderboard,
      currentUser,
      period,
      performance: {
        queryTime,
        useCache: useCache === 'true'
      }
    });
  } catch (error) {
    console.error('Error in getLeaderboardWithPeriod:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch leaderboard'
    });
  }
};

// Update leaderboard cache (admin function)
export const updateLeaderboardCache = async (req, res) => {
  try {
    const { period = 'weekly' } = req.query;

    const result = await Points.updateLeaderboardCache(period);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: `Leaderboard cache updated for ${period} period`,
        data: result
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to update leaderboard cache",
        error: result.error
      });
    }
  } catch (error) {
    console.error("Error updating leaderboard cache:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// Get leaderboard performance metrics
export const getLeaderboardPerformance = async (req, res) => {
  try {
    const { period = 'weekly' } = req.query;

    // Test query performance
    const startTime = Date.now();
    const testData = await Points.getOptimizedLeaderboard(period, null, 1, 50);
    const queryTime = Date.now() - startTime;

    // Get database size info
    const dbSize = await db.raw(`
      SELECT 
        table_name,
        ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)',
        table_rows
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
        AND table_name IN ('sl_transactions', 'sl_user_accounts', 'sl_cheers')
      ORDER BY (data_length + index_length) DESC
    `);

    res.status(200).json({
      success: true,
      data: {
        queryTime,
        resultCount: testData.leaderboard.length,
        period,
        databaseSize: dbSize[0],
        recommendations: queryTime > 1000 ? [
          "Consider implementing Redis caching",
          "Add more database indexes",
          "Use materialized views for large datasets"
        ] : [
          "Performance is good",
          "Monitor for growth"
        ]
      }
    });
  } catch (error) {
    console.error("Error getting performance metrics:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// Update a cheer comment
export const updateCheerComment = async (req, res) => {
  try {
    const { cheer_id, comment_id } = req.params;
    const { comment } = req.body;
    const user_id = req.user.id;

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot be empty"
      });
    }

    const updated = await Points.updateCheerComment(comment_id, user_id, comment.trim());
    if (updated === 0) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own comment."
      });
    }
    res.json({
      success: true,
      message: "Comment updated successfully"
    });
  } catch (error) {
    console.error("Error updating cheer comment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update comment"
    });
  }
};

// Delete a cheer comment
export const deleteCheerComment = async (req, res) => {
  try {
    const { cheer_id, comment_id } = req.params;
    const user_id = req.user.id;
    const deleted = await Points.deleteCheerComment(comment_id, user_id);
    if (deleted === 0) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own comment."
      });
    }
    res.json({
      success: true,
      message: "Comment deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting cheer comment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete comment"
    });
  }
};

// Mark moderation notification as dismissed
export const dismissModerationNotification = async (req, res) => {
  try {
    const user_id = req.user.id || req.user.user_id;
    const { transaction_id } = req.params;

    if (!transaction_id) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID is required"
      });
    }

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    const success = await Points.markModerationAsDismissed(user_id, transaction_id);

    if (success) {
      res.status(200).json({
        success: true,
        message: "Notification dismissed successfully"
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Notification not found or already dismissed"
      });
    }
  } catch (error) {
    console.error("Error dismissing notification:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};


