import { db } from './src/config/db.js';

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    const result = await db.raw('SELECT 1 as test');
    console.log('✅ Database connection successful:', result[0]);
    
    // Test user_points table (with correct sl_ prefix)
    const userPointsCheck = await db('sl_user_points').limit(1);
    console.log('✅ sl_user_points table accessible, sample record count:', userPointsCheck.length);
    
    // Test transactions table (with correct sl_ prefix)
    const transactionsCheck = await db('sl_transactions').limit(1);
    console.log('✅ sl_transactions table accessible, sample record count:', transactionsCheck.length);
    
    // Test cheers table (with correct sl_ prefix)
    const cheersCheck = await db('sl_cheers').limit(1);
    console.log('✅ sl_cheers table accessible, sample record count:', cheersCheck.length);
    
    // Test users table (with correct sl_ prefix)
    const usersCheck = await db('sl_user_accounts').select('user_id', 'first_name', 'last_name', 'user_email').limit(1);
    console.log('✅ sl_user_accounts table accessible, sample users count:', usersCheck.length);
    if (usersCheck.length > 0) {
      console.log('   Sample user:', usersCheck[0].first_name, usersCheck[0].last_name);
    }
    
    console.log('\n🎉 All database tables are accessible!');
    
    await db.destroy();
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  }
}

testDatabaseConnection();
