import { db } from './src/config/db.js';
import { Points } from './src/models/pointsModel.js';

const testHeartbitsDisplay = async () => {
  console.log('=== Testing Heartbits Display Logic ===');
  
  try {
    // Test with a few users
    const testUsers = [
      'melbraei.santiago@fullsuite.ph',
      'hernani.domingo@fullsuite.ph', 
      'lance.salcedo@fullsuite.ph'
    ];

    for (const email of testUsers) {
      console.log(`\n--- Testing ${email} ---`);
      
      // Get user ID
      const user = await db('sl_user_accounts')
        .select('user_id', 'first_name', 'last_name')
        .where('user_email', email)
        .first();
        
      if (!user) {
        console.log(`❌ User not found: ${email}`);
        continue;
      }
      
      // Get user points data (like the API does)
      const userPoints = await Points.checkAndResetMonthlyHeartbits(user.user_id);
      const monthlyReceivedHeartbits = await Points.getMonthlyReceivedHeartbits(user.user_id);
      
      // Calculate display values
      const heartbitsRemaining = userPoints.monthlyHeartbits - userPoints.monthlyHeartbitsUsed;
      
      console.log(`📊 ${user.first_name} ${user.last_name}:`);
      console.log(`   Monthly Limit: ${userPoints.monthlyHeartbits}`);
      console.log(`   Used This Month: ${userPoints.monthlyHeartbitsUsed}`);
      console.log(`   Remaining: ${heartbitsRemaining}`);
      console.log(`   Received This Month: ${monthlyReceivedHeartbits}`);
      console.log(`   🎯 Display Format: ${heartbitsRemaining} | ${monthlyReceivedHeartbits}`);
    }
    
    // Test the API endpoint directly
    console.log('\n=== Testing API Endpoint ===');
    const response = await fetch('http://localhost:7432/api/user-info', {
      method: 'GET',
      credentials: 'include'
    });
    
    if (response.status === 403) {
      console.log('⚠️ Need to authenticate first - testing with login');
      
      const loginResponse = await fetch('http://localhost:7432/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: 'melbraei.santiago@fullsuite.ph',
          password: 'password'
        })
      });
      
      if (loginResponse.ok) {
        console.log('✅ Login successful, testing points API...');
        
        const pointsResponse = await fetch('http://localhost:7432/api/points/balance', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Cookie': loginResponse.headers.get('set-cookie') || ''
          }
        });
        
        if (pointsResponse.ok) {
          const pointsData = await pointsResponse.json();
          console.log('📊 API Response:');
          console.log(JSON.stringify(pointsData.data, null, 2));
          
          if (pointsData.data.monthlyReceivedHeartbits !== undefined) {
            console.log('✅ monthlyReceivedHeartbits field is present in API response');
            const remaining = pointsData.data.monthlyHeartbits - pointsData.data.monthlyHeartbitsUsed;
            console.log(`🎯 Frontend should display: ${remaining} | ${pointsData.data.monthlyReceivedHeartbits}`);
          } else {
            console.log('❌ monthlyReceivedHeartbits field is missing from API response');
          }
        } else {
          console.log('❌ Points API failed:', pointsResponse.status);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    process.exit(0);
  }
};

testHeartbitsDisplay();
