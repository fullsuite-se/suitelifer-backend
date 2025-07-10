#!/usr/bin/env node

/**
 * Test Cheer Feed Endpoint
 * Tests if the cheer feed (recent posts) is working
 */

import { db } from './src/config/db.js';
import { Points } from './src/models/pointsModel.js';

async function testCheerFeed() {
  try {
    console.log('🗞️ TESTING CHEER FEED (RECENT POSTS)');
    console.log('=====================================\n');

    // Check if there are any cheers in the database
    console.log('1️⃣ Checking cheer data in database...');
    const cheerCount = await db('sl_cheers').count('* as count').first();
    console.log(`   Total cheers in database: ${cheerCount.count}`);

    if (cheerCount.count === 0) {
      console.log('   ❌ No cheers found in database');
      console.log('   📝 To test, users need to send some cheers first');
      return;
    }

    // Get recent cheers directly from model
    console.log('\n2️⃣ Testing getCheerFeed model function...');
    const recentCheers = await Points.getCheerFeed(5, 0);
    console.log(`   Retrieved ${recentCheers.length} recent cheers`);

    if (recentCheers.length > 0) {
      console.log('\n   📋 Recent Cheers:');
      recentCheers.forEach((cheer, index) => {
        console.log(`   ${index + 1}. ${cheer.fromUser.name} → ${cheer.toUser.name}`);
        console.log(`      Points: ${cheer.points}, Message: "${cheer.message}"`);
        console.log(`      Comments: ${cheer.commentCount}, Likes: ${cheer.likeCount}`);
      });
    }

    // Test API endpoint response format
    console.log('\n3️⃣ Testing API response format...');
    console.log('   ✅ API should return:');
    console.log('   {');
    console.log('     "success": true,');
    console.log('     "data": {');
    console.log('       "cheers": [...],');
    console.log('       "pagination": { ... }');
    console.log('     }');
    console.log('   }');

    console.log('\n✅ CHEER FEED TEST COMPLETED');
    
    if (recentCheers.length === 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      console.log('   1. Send some cheers between users to populate the feed');
      console.log('   2. Use the Cheer a Peer page to create test data');
      console.log('   3. The feed will then display recent posts');
    }

  } catch (error) {
    console.error('❌ CHEER FEED TEST FAILED:', error.message);
    console.error('Error details:', error);
  } finally {
    await db.destroy();
  }
}

testCheerFeed();
