import { db } from './src/config/db.js';

const checkVerificationStatus = async () => {
  console.log('=== Checking User Verification Status ===');
  
  try {
    const users = await db('sl_user_accounts')
      .select('user_email', 'is_verified', 'is_active')
      .limit(10);
    
    console.log('Users verification status:');
    users.forEach(user => {
      console.log(`- ${user.user_email}: verified=${user.is_verified}, active=${user.is_active}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await db.destroy();
  }
};

checkVerificationStatus();
