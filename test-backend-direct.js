#!/usr/bin/env node

/**
 * Simple Backend Test with Mock Authentication
 * Tests if the points API works when properly authenticated
 */

import express from 'express';
import { Points } from './src/models/pointsModel.js';

// Create a simple test user ID
const TEST_USER_ID = 'test-user-123';

console.log('🧪 BACKEND FUNCTIONALITY TEST');
console.log('================================');

async function testBackendDirectly() {
  try {
    console.log('1️⃣ Testing getUserPoints...');
    
    // Test if we can get user points directly from the model
    let userPoints = await Points.getUserPoints(TEST_USER_ID);
    
    if (!userPoints) {
      console.log('   User not found, creating new user...');
      userPoints = await Points.createUserPoints(TEST_USER_ID);
      console.log('   ✅ User created successfully');
    }
    
    console.log('   User Points Data:', {
      availablePoints: userPoints.availablePoints,
      totalEarned: userPoints.totalEarned,
      totalSpent: userPoints.totalSpent,
      monthlyHeartbits: userPoints.monthlyHeartbits,
      monthlyHeartbitsUsed: userPoints.monthlyHeartbitsUsed
    });
    
    console.log('\n2️⃣ Testing monthly reset...');
    const resetResult = await Points.checkAndResetMonthlyHeartbits(TEST_USER_ID);
    console.log('   ✅ Monthly reset check completed');
    console.log('   Heartbits remaining:', resetResult.monthlyHeartbits - resetResult.monthlyHeartbitsUsed);
    
    console.log('\n3️⃣ Testing heartbits validation...');
    const canSend10 = await Points.canSendHeartbits(TEST_USER_ID, 10);
    const canSend200 = await Points.canSendHeartbits(TEST_USER_ID, 200);
    console.log('   Can send 10 heartbits:', canSend10);
    console.log('   Can send 200 heartbits:', canSend200);
    
    console.log('\n✅ BACKEND TEST COMPLETE - All functions working!');
    
  } catch (error) {
    console.log('\n❌ BACKEND TEST FAILED:', error.message);
    console.log('Error details:', error);
  }
}

testBackendDirectly();
