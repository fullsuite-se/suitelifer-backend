import { Suitebite } from "../models/suitebiteModel.js";

/**
 * Utility functions for heartbits calculations and validations
 */
export const HeartbitsUtils = {
  
  /**
   * Validate heartbits amount for cheer posting
   * @param {number} amount - Amount of heartbits to validate
   * @param {object} systemConfig - System configuration object
   * @returns {object} - Validation result
   */
  validateCheerAmount: (amount, systemConfig) => {
    const maxHeartbits = parseInt(systemConfig.max_heartbits_per_cheer?.value) || 50;
    
    if (!amount || amount < 1) {
      return {
        valid: false,
        message: "Heartbits amount must be at least 1"
      };
    }
    
    if (amount > maxHeartbits) {
      return {
        valid: false,
        message: `Maximum heartbits per cheer is ${maxHeartbits}`
      };
    }
    
    return { valid: true };
  },

  /**
   * Check if user has enough heartbits balance
   * @param {number} userId - User ID
   * @param {number} amount - Amount to check
   * @returns {Promise<object>} - Balance check result
   */
  checkBalance: async (userId, amount) => {
    try {
      const userHeartbits = await Suitebite.getUserHeartbits(userId);
      
      if (!userHeartbits) {
        return {
          sufficient: false,
          balance: 0,
          message: "User heartbits data not found"
        };
      }
      
      const balance = userHeartbits.heartbits_balance || 0;
      
      return {
        sufficient: balance >= amount,
        balance: balance,
        message: balance >= amount ? "Sufficient balance" : "Insufficient balance"
      };
    } catch (error) {
      console.error("Error checking heartbits balance:", error);
      return {
        sufficient: false,
        balance: 0,
        message: "Error checking balance"
      };
    }
  },

  /**
   * Check monthly heartbits sending limit
   * @param {number} userId - User ID
   * @param {number} amount - Amount to send
   * @returns {Promise<object>} - Limit check result
   */
  checkMonthlyLimit: async (userId, amount) => {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const limits = await Suitebite.getMonthlyLimit(userId, currentMonth);
      
      // Get default limit if no limit set
      if (!limits) {
        const systemConfig = await Suitebite.getSystemConfiguration();
        const defaultLimit = parseInt(systemConfig.default_monthly_limit?.value) || 1000;
        
        return {
          withinLimit: amount <= defaultLimit,
          sent: 0,
          limit: defaultLimit,
          remaining: defaultLimit - amount,
          message: amount <= defaultLimit ? "Within limit" : "Exceeds monthly limit"
        };
      }
      
      const sentThisMonth = limits.heartbits_sent || 0;
      const monthlyLimit = limits.heartbits_limit || 1000;
      const newTotal = sentThisMonth + amount;
      
      return {
        withinLimit: newTotal <= monthlyLimit,
        sent: sentThisMonth,
        limit: monthlyLimit,
        remaining: Math.max(0, monthlyLimit - newTotal),
        message: newTotal <= monthlyLimit ? "Within limit" : "Exceeds monthly limit"
      };
    } catch (error) {
      console.error("Error checking monthly limit:", error);
      return {
        withinLimit: false,
        sent: 0,
        limit: 0,
        remaining: 0,
        message: "Error checking monthly limit"
      };
    }
  },

  /**
   * Calculate heartbits earning based on system rate
   * @param {number} baseAmount - Base heartbits amount
   * @param {object} systemConfig - System configuration
   * @returns {number} - Calculated amount
   */
  calculateEarning: (baseAmount, systemConfig) => {
    const earningRate = parseFloat(systemConfig.heartbits_earning_rate?.value) || 1.0;
    return Math.round(baseAmount * earningRate);
  },

  /**
   * Get user's heartbits statistics
   * @param {number} userId - User ID
   * @returns {Promise<object>} - User statistics
   */
  getUserStats: async (userId) => {
    try {
      const userHeartbits = await Suitebite.getUserHeartbits(userId);
      const currentMonth = new Date().toISOString().slice(0, 7);
      const monthlyLimit = await Suitebite.getMonthlyLimit(userId, currentMonth);
      
      if (!userHeartbits) {
        return {
          balance: 0,
          totalEarned: 0,
          totalSpent: 0,
          cheersSent: 0,
          cheersReceived: 0,
          monthlyStats: {
            sent: 0,
            limit: 1000,
            remaining: 1000
          }
        };
      }
      
      return {
        balance: userHeartbits.heartbits_balance || 0,
        totalEarned: userHeartbits.total_heartbits_earned || 0,
        totalSpent: userHeartbits.total_heartbits_spent || 0,
        cheersSent: userHeartbits.total_cheers_sent || 0,
        cheersReceived: userHeartbits.total_cheers_received || 0,
        monthlyStats: {
          sent: monthlyLimit?.heartbits_sent || 0,
          limit: monthlyLimit?.heartbits_limit || 1000,
          remaining: Math.max(0, (monthlyLimit?.heartbits_limit || 1000) - (monthlyLimit?.heartbits_sent || 0))
        }
      };
    } catch (error) {
      console.error("Error getting user stats:", error);
      throw error;
    }
  },

  /**
   * Format heartbits amount for display
   * @param {number} amount - Amount to format
   * @returns {string} - Formatted string
   */
  formatAmount: (amount) => {
    if (amount === null || amount === undefined) return "0";
    return amount.toLocaleString();
  },

  /**
   * Calculate percentage of monthly limit used
   * @param {number} sent - Amount sent this month
   * @param {number} limit - Monthly limit
   * @returns {number} - Percentage (0-100)
   */
  calculateLimitPercentage: (sent, limit) => {
    if (!limit || limit <= 0) return 0;
    return Math.min(100, Math.round((sent / limit) * 100));
  },

  /**
   * Get limit status for UI display
   * @param {number} sent - Amount sent this month
   * @param {number} limit - Monthly limit
   * @returns {object} - Status object
   */
  getLimitStatus: (sent, limit) => {
    const percentage = HeartbitsUtils.calculateLimitPercentage(sent, limit);
    
    if (percentage >= 100) {
      return { status: "exceeded", color: "red", message: "Monthly limit exceeded" };
    } else if (percentage >= 90) {
      return { status: "warning", color: "orange", message: "Approaching monthly limit" };
    } else if (percentage >= 75) {
      return { status: "caution", color: "yellow", message: "75% of monthly limit used" };
    } else {
      return { status: "normal", color: "green", message: "Within monthly limit" };
    }
  },

  /**
   * Validate order purchase amount
   * @param {number} userId - User ID
   * @param {number} totalPoints - Total points needed
   * @returns {Promise<object>} - Validation result
   */
  validatePurchase: async (userId, totalPoints) => {
    try {
      const balanceCheck = await HeartbitsUtils.checkBalance(userId, totalPoints);
      
      if (!balanceCheck.sufficient) {
        return {
          valid: false,
          message: `Insufficient balance. You have ${balanceCheck.balance} heartbits, but need ${totalPoints}.`
        };
      }
      
      return { valid: true };
    } catch (error) {
      console.error("Error validating purchase:", error);
      return {
        valid: false,
        message: "Error validating purchase"
      };
    }
  }
};

export default HeartbitsUtils; 