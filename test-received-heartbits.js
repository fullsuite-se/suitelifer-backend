import { db } from './src/config/db.js';
import { Points } from './src/models/pointsModel.js';

const testReceivedHeartbits = async () => {
  console.log('=== Testing Monthly Received Heartbits ===');
  
  try {
    // Test with a known user
    const users = await db('sl_user_accounts')
      .select('user_id', 'user_email', 'first_name', 'last_name')
      .where('is_verified', true)
      .limit(3);
    
    console.log('\nTesting with users:');
    
    for (const user of users) {
      console.log(`\n--- User: ${user.first_name} ${user.last_name} (${user.user_email}) ---`);
      
      // Get their points data
      const userPoints = await Points.getUserPoints(user.user_id);
      console.log('User points:', {
        availablePoints: userPoints?.availablePoints,
        monthlyHeartbits: userPoints?.monthlyHeartbits,
        monthlyHeartbitsUsed: userPoints?.monthlyHeartbitsUsed,
        remaining: (userPoints?.monthlyHeartbits || 100) - (userPoints?.monthlyHeartbitsUsed || 0)
      });
      
      // Get received heartbits this month
      const receivedThisMonth = await Points.getMonthlyReceivedHeartbits(user.user_id);
      console.log('Received this month:', receivedThisMonth);
      
      // Check transactions for this user this month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const transactions = await db('sl_transactions')
        .where('to_user_id', user.user_id)
        .where('type', 'received')
        .where('created_at', '>=', startOfMonth)
        .select('amount', 'created_at', 'description');
      
      console.log('Recent received transactions:', transactions);
      
      console.log(`Display format: ${(userPoints?.monthlyHeartbits || 100) - (userPoints?.monthlyHeartbitsUsed || 0)} | ${receivedThisMonth}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
};

testReceivedHeartbits();
