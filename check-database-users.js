#!/usr/bin/env node

/**
 * Database User Check Script
 * Checks what users exist in the database and tests with real user IDs
 */

import { db } from './src/config/db.js';
import { Points } from './src/models/pointsModel.js';

async function checkDatabaseUsers() {
  try {
    console.log('🔍 CHECKING DATABASE USERS');
    console.log('=============================\n');

    // Check if users table exists and get some sample users
    const users = await db('sl_user_accounts')
      .select('user_id', 'first_name', 'last_name', 'user_email', 'is_active')
      .limit(5);

    console.log('📋 Available Users:');
    if (users.length === 0) {
      console.log('❌ No users found in sl_user_accounts table');
      console.log('   The application needs valid user accounts to function properly.');
      return;
    }

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.first_name} ${user.last_name} (${user.user_email})`);
      console.log(`   ID: ${user.user_id}, Active: ${user.is_active}`);
    });

    // Test with the first active user
    const activeUser = users.find(u => u.is_active) || users[0];
    if (!activeUser) {
      console.log('❌ No active users found');
      return;
    }

    console.log(`\n🧪 Testing with user: ${activeUser.first_name} ${activeUser.last_name}`);
    console.log('================================================\n');

    // Test getUserPoints with real user
    console.log('1️⃣ Testing getUserPoints...');
    let userPoints = await Points.getUserPoints(activeUser.user_id);
    
    if (!userPoints) {
      console.log('   User points not found, creating...');
      userPoints = await Points.createUserPoints(activeUser.user_id);
    }

    console.log('   ✅ User points:', {
      availablePoints: userPoints.availablePoints,
      monthlyHeartbits: userPoints.monthlyHeartbits || userPoints.monthlyCheerLimit,
      monthlyHeartbitsUsed: userPoints.monthlyHeartbitsUsed || userPoints.monthlyCheerUsed
    });

    // Test monthly reset
    console.log('\n2️⃣ Testing monthly reset...');
    const resetResult = await Points.checkAndResetMonthlyHeartbits(activeUser.user_id);
    console.log('   ✅ Monthly reset check completed');

    // Test heartbits remaining
    console.log('\n3️⃣ Testing heartbits remaining...');
    const remaining = await Points.getHeartbitsRemaining(activeUser.user_id);
    console.log(`   ✅ Heartbits remaining: ${remaining}/100`);

    console.log('\n✅ DATABASE USERS CHECK COMPLETED');
    console.log('   The backend functions work with valid user IDs');
    console.log('   Frontend should work if users are properly authenticated');

  } catch (error) {
    console.error('❌ DATABASE CHECK FAILED:', error.message);
  } finally {
    await db.destroy();
  }
}

checkDatabaseUsers();
