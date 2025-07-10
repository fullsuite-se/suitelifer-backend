import { db } from './src/config/db.js';

async function listUsers() {
  try {
    console.log('📋 Listing existing users...\n');
    
    const users = await db('sl_user_accounts')
      .select('user_id', 'first_name', 'last_name', 'user_email')
      .limit(10);
    
    if (users.length === 0) {
      console.log('❌ No users found in the database');
      console.log('You may need to create some test users first.');
    } else {
      console.log('👥 Available users:');
      users.forEach(user => {
        console.log(`  ID: ${user.user_id}, Name: ${user.first_name} ${user.last_name}, Email: ${user.user_email}`);
      });
      
      console.log(`\n🔍 Found ${users.length} users total.`);
      console.log('You can use these user IDs for testing the heartbits system.');
    }
    
  } catch (error) {
    console.error('❌ Error listing users:', error);
  } finally {
    process.exit(0);
  }
}

listUsers();
