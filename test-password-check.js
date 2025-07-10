import { db } from './src/config/db.js';
import bcrypt from 'bcrypt';

const testPasswordCheck = async () => {
  console.log('=== Password Verification Test ===');
  
  try {
    // Get user details
    const user = await db('sl_user_accounts')
      .where('user_email', 'francis@fullsuite.ph')
      .first();
    
    if (!user) {
      console.log('User not found!');
      return;
    }
    
    console.log('User found:');
    console.log('- Email:', user.user_email);
    console.log('- User ID:', user.user_id);
    console.log('- Is Active:', user.is_active);
    console.log('- Is Verified:', user.is_verified);
    console.log('- Password Hash:', user.user_password);
    
    // Test password verification
    console.log('\nTesting password "password":');
    const isMatch1 = await bcrypt.compare('password', user.user_password);
    console.log('- "password" matches:', isMatch1);
    
    console.log('\nTesting password "Password":');
    const isMatch2 = await bcrypt.compare('Password', user.user_password);
    console.log('- "Password" matches:', isMatch2);
    
    console.log('\nTesting password "PASSWORD":');
    const isMatch3 = await bcrypt.compare('PASSWORD', user.user_password);
    console.log('- "PASSWORD" matches:', isMatch3);
    
    // Test a few more common passwords
    const testPasswords = ['admin', 'test', '123456', 'admin123', 'test123'];
    for (const pwd of testPasswords) {
      const match = await bcrypt.compare(pwd, user.user_password);
      console.log(`- "${pwd}" matches:`, match);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
};

testPasswordCheck();
