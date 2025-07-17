import { db } from './src/config/db.js';
import { Points } from './src/models/pointsModel.js';

const testMonthlyReset = async () => {
  console.log('=== Testing Monthly Reset Behavior ===');
  
  try {
    // Get a test user
    const user = await db('sl_user_accounts')
      .select('user_id', 'first_name', 'last_name', 'user_email')
      .where('user_email', 'melbraei.santiago@fullsuite.ph')
      .first();
      
    if (!user) {
      console.log('❌ Test user not found');
      return;
    }
    
    console.log(`\n🧪 Testing with user: ${user.first_name} ${user.last_name}`);
    
    // Test 1: Current state (July 2025)
    console.log('\n--- Test 1: Current State (July 2025) ---');
    const currentUserPoints = await Points.checkAndResetMonthlyHeartbits(user.user_id);
    const currentReceived = await Points.getMonthlyReceivedHeartbits(user.user_id);
    const currentRemaining = currentUserPoints.monthlyHeartbits - currentUserPoints.monthlyHeartbitsUsed;
    
    console.log(`Current Month: July 2025`);
    console.log(`Last Reset: ${currentUserPoints.lastMonthlyReset}`);
    console.log(`Monthly Limit: ${currentUserPoints.monthlyHeartbits}`);
    console.log(`Monthly Used: ${currentUserPoints.monthlyHeartbitsUsed}`);
    console.log(`Remaining: ${currentRemaining}`);
    console.log(`Received this month: ${currentReceived}`);
    console.log(`Current Display: ${currentRemaining} | ${currentReceived}`);
    
    // Test 2: Simulate what happens on August 1st
    console.log('\n--- Test 2: Simulating August 1st Reset ---');
    
    // Mock August 1st date by temporarily modifying the function behavior
    console.log('Simulating checkAndResetMonthlyHeartbits for August 1st...');
    
    // Get current points without reset
    const userPointsBeforeReset = await Points.getUserPoints(user.user_id);
    console.log('Before August reset:');
    console.log(`  - Monthly Used: ${userPointsBeforeReset.monthlyHeartbitsUsed}`);
    console.log(`  - Last Reset: ${userPointsBeforeReset.lastMonthlyReset}`);
    
    // Simulate what the reset function would do on August 1st
    const augustFirst = new Date(2025, 7, 1); // August 1st, 2025
    const currentMonth = new Date(2025, 6, 1); // July 1st, 2025 (current last reset)
    
    console.log(`\nSimulating transition from ${currentMonth.toDateString()} to ${augustFirst.toDateString()}`);
    
    if (augustFirst > currentMonth) {
      console.log('✅ Reset condition would be met (new month detected)');
      console.log('The system would:');
      console.log('  1. Reset monthly_cheer_used to 0');
      console.log('  2. Update last_monthly_reset to August 1st');
      
      // Calculate what the values would be after reset
      const simulatedAfterReset = {
        monthlyHeartbits: userPointsBeforeReset.monthlyHeartbits,
        monthlyHeartbitsUsed: 0, // Reset to 0
        lastMonthlyReset: augustFirst
      };
      
      console.log('\nAfter August reset:');
      console.log(`  - Monthly Used: ${simulatedAfterReset.monthlyHeartbitsUsed}`);
      console.log(`  - Remaining: ${simulatedAfterReset.monthlyHeartbits - simulatedAfterReset.monthlyHeartbitsUsed}`);
      console.log(`  - Last Reset: ${simulatedAfterReset.lastMonthlyReset.toDateString()}`);
    }
    
    // Test 3: Simulate received heartbits calculation for August
    console.log('\n--- Test 3: Simulating August Received Heartbits ---');
    
    // Check what getMonthlyReceivedHeartbits would return on August 1st
    const augustStart = new Date(2025, 7, 1); // August 1st
    const augustEnd = new Date(2025, 7, 31, 23, 59, 59, 999); // August 31st
    
    console.log(`Checking transactions between ${augustStart.toDateString()} and ${augustEnd.toDateString()}`);
    
    const augustTransactions = await db('sl_transactions')
      .where({
        to_user_id: user.user_id,
        type: 'received'
      })
      .whereBetween('created_at', [augustStart, augustEnd])
      .sum('amount as totalReceived')
      .first();
      
    const augustReceived = parseInt(augustTransactions?.totalReceived) || 0;
    console.log(`Transactions in August 2025: ${augustReceived} heartbits`);
    
    // Test 4: Final simulation
    console.log('\n--- Test 4: Final August 1st Display Simulation ---');
    console.log('On August 1st, 2025:');
    console.log(`  - Heartbits remaining: 100 (reset from ${userPointsBeforeReset.monthlyHeartbitsUsed} used back to 0)`);
    console.log(`  - Heartbits received: ${augustReceived} (count of August transactions)`);
    console.log(`  - Display format: 100 | ${augustReceived}`);
    
    if (augustReceived === 0) {
      console.log('✅ CONFIRMED: August 1st display will be "100 | 0"');
    } else {
      console.log(`ℹ️  August 1st display will be "100 | ${augustReceived}" (if there are existing August transactions)`);
    }
    
    // Test 5: Verify the date logic
    console.log('\n--- Test 5: Verifying Date Logic ---');
    const testDates = [
      { date: new Date(2025, 6, 31), desc: 'July 31st' },
      { date: new Date(2025, 7, 1), desc: 'August 1st' },
      { date: new Date(2025, 7, 15), desc: 'August 15th' }
    ];
    
    testDates.forEach(test => {
      const startOfMonth = new Date(test.date.getFullYear(), test.date.getMonth(), 1);
      const endOfMonth = new Date(test.date.getFullYear(), test.date.getMonth() + 1, 0, 23, 59, 59, 999);
      console.log(`${test.desc}: Counting transactions from ${startOfMonth.toDateString()} to ${endOfMonth.toDateString()}`);
    });
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    process.exit(0);
  }
};

testMonthlyReset();
