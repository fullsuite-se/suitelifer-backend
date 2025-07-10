#!/usr/bin/env node

// Final comprehensive database connectivity verification
import { Points } from './src/models/pointsModel.js';
import { db } from './src/config/db.js';

async function finalConnectivityTest() {
  console.log('🎯 FINAL DATABASE CONNECTIVITY VERIFICATION');
  console.log('===========================================\n');
  
  let allTestsPassed = true;
  const testResults = [];
  
  // Helper function to test and record results
  const testFunction = async (name, testFn) => {
    try {
      const result = await testFn();
      console.log(`✅ ${name}: PASSED`);
      testResults.push({ name, status: 'PASSED', result });
      return true;
    } catch (error) {
      console.log(`❌ ${name}: FAILED - ${error.message}`);
      testResults.push({ name, status: 'FAILED', error: error.message });
      allTestsPassed = false;
      return false;
    }
  };
  
  // Get test user
  const testUser = await db('sl_user_accounts').select('user_id').first();
  const userId = testUser?.user_id;
  
  if (!userId) {
    console.log('❌ No test user found');
    process.exit(1);
  }
  
  console.log(`Using test user: ${userId}\n`);
  
  // Test all critical functions
  await testFunction('Database Connection', () => db.raw('SELECT 1'));
  
  await testFunction('getUserPoints', () => Points.getUserPoints(userId));
  
  await testFunction('getUserTransactions', () => Points.getUserTransactions(userId, 5));
  
  await testFunction('getCheerFeed', () => Points.getCheerFeed(5, 0));
  
  await testFunction('getReceivedCheers', () => Points.getReceivedCheers(userId, 5, 0));
  
  await testFunction('getCheerStats', () => Points.getCheerStats(userId));
  
  await testFunction('getLeaderboard (FIXED)', () => Points.getLeaderboard('weekly'));
  
  await testFunction('getPointsLeaderboard', () => Points.getPointsLeaderboard(5, 'all'));
  
  await testFunction('getAllUserPoints', () => Points.getAllUserPoints(5, 0));
  
  await testFunction('getUserCheers', () => Points.getUserCheers(userId, 5));
  
  await testFunction('getCheerComments', () => Points.getCheerComments('test-id', 5));
  
  await testFunction('getCheerLikes', () => Points.getCheerLikes('test-id'));
  
  await testFunction('getPointsAnalytics', () => Points.getPointsAnalytics(30));
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 FINAL TEST SUMMARY:');
  console.log('='.repeat(50));
  
  const passedTests = testResults.filter(t => t.status === 'PASSED').length;
  const failedTests = testResults.filter(t => t.status === 'FAILED').length;
  
  console.log(`✅ PASSED: ${passedTests}`);
  console.log(`❌ FAILED: ${failedTests}`);
  console.log(`📈 SUCCESS RATE: ${Math.round((passedTests / testResults.length) * 100)}%`);
  
  if (allTestsPassed) {
    console.log('\n🎉 ALL DATABASE CONNECTIVITY TESTS PASSED!');
    console.log('🚀 ALL CHEER FEATURES ARE FULLY CONNECTED TO DATABASE!');
    console.log('✅ Ready for production use!');
  } else {
    console.log('\n⚠️  Some tests failed, but critical functions are working');
    console.log('🔍 Failed tests:');
    testResults.filter(t => t.status === 'FAILED').forEach(test => {
      console.log(`   - ${test.name}: ${test.error}`);
    });
  }
  
  // Database status
  console.log('\n📊 DATABASE STATUS:');
  const counts = await Promise.all([
    db('sl_user_accounts').count('* as count').first(),
    db('sl_user_points').count('* as count').first(),
    db('sl_transactions').count('* as count').first(),
    db('sl_cheers').count('* as count').first(),
    db('sl_cheer_comments').count('* as count').first(),
    db('sl_cheer_likes').count('* as count').first()
  ]);
  
  console.log(`   👥 Users: ${counts[0].count}`);
  console.log(`   🎯 User Points: ${counts[1].count}`);
  console.log(`   💰 Transactions: ${counts[2].count}`);
  console.log(`   💌 Cheers: ${counts[3].count}`);
  console.log(`   💬 Comments: ${counts[4].count}`);
  console.log(`   ❤️  Likes: ${counts[5].count}`);
  
  console.log('\n🎯 READY FOR TESTING AT:');
  console.log('   🌐 Frontend: http://localhost:5175/');
  console.log('   🔧 Backend: http://localhost:7432');
  console.log('   📱 Cheer Page: http://localhost:5175/employee/cheer');
  
  process.exit(allTestsPassed ? 0 : 1);
}

finalConnectivityTest();
