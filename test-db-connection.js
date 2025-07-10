#!/usr/bin/env node

// Comprehensive database connectivity test for all cheer features
import { db } from './src/config/db.js';
import { Points } from './src/models/pointsModel.js';

async function testDatabaseConnectivity() {
  console.log('🔍 COMPREHENSIVE DATABASE CONNECTIVITY TEST');
  console.log('==========================================\n');
  
  let allTestsPassed = true;
  
  try {
    // Test 1: Basic Database Connection
    console.log('1️⃣ Testing Basic Database Connection...');
    try {
      await db.raw('SELECT 1 as test');
      console.log('   ✅ Database connection successful');
    } catch (error) {
      console.log('   ❌ Database connection failed:', error.message);
      allTestsPassed = false;
    }
    
    // Test 2: Check All Required Tables Exist
    console.log('\n2️⃣ Testing Table Existence...');
    const requiredTables = [
      'sl_user_accounts',
      'sl_user_points', 
      'sl_transactions',
      'sl_cheers',
      'sl_cheer_comments',
      'sl_cheer_likes'
    ];
    
    for (const table of requiredTables) {
      try {
        await db(table).limit(1);
        console.log(`   ✅ Table ${table} exists and accessible`);
      } catch (error) {
        console.log(`   ❌ Table ${table} not accessible:`, error.message);
        allTestsPassed = false;
      }
    }
    
    // Test 3: User Points Model Functions
    console.log('\n3️⃣ Testing User Points Model Functions...');
    
    // Get a test user
    const testUser = await db('sl_user_accounts').select('user_id').first();
    if (!testUser) {
      console.log('   ❌ No users found in database');
      allTestsPassed = false;
    } else {
      const userId = testUser.user_id;
      console.log(`   Using test user ID: ${userId}`);
      
      // Test getUserPoints
      try {
        const userPoints = await Points.getUserPoints(userId);
        console.log('   ✅ getUserPoints() working:', userPoints ? 'Has data' : 'No data');
      } catch (error) {
        console.log('   ❌ getUserPoints() failed:', error.message);
        allTestsPassed = false;
      }
      
      // Test createUserPoints (if user doesn't have points)
      try {
        const existingPoints = await Points.getUserPoints(userId);
        if (!existingPoints) {
          await Points.createUserPoints(userId);
          console.log('   ✅ createUserPoints() working');
        } else {
          console.log('   ✅ createUserPoints() not needed (user has points)');
        }
      } catch (error) {
        console.log('   ❌ createUserPoints() failed:', error.message);
        allTestsPassed = false;
      }
    }
    
    // Test 4: Transaction Model Functions
    console.log('\n4️⃣ Testing Transaction Model Functions...');
    
    if (testUser) {
      const userId = testUser.user_id;
      
      // Test getUserTransactions
      try {
        const transactions = await Points.getUserTransactions(userId, 5);
        console.log(`   ✅ getUserTransactions() working: Found ${transactions.length} transactions`);
      } catch (error) {
        console.log('   ❌ getUserTransactions() failed:', error.message);
        allTestsPassed = false;
      }
      
      // Test getTransactionCount
      try {
        const count = await Points.getTransactionCount(userId);
        console.log(`   ✅ getTransactionCount() working: ${count.count} transactions`);
      } catch (error) {
        console.log('   ❌ getTransactionCount() failed:', error.message);
        allTestsPassed = false;
      }
    }
    
    // Test 5: Cheer Model Functions
    console.log('\n5️⃣ Testing Cheer Model Functions...');
    
    if (testUser) {
      const userId = testUser.user_id;
      
      // Test getUserCheers
      try {
        const cheers = await Points.getUserCheers(userId, 5);
        console.log(`   ✅ getUserCheers() working: Found ${cheers.length} cheers`);
      } catch (error) {
        console.log('   ❌ getUserCheers() failed:', error.message);
        allTestsPassed = false;
      }
      
      // Test getCheerFeed
      try {
        const feed = await Points.getCheerFeed(5, 0);
        console.log(`   ✅ getCheerFeed() working: Found ${feed.length} feed items`);
      } catch (error) {
        console.log('   ❌ getCheerFeed() failed:', error.message);
        allTestsPassed = false;
      }
      
      // Test getReceivedCheers
      try {
        const received = await Points.getReceivedCheers(userId, 5, 0);
        console.log(`   ✅ getReceivedCheers() working: Found ${received.length} received cheers`);
      } catch (error) {
        console.log('   ❌ getReceivedCheers() failed:', error.message);
        allTestsPassed = false;
      }
      
      // Test getCheerStats
      try {
        const stats = await Points.getCheerStats(userId);
        console.log('   ✅ getCheerStats() working:', stats);
      } catch (error) {
        console.log('   ❌ getCheerStats() failed:', error.message);
        allTestsPassed = false;
      }
    }
    
    // Test 6: Leaderboard Functions
    console.log('\n6️⃣ Testing Leaderboard Functions...');
    
    // Test getPointsLeaderboard
    try {
      const leaderboard = await Points.getPointsLeaderboard(5, 'all');
      console.log(`   ✅ getPointsLeaderboard() working: Found ${leaderboard.length} entries`);
    } catch (error) {
      console.log('   ❌ getPointsLeaderboard() failed:', error.message);
      allTestsPassed = false;
    }
    
    // Test getLeaderboard
    try {
      const leaderboard = await Points.getLeaderboard('weekly');
      console.log(`   ✅ getLeaderboard() working: Found ${leaderboard.leaderboard.length} entries`);
    } catch (error) {
      console.log('   ❌ getLeaderboard() failed:', error.message);
      allTestsPassed = false;
    }
    
    // Test 7: Search and User Functions
    console.log('\n7️⃣ Testing Search and User Functions...');
    
    // Test getAllUserPoints (includes search functionality)
    try {
      const users = await Points.getAllUserPoints(5, 0, null);
      console.log(`   ✅ getAllUserPoints() working: Found ${users.length} users`);
    } catch (error) {
      console.log('   ❌ getAllUserPoints() failed:', error.message);
      allTestsPassed = false;
    }
    
    // Test with search
    try {
      const searchResults = await Points.getAllUserPoints(5, 0, 'm');
      console.log(`   ✅ getAllUserPoints() with search working: Found ${searchResults.length} matching users`);
    } catch (error) {
      console.log('   ❌ getAllUserPoints() with search failed:', error.message);
      allTestsPassed = false;
    }
    
    // Test 8: Comment Functions
    console.log('\n8️⃣ Testing Comment Functions...');
    
    // Test getCheerComments (with dummy cheer ID)
    try {
      const comments = await Points.getCheerComments('dummy-id', 5, 0);
      console.log(`   ✅ getCheerComments() working: Found ${comments.length} comments`);
    } catch (error) {
      console.log('   ❌ getCheerComments() failed:', error.message);
      allTestsPassed = false;
    }
    
    // Test 9: Like Functions
    console.log('\n9️⃣ Testing Like Functions...');
    
    // Test getCheerLikes (with dummy cheer ID)
    try {
      const likes = await Points.getCheerLikes('dummy-id');
      console.log(`   ✅ getCheerLikes() working: Found ${likes.length} likes`);
    } catch (error) {
      console.log('   ❌ getCheerLikes() failed:', error.message);
      allTestsPassed = false;
    }
    
    // Test getCheerLikesCount (with dummy cheer ID)
    try {
      const likeCount = await Points.getCheerLikesCount('dummy-id');
      console.log(`   ✅ getCheerLikesCount() working: ${likeCount.count} likes`);
    } catch (error) {
      console.log('   ❌ getCheerLikesCount() failed:', error.message);
      allTestsPassed = false;
    }
    
    // Test 10: Analytics Functions
    console.log('\n🔟 Testing Analytics Functions...');
    
    // Test getPointsAnalytics
    try {
      const analytics = await Points.getPointsAnalytics(30);
      console.log(`   ✅ getPointsAnalytics() working: Found ${analytics.length} daily stats`);
    } catch (error) {
      console.log('   ❌ getPointsAnalytics() failed:', error.message);
      allTestsPassed = false;
    }
    
    // Test 11: Database Schema Verification
    console.log('\n1️⃣1️⃣ Testing Database Schema...');
    
    const tables = [
      { name: 'sl_user_accounts', key: 'user_id' },
      { name: 'sl_user_points', key: 'user_id' },
      { name: 'sl_transactions', key: 'id' },
      { name: 'sl_cheers', key: 'cheer_id' },
      { name: 'sl_cheer_comments', key: 'id' },
      { name: 'sl_cheer_likes', key: 'id' }
    ];
    
    for (const table of tables) {
      try {
        const columns = await db.raw(`DESCRIBE ${table.name}`);
        const hasKey = columns[0].some(col => col.Field === table.key);
        console.log(`   ✅ ${table.name} schema: ${hasKey ? 'Valid' : 'Missing key'} (${columns[0].length} columns)`);
      } catch (error) {
        console.log(`   ❌ ${table.name} schema check failed:`, error.message);
        allTestsPassed = false;
      }
    }
    
    // Final Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 FINAL TEST RESULTS:');
    console.log('='.repeat(50));
    
    if (allTestsPassed) {
      console.log('🎉 ALL DATABASE CONNECTIVITY TESTS PASSED!');
      console.log('✅ All cheer features are properly connected to the database');
      console.log('✅ All model functions are working correctly');
      console.log('✅ Database schema is valid');
      console.log('✅ Ready for full functionality testing');
    } else {
      console.log('❌ SOME TESTS FAILED!');
      console.log('⚠️  Please review the failed tests above');
      console.log('⚠️  Some cheer features may not work properly');
    }
    
    console.log('\n🎯 Database Status Summary:');
    const userCount = await db('sl_user_accounts').count('* as count').first();
    const pointsCount = await db('sl_user_points').count('* as count').first();
    const transactionCount = await db('sl_transactions').count('* as count').first();
    const cheerCount = await db('sl_cheers').count('* as count').first();
    const commentCount = await db('sl_cheer_comments').count('* as count').first();
    const likeCount = await db('sl_cheer_likes').count('* as count').first();
    
    console.log(`   👥 Users: ${userCount.count}`);
    console.log(`   🎯 User Points: ${pointsCount.count}`);
    console.log(`   💰 Transactions: ${transactionCount.count}`);
    console.log(`   💌 Cheers: ${cheerCount.count}`);
    console.log(`   💬 Comments: ${commentCount.count}`);
    console.log(`   ❤️  Likes: ${likeCount.count}`);
    
  } catch (error) {
    console.error('💥 Critical test failure:', error);
    allTestsPassed = false;
  }
  
  process.exit(allTestsPassed ? 0 : 1);
}

testDatabaseConnectivity();
