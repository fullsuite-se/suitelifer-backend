/**
 * Utility functions for analytics calculations and data processing
 */
export const AnalyticsUtils = {

  /**
   * Calculate percentage change between two values
   * @param {number} current - Current value
   * @param {number} previous - Previous value
   * @returns {object} - Change data
   */
  calculatePercentageChange: (current, previous) => {
    if (previous === 0) {
      return {
        percentage: current > 0 ? 100 : 0,
        direction: current > 0 ? 'up' : 'neutral',
        absolute: current
      };
    }

    const change = ((current - previous) / previous) * 100;
    return {
      percentage: Math.abs(Math.round(change * 10) / 10),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
      absolute: current - previous
    };
  },

  /**
   * Calculate growth rate over time periods
   * @param {Array} data - Array of data points with date and value
   * @returns {object} - Growth analysis
   */
  calculateGrowthRate: (data) => {
    if (!data || data.length < 2) {
      return { growthRate: 0, trend: 'insufficient_data' };
    }

    const sortedData = data.sort((a, b) => new Date(a.date) - new Date(b.date));
    const firstValue = sortedData[0].value;
    const lastValue = sortedData[sortedData.length - 1].value;
    const periods = sortedData.length - 1;

    if (firstValue === 0) {
      return { growthRate: 0, trend: 'no_baseline' };
    }

    const totalGrowth = (lastValue - firstValue) / firstValue;
    const growthRate = (Math.pow(1 + totalGrowth, 1 / periods) - 1) * 100;

    return {
      growthRate: Math.round(growthRate * 100) / 100,
      trend: growthRate > 0 ? 'increasing' : growthRate < 0 ? 'decreasing' : 'stable'
    };
  },

  /**
   * Calculate user engagement score
   * @param {object} userStats - User statistics
   * @returns {number} - Engagement score (0-100)
   */
  calculateEngagementScore: (userStats) => {
    const {
      total_cheers_sent = 0,
      total_cheers_received = 0,
      total_heartbits_given = 0,
      orders_placed = 0,
      days_active = 1
    } = userStats;

    // Normalize metrics (adjust weights as needed)
    const cheersSentScore = Math.min(total_cheers_sent / days_active * 30, 40); // Max 40 points
    const cheersReceivedScore = Math.min(total_cheers_received / days_active * 30, 20); // Max 20 points
    const heartbitsScore = Math.min(total_heartbits_given / days_active * 10, 25); // Max 25 points
    const shopScore = Math.min(orders_placed / days_active * 50, 15); // Max 15 points

    const totalScore = cheersSentScore + cheersReceivedScore + heartbitsScore + shopScore;
    return Math.min(Math.round(totalScore), 100);
  },

  /**
   * Categorize users by engagement level
   * @param {number} engagementScore - User engagement score
   * @returns {string} - Engagement category
   */
  categorizeEngagement: (engagementScore) => {
    if (engagementScore >= 80) return 'high';
    if (engagementScore >= 50) return 'medium';
    if (engagementScore >= 20) return 'low';
    return 'inactive';
  },

  /**
   * Calculate moving average for time series data
   * @param {Array} data - Array of numeric values
   * @param {number} window - Window size for moving average
   * @returns {Array} - Moving averages
   */
  calculateMovingAverage: (data, window = 7) => {
    if (!data || data.length < window) return data;

    const movingAverages = [];
    for (let i = window - 1; i < data.length; i++) {
      const sum = data.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0);
      movingAverages.push(Math.round((sum / window) * 100) / 100);
    }
    return movingAverages;
  },

  /**
   * Identify peak activity hours from hourly data
   * @param {Array} hourlyData - Array of {hour, count} objects
   * @returns {object} - Peak analysis
   */
  identifyPeakHours: (hourlyData) => {
    if (!hourlyData || hourlyData.length === 0) {
      return { peak_hour: null, peak_count: 0, average: 0 };
    }

    const sortedData = hourlyData.sort((a, b) => b.count - a.count);
    const totalCount = hourlyData.reduce((sum, item) => sum + item.count, 0);
    const average = totalCount / hourlyData.length;

    return {
      peak_hour: sortedData[0].hour,
      peak_count: sortedData[0].count,
      average: Math.round(average * 100) / 100,
      top_3_hours: sortedData.slice(0, 3).map(item => ({
        hour: item.hour,
        count: item.count,
        percentage: Math.round((item.count / totalCount) * 100)
      }))
    };
  },

  /**
   * Calculate distribution statistics
   * @param {Array} values - Array of numeric values
   * @returns {object} - Distribution statistics
   */
  calculateDistribution: (values) => {
    if (!values || values.length === 0) {
      return { min: 0, max: 0, mean: 0, median: 0, mode: 0, std_dev: 0 };
    }

    const sorted = values.sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;

    // Median
    const mid = Math.floor(values.length / 2);
    const median = values.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];

    // Mode (most frequent value)
    const frequency = {};
    values.forEach(val => frequency[val] = (frequency[val] || 0) + 1);
    const mode = Object.keys(frequency).reduce((a, b) => 
      frequency[a] > frequency[b] ? a : b
    );

    // Standard deviation
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const std_dev = Math.sqrt(variance);

    return {
      min,
      max,
      mean: Math.round(mean * 100) / 100,
      median: Math.round(median * 100) / 100,
      mode: parseInt(mode),
      std_dev: Math.round(std_dev * 100) / 100
    };
  },

  /**
   * Format analytics data for chart display
   * @param {Array} data - Raw analytics data
   * @param {string} dateField - Date field name
   * @param {string} valueField - Value field name
   * @returns {Array} - Formatted chart data
   */
  formatChartData: (data, dateField = 'date', valueField = 'value') => {
    if (!data || data.length === 0) return [];

    return data.map(item => ({
      x: item[dateField],
      y: item[valueField],
      label: item.label || `${item[valueField]}`
    }));
  },

  /**
   * Generate time period labels
   * @param {string} period - Period type (day, week, month, year)
   * @param {number} count - Number of periods
   * @returns {Array} - Array of period labels
   */
  generatePeriodLabels: (period, count = 30) => {
    const labels = [];
    const now = new Date();

    for (let i = count - 1; i >= 0; i--) {
      const date = new Date(now);
      
      switch (period) {
        case 'day':
          date.setDate(date.getDate() - i);
          labels.push(date.toISOString().split('T')[0]);
          break;
        case 'week':
          date.setDate(date.getDate() - (i * 7));
          labels.push(`Week ${date.getFullYear()}-${Math.ceil(date.getDate() / 7)}`);
          break;
        case 'month':
          date.setMonth(date.getMonth() - i);
          labels.push(date.toISOString().slice(0, 7));
          break;
        case 'year':
          date.setFullYear(date.getFullYear() - i);
          labels.push(date.getFullYear().toString());
          break;
        default:
          labels.push(date.toISOString().split('T')[0]);
      }
    }

    return labels;
  },

  /**
   * Calculate correlation between two data series
   * @param {Array} x - First data series
   * @param {Array} y - Second data series
   * @returns {number} - Correlation coefficient (-1 to 1)
   */
  calculateCorrelation: (x, y) => {
    if (!x || !y || x.length !== y.length || x.length === 0) {
      return 0;
    }

    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

    if (denominator === 0) return 0;
    return Math.round((numerator / denominator) * 1000) / 1000;
  },

  /**
   * Predict next period value using linear regression
   * @param {Array} data - Historical data points
   * @returns {object} - Prediction result
   */
  predictNextValue: (data) => {
    if (!data || data.length < 2) {
      return { prediction: 0, confidence: 'low' };
    }

    const n = data.length;
    const x = data.map((_, i) => i);
    const y = data;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const prediction = slope * n + intercept;
    const confidence = n >= 7 ? 'high' : n >= 4 ? 'medium' : 'low';

    return {
      prediction: Math.max(0, Math.round(prediction)),
      confidence,
      trend: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable'
    };
  },

  /**
   * Format large numbers for display
   * @param {number} num - Number to format
   * @returns {string} - Formatted number string
   */
  formatLargeNumber: (num) => {
    if (num === null || num === undefined) return '0';
    
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    } else {
      return num.toLocaleString();
    }
  }
};

export default AnalyticsUtils; 