#!/usr/bin/env node

// Focused test for getLeaderboard function
import { Points } from './src/models/pointsModel.js';

async function testLeaderboard() {
  console.log('🔍 FOCUSED LEADERBOARD TEST\n');
  
  try {
    console.log('Testing Points.getLeaderboard("weekly")...');
    const result = await Points.getLeaderboard('weekly');
    
    console.log('Raw result:', result);
    console.log('Result type:', typeof result);
    console.log('Result keys:', result ? Object.keys(result) : 'null/undefined');
    
    if (result && result.leaderboard) {
      console.log('✅ Leaderboard array length:', result.leaderboard.length);
      console.log('✅ Current user:', result.currentUser);
    } else {
      console.log('❌ Missing leaderboard property in result');
    }
    
  } catch (error) {
    console.log('❌ getLeaderboard failed:');
    console.log('   Error message:', error.message);
    console.log('   Error stack:', error.stack);
  }
  
  // Also test the basic leaderboard for comparison
  try {
    console.log('\nTesting Points.getPointsLeaderboard(5, "all")...');
    const basicResult = await Points.getPointsLeaderboard(5, 'all');
    console.log('✅ Basic leaderboard works:', basicResult.length, 'entries');
  } catch (error) {
    console.log('❌ Basic leaderboard failed:', error.message);
  }
  
  process.exit(0);
}

testLeaderboard();
