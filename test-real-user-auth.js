import { db } from './src/config/db.js';

const checkUsers = async () => {
  console.log('=== Checking Available Users ===');
  
  try {
    const users = await db('sl_user_accounts')
      .select('user_email', 'is_verified', 'is_active')
      .limit(10);
    
    console.log('\nAvailable users:');
    users.forEach(user => {
      console.log(`Email: ${user.user_email}, Verified: ${user.is_verified}, Active: ${user.is_active}`);
    });
    
    // Test with the first verified and active user
    const testUser = users.find(u => u.is_verified && u.is_active);
    if (testUser) {
      console.log(`\nTesting login with: ${testUser.user_email}`);
      
      const loginResponse = await fetch('http://localhost:7432/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: testUser.user_email,
          password: 'password'
        })
      });
      
      console.log('Login status:', loginResponse.status);
      const loginData = await loginResponse.text();
      console.log('Login response:', loginData);
      
      if (loginResponse.ok) {
        console.log('\n🎉 Login successful! Testing user-info...');
        
        // Test user-info with cookies
        const userInfoResponse = await fetch('http://localhost:7432/api/user-info', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Cookie': loginResponse.headers.get('set-cookie') || ''
          }
        });
        
        console.log('User-info status:', userInfoResponse.status);
        const userInfoData = await userInfoResponse.text();
        console.log('User-info response:', userInfoData);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
};

checkUsers();
