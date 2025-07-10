import { db } from './src/config/db.js';

const checkTestUser = async () => {
  console.log('=== Checking test@fullsuite.ph Account ===');
  
  try {
    // Get user details
    const user = await db('sl_user_accounts')
      .where('user_email', 'test@fullsuite.ph')
      .first();
    
    if (!user) {
      console.log('❌ User not found in database');
      return;
    }
    
    console.log('\n📊 User Account Details:');
    console.log('Email:', user.user_email);
    console.log('User ID:', user.user_id);
    console.log('First Name:', user.first_name);
    console.log('Last Name:', user.last_name);
    console.log('User Type:', user.user_type);
    console.log('Is Verified:', user.is_verified ? '✅ YES' : '❌ NO');
    console.log('Is Active:', user.is_active ? '✅ YES' : '❌ NO');
    console.log('Created At:', user.created_at);
    console.log('Updated At:', user.updated_at);
    
    // Check if password exists and is hashed
    console.log('\n🔒 Password Status:');
    console.log('Has Password:', user.user_password ? '✅ YES' : '❌ NO');
    if (user.user_password) {
      console.log('Password Hash Length:', user.user_password.length);
      console.log('Password Hash Preview:', user.user_password.substring(0, 20) + '...');
    }
    
    // Check verification codes/attempts
    console.log('\n📧 Verification Status:');
    const verificationCodes = await db('sl_verification_codes')
      .where('user_id', user.user_id)
      .orderBy('created_at', 'desc');
    
    console.log('Verification Codes Count:', verificationCodes.length);
    if (verificationCodes.length > 0) {
      const latest = verificationCodes[0];
      console.log('Latest Verification Code:');
      console.log('  - Created:', latest.created_at);
      console.log('  - Expires:', latest.expires_at);
      console.log('  - Expired?', new Date(latest.expires_at) < new Date() ? '❌ YES' : '✅ NO');
    }
    
    // Identify the specific issue
    console.log('\n🔍 Login Issues:');
    const issues = [];
    
    if (!user.is_verified) {
      issues.push('❌ Account is not verified');
    }
    if (!user.is_active) {
      issues.push('❌ Account is not active');
    }
    if (!user.user_password) {
      issues.push('❌ No password set');
    }
    
    if (issues.length === 0) {
      console.log('✅ No obvious issues found - account should be able to login');
    } else {
      console.log('Issues preventing login:');
      issues.forEach(issue => console.log('  ' + issue));
    }
    
  } catch (error) {
    console.error('Error checking user:', error.message);
  } finally {
    process.exit(0);
  }
};

checkTestUser();
