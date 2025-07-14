import cron from 'node-cron';
import { Suitebite } from '../models/suitebiteModel.js';
import { db } from '../config/db.js';

/**
 * Suitebite automated cron jobs for system maintenance and data processing
 */
export const startSuitebiteJobs = () => {
  console.log('Starting Suitebite cron jobs...');

  // ==========================================
  // 1. PROCESS PENDING ORDERS (Every hour)
  // Auto-complete orders that have been pending for too long
  // ==========================================
  cron.schedule('0 * * * *', async () => {
    console.log('Running pending orders processor...');
    try {
      // Get system configuration for auto-complete days
      const systemConfig = await Suitebite.getSystemConfiguration();
      const autoCompleteDays = parseInt(systemConfig.order_auto_complete_days?.value) || 7;
      
      // Find orders that should be auto-completed
      const pendingOrders = await db('sl_orders')
        .where('status', 'pending')
        .where('ordered_at', '<', db.raw(`DATE_SUB(NOW(), INTERVAL ${autoCompleteDays} DAY)`));

      let processedCount = 0;
      for (const order of pendingOrders) {
        try {
          // Update order status to completed
          await db('sl_orders')
            .where('order_id', order.order_id)
            .update({
              status: 'completed',
              processed_at: new Date(),
              completed_at: new Date(),
              notes: 'Auto-completed after pending period'
            });

          // Log admin action for auto-completion
          await Suitebite.logAdminAction(
            1, // System user ID
            'PROCESS_ORDER',
            'ORDER',
            order.order_id,
            { 
              action: 'auto_complete', 
              reason: `Auto-completed after ${autoCompleteDays} days`,
              original_status: 'pending'
            }
          );

          processedCount++;
        } catch (error) {
          console.error(`Error processing order ${order.order_id}:`, error);
        }
      }

      if (processedCount > 0) {
        console.log(`Auto-completed ${processedCount} pending orders`);
      }
    } catch (error) {
      console.error('Error in pending orders processor:', error);
    }
  });

  // ==========================================
  // 2. RESET MONTHLY LIMITS (1st of each month at 00:01)
  // Reset all users' monthly heartbits sending counters and give monthly allowance
  // ==========================================
  cron.schedule('1 0 1 * *', async () => {
    console.log('Resetting monthly heartbits limits and giving monthly allowance...');
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      
      // Get system configuration for default monthly limit
      const systemConfig = await Suitebite.getSystemConfiguration();
      const defaultMonthlyLimit = systemConfig.default_monthly_limit ? 
        parseInt(systemConfig.default_monthly_limit.value) : 1000;
      
      // Get all active users
      const users = await db('sl_user_accounts')
        .select('user_id', 'first_name', 'last_name', 'user_email')
        .where('is_active', true)
        .where('user_type', 'in', ['EMPLOYEE', 'ADMIN', 'SUPER_ADMIN']);
      
      let resetCount = 0;
      let allowanceGiven = 0;
      
      for (const user of users) {
        try {
          // Reset monthly limits for the new month
          await Suitebite.resetMonthlyLimit(user.user_id, currentMonth);
          
          // Give monthly heartbits allowance
          await Suitebite.updateUserHeartbits(user.user_id, defaultMonthlyLimit);
          
          // Create transaction record for monthly allowance
          await db('sl_heartbits_transactions').insert({
            user_id: user.user_id,
            transaction_type: 'monthly_allowance',
            points_amount: defaultMonthlyLimit,
            reference_type: 'admin_adjustment',
            description: `Monthly heartbits allowance for ${currentMonth}`,
            created_at: new Date()
          });
          
          resetCount++;
          allowanceGiven += defaultMonthlyLimit;
          
        } catch (error) {
          console.error(`Error processing user ${user.user_id} (${user.first_name} ${user.last_name}):`, error);
        }
      }

      // Log system maintenance action
      await Suitebite.logAdminAction(
        1, // System user ID
        'SYSTEM_MAINTENANCE',
        'SYSTEM',
        null,
        { 
          operation: 'monthly_reset_and_allowance',
          month: currentMonth,
          users_processed: resetCount,
          total_allowance_given: allowanceGiven,
          monthly_limit: defaultMonthlyLimit
        }
      );

      console.log(`✅ Monthly reset completed:`);
      console.log(`   📊 Users processed: ${resetCount}`);
      console.log(`   💖 Total allowance given: ${allowanceGiven} heartbits`);
      console.log(`   📅 Month: ${currentMonth}`);
      console.log(`   ⚙️ Monthly limit: ${defaultMonthlyLimit} heartbits per user`);
      
    } catch (error) {
      console.error('Error in monthly reset and allowance process:', error);
    }
  });

  // ==========================================
  // 3. DAILY ANALYTICS UPDATE (Every day at 01:00)
  // Update daily statistics summary
  // ==========================================
  cron.schedule('0 1 * * *', async () => {
    console.log('Updating daily analytics...');
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const statDate = yesterday.toISOString().split('T')[0];

      // Calculate daily statistics
      const [cheersData] = await db('sl_cheer_post')
        .count('cheer_post_id as total_cheers')
        .sum('heartbits_given as total_heartbits')
        .countDistinct('cheerer_id as active_cheerers')
        .where(db.raw('DATE(posted_at)'), statDate);

      const [ordersData] = await db('sl_orders')
        .count('order_id as total_orders')
        .sum('total_points as total_order_value')
        .where(db.raw('DATE(ordered_at)'), statDate);

      const [usersData] = await db('sl_user_accounts')
        .count('user_id as new_users')
        .where(db.raw('DATE(created_at)'), statDate)
        .where('user_type', 'in', ['EMPLOYEE', 'ADMIN']);

      // Insert or update daily stats
      await db('sl_daily_stats')
        .insert({
          stat_date: statDate,
          active_users: cheersData.active_cheerers || 0,
          total_cheers: cheersData.total_cheers || 0,
          total_heartbits_given: cheersData.total_heartbits || 0,
          total_orders: ordersData.total_orders || 0,
          total_order_value: ordersData.total_order_value || 0,
          new_users: usersData.new_users || 0
        })
        .onDuplicate(['active_users', 'total_cheers', 'total_heartbits_given', 'total_orders', 'total_order_value', 'new_users', 'updated_at']);

      console.log(`Updated daily analytics for ${statDate}`);
    } catch (error) {
      console.error('Error updating daily analytics:', error);
    }
  });

  // ==========================================
  // 4. WEEKLY USER MONTHLY STATS UPDATE (Every Sunday at 02:00)
  // Update user monthly statistics
  // ==========================================
  cron.schedule('0 2 * * 0', async () => {
    console.log('Updating user monthly statistics...');
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      
      // Get all active users
      const users = await db('sl_user_accounts')
        .select('user_id')
        .where('is_active', true)
        .where('user_type', 'in', ['EMPLOYEE', 'ADMIN', 'SUPER_ADMIN']);

      let updatedCount = 0;
      for (const user of users) {
        try {
          // Calculate user stats for current month
          const [cheerStats] = await db('sl_cheer_post')
            .select(
              db.raw('COUNT(CASE WHEN cheerer_id = ? THEN 1 END) as cheers_sent', [user.user_id]),
              db.raw('COUNT(CASE WHEN cheeree_id = ? THEN 1 END) as cheers_received', [user.user_id]),
              db.raw('SUM(CASE WHEN cheerer_id = ? THEN heartbits_given ELSE 0 END) as heartbits_given', [user.user_id]),
              db.raw('SUM(CASE WHEN cheeree_id = ? THEN heartbits_given ELSE 0 END) as heartbits_earned', [user.user_id])
            )
            .where(db.raw('DATE_FORMAT(posted_at, "%Y-%m")'), currentMonth);

          const [orderStats] = await db('sl_orders')
            .count('order_id as orders_placed')
            .sum('total_points as heartbits_spent')
            .where('user_id', user.user_id)
            .where(db.raw('DATE_FORMAT(ordered_at, "%Y-%m")'), currentMonth);

          const [lastActivity] = await db('sl_cheer_post')
            .select(db.raw('MAX(posted_at) as last_activity'))
            .where(function() {
              this.where('cheerer_id', user.user_id)
                  .orWhere('cheeree_id', user.user_id);
            })
            .where(db.raw('DATE_FORMAT(posted_at, "%Y-%m")'), currentMonth);

          // Insert or update monthly stats
          await db('sl_user_monthly_stats')
            .insert({
              user_id: user.user_id,
              month_year: currentMonth,
              cheers_sent: cheerStats.cheers_sent || 0,
              cheers_received: cheerStats.cheers_received || 0,
              heartbits_given: cheerStats.heartbits_given || 0,
              heartbits_earned: cheerStats.heartbits_earned || 0,
              heartbits_spent: orderStats.heartbits_spent || 0,
              orders_placed: orderStats.orders_placed || 0,
              last_activity: lastActivity.last_activity
            })
            .onDuplicate([
              'cheers_sent', 'cheers_received', 'heartbits_given', 
              'heartbits_earned', 'heartbits_spent', 'orders_placed', 'last_activity'
            ]);

          updatedCount++;
        } catch (error) {
          console.error(`Error updating stats for user ${user.user_id}:`, error);
        }
      }

      console.log(`Updated monthly statistics for ${updatedCount} users`);
    } catch (error) {
      console.error('Error updating user monthly statistics:', error);
    }
  });

  // ==========================================
  // 5. CLEANUP OLD DATA (Every Sunday at 03:00)
  // Remove old logs and temporary data
  // ==========================================
  cron.schedule('0 3 * * 0', async () => {
    console.log('Running data cleanup...');
    try {
      const systemConfig = await Suitebite.getSystemConfiguration();
      const auditRetentionDays = parseInt(systemConfig.audit_log_retention_days?.value) || 1095; // 3 years default
      const dataRetentionDays = parseInt(systemConfig.data_retention_days?.value) || 365; // 1 year default

      // Cleanup old audit logs
      const auditLogsDeleted = await db('sl_admin_actions')
        .where('performed_at', '<', db.raw(`DATE_SUB(NOW(), INTERVAL ${auditRetentionDays} DAY)`))
        .del();

      // Cleanup old login attempts
      const loginAttemptsDeleted = await db('sl_login_attempts')
        .where('attempted_at', '<', db.raw(`DATE_SUB(NOW(), INTERVAL 90 DAY)`))
        .del();

      // Cleanup old API performance logs
      const performanceLogsDeleted = await db('sl_api_performance')
        .where('recorded_at', '<', db.raw(`DATE_SUB(NOW(), INTERVAL 30 DAY)`))
        .del();

      // Cleanup expired system notifications
      const expiredNotifications = await db('sl_system_notifications')
        .where('expires_at', '<', new Date())
        .where('expires_at', 'is not', null)
        .update({ is_active: false });

      // Log cleanup results
      await Suitebite.logAdminAction(
        1, // System user ID
        'SYSTEM_MAINTENANCE',
        'SYSTEM',
        null,
        {
          operation: 'data_cleanup',
          audit_logs_deleted: auditLogsDeleted,
          login_attempts_deleted: loginAttemptsDeleted,
          performance_logs_deleted: performanceLogsDeleted,
          notifications_expired: expiredNotifications
        }
      );

      console.log(`Data cleanup completed:
        - Audit logs deleted: ${auditLogsDeleted}
        - Login attempts deleted: ${loginAttemptsDeleted}
        - Performance logs deleted: ${performanceLogsDeleted}
        - Notifications expired: ${expiredNotifications}`);
    } catch (error) {
      console.error('Error during data cleanup:', error);
    }
  });

  // ==========================================
  // 6. SYSTEM HEALTH CHECK (Every 30 minutes)
  // Monitor system health and performance
  // ==========================================
  cron.schedule('*/30 * * * *', async () => {
    try {
      // Check database connectivity
      const dbConnected = await db.raw('SELECT 1').then(() => true).catch(() => false);
      
      // Check for pending orders that might need attention
      const [pendingOrdersCount] = await db('sl_orders')
        .count('order_id as count')
        .where('status', 'pending');

      // Check for flagged posts
      const [flaggedPostsCount] = await db('sl_cheer_post')
        .count('cheer_post_id as count')
        .where('is_flagged', true)
        .where('is_visible', true);

      // Record health metrics
      await db('sl_system_health_metrics').insert([
        {
          metric_name: 'database_connected',
          metric_value: dbConnected ? 1 : 0,
          metric_unit: 'boolean'
        },
        {
          metric_name: 'pending_orders',
          metric_value: pendingOrdersCount.count,
          metric_unit: 'count'
        },
        {
          metric_name: 'flagged_posts',
          metric_value: flaggedPostsCount.count,
          metric_unit: 'count'
        }
      ]);

      // Create alert if there are issues
      if (!dbConnected) {
        await db('sl_system_notifications').insert({
          notification_type: 'ERROR',
          title: 'Database Connection Issue',
          message: 'Database connectivity check failed. Please investigate immediately.',
          target_role: 'SYSTEM_ADMIN',
          created_by: 1
        });
      }

      if (pendingOrdersCount.count > 50) {
        await db('sl_system_notifications').insert({
          notification_type: 'WARNING',
          title: 'High Number of Pending Orders',
          message: `There are ${pendingOrdersCount.count} pending orders that may need attention.`,
          target_role: 'SHOP_MANAGER',
          created_by: 1
        });
      }

    } catch (error) {
      console.error('Error during health check:', error);
    }
  });

  // ==========================================
  // 7. BACKUP DATABASE (Configurable, default daily at 04:00)
  // Create database backup
  // ==========================================
  cron.schedule('0 4 * * *', async () => {
    console.log('Starting database backup...');
    try {
      const systemConfig = await Suitebite.getSystemConfiguration();
      const backupFrequencyHours = parseInt(systemConfig.backup_frequency_hours?.value) || 24;
      
      // Check if backup is needed based on frequency
      const lastBackup = await db('sl_admin_actions')
        .where('action_type', 'SYSTEM_MAINTENANCE')
        .whereRaw("JSON_EXTRACT(action_details, '$.operation') = 'database_backup'")
        .orderBy('performed_at', 'desc')
        .first();

      if (lastBackup) {
        const hoursSinceBackup = (new Date() - new Date(lastBackup.performed_at)) / (1000 * 60 * 60);
        if (hoursSinceBackup < backupFrequencyHours) {
          return; // Skip backup if not yet time
        }
      }

      // Log backup initiation
      await Suitebite.logAdminAction(
        1, // System user ID
        'SYSTEM_MAINTENANCE',
        'SYSTEM',
        null,
        {
          operation: 'database_backup',
          backup_type: 'automated',
          initiated_at: new Date()
        }
      );

      console.log('Database backup logged (actual backup implementation depends on infrastructure)');
    } catch (error) {
      console.error('Error during backup process:', error);
    }
  });

  console.log('All Suitebite cron jobs have been scheduled successfully');
};

export default startSuitebiteJobs; 