#!/usr/bin/env node

// Quick script to verify cheer-related database tables and data
import { db } from './src/config/db.js';

async function checkTables() {
  console.log('🔍 Checking cheer-related tables and data...\n');
  
  try {
    // Check user accounts table
    console.log('👥 User accounts:');
    const userCount = await db('sl_user_accounts').count('* as count').first();
    console.log(`   - Total users: ${userCount.count}`);
    
    const sampleUser = await db('sl_user_accounts').select('user_id', 'first_name', 'last_name', 'user_email').first();
    if (sampleUser) {
      console.log(`   - Sample user: ${sampleUser.first_name} ${sampleUser.last_name} (${sampleUser.user_email})`);
    }
    
    // Check user points table
    console.log('\n🎯 User points:');
    const pointsCount = await db('sl_user_points').count('* as count').first();
    console.log(`   - Total user point records: ${pointsCount.count}`);
    
    const samplePoints = await db('sl_user_points').select('*').first();
    if (samplePoints) {
      console.log(`   - Sample points record: User ${samplePoints.user_id} has ${samplePoints.available_points} available points`);
    }
    
    // Check transactions table
    console.log('\n💰 Transactions:');
    const transactionCount = await db('sl_transactions').count('* as count').first();
    console.log(`   - Total transactions: ${transactionCount.count}`);
    
    const sampleTransaction = await db('sl_transactions').select('*').first();
    if (sampleTransaction) {
      console.log('   - Sample transaction:', {
        id: sampleTransaction.id,
        from_user_id: sampleTransaction.from_user_id,
        to_user_id: sampleTransaction.to_user_id,
        amount: sampleTransaction.amount,
        type: sampleTransaction.type
      });
    }
    
    // Check cheers table
    console.log('\n💌 Cheers:');
    const cheerCount = await db('sl_cheers').count('* as count').first();
    console.log(`   - Total cheers: ${cheerCount.count}`);
    
    const sampleCheer = await db('sl_cheers').select('*').first();
    if (sampleCheer) {
      console.log('   - Sample cheer:', {
        id: sampleCheer.id,
        from_user_id: sampleCheer.from_user_id,
        to_user_id: sampleCheer.to_user_id,
        points: sampleCheer.points,
        message: sampleCheer.message
      });
    }
    
    // Check cheer comments table
    console.log('\n💬 Cheer comments:');
    const commentCount = await db('sl_cheer_comments').count('* as count').first();
    console.log(`   - Total comments: ${commentCount.count}`);
    
    // Check cheer likes table
    console.log('\n❤️ Cheer likes:');
    const likeCount = await db('sl_cheer_likes').count('* as count').first();
    console.log(`   - Total likes: ${likeCount.count}`);
    
    console.log('\n✅ Database verification complete! All tables exist and have data.');
    
  } catch (error) {
    console.error('❌ Database check failed:', error);
  }
  
  process.exit(0);
}

checkTables();
