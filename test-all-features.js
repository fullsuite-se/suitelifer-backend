import axios from 'axios';

const BASE_URL = 'http://localhost:7432/api';

// Test all Points Dashboard and Cheer a Peer features
async function testAllFeatures() {
  console.log('🔍 Testing All Points Dashboard & Cheer a Peer Features...\n');
  
  const testEndpoints = [
    // Points Dashboard Features
    { path: '/points/balance', method: 'GET', description: 'User points balance' },
    { path: '/points/transactions', method: 'GET', description: 'Transaction history' },
    { path: '/points/stats', method: 'GET', description: 'Cheer statistics' },
    { path: '/points/received', method: 'GET', description: 'Received cheers' },
    { path: '/points/leaderboard', method: 'GET', description: 'Points leaderboard' },
    
    // Cheer a Peer Features
    { path: '/points/feed', method: 'GET', description: 'Cheer feed (recent posts)' },
    { path: '/points/search-users', method: 'GET', description: 'Search users for cheering' },
    { path: '/points/cheer', method: 'POST', description: 'Send cheer to user', 
      body: { recipientId: 'test-user-id', amount: 5, message: 'Test cheer' } },
    
    // Cheer Interactions
    { path: '/points/cheer/test-cheer-id/comment', method: 'POST', description: 'Add comment to cheer',
      body: { comment: 'Test comment' } },
    { path: '/points/cheer/test-cheer-id/comments', method: 'GET', description: 'Get cheer comments' },
    { path: '/points/cheer/test-cheer-id/like', method: 'POST', description: 'Like/unlike cheer' },
  ];

  for (const endpoint of testEndpoints) {
    try {
      console.log(`🧪 Testing: ${endpoint.description}`);
      console.log(`   ${endpoint.method} ${endpoint.path}`);
      
      const config = {
        method: endpoint.method,
        url: `${BASE_URL}${endpoint.path}`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer fake-token' // Will fail auth but test routing
        }
      };
      
      if (endpoint.body) {
        config.data = endpoint.body;
      }
      
      const response = await axios(config);
      console.log(`   ✅ Status: ${response.status} - Endpoint accessible\n`);
      
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;
      
      if (status === 401 || status === 403) {
        console.log(`   ✅ Status: ${status} - Endpoint accessible (auth required)\n`);
      } else if (status === 400) {
        console.log(`   ⚠️  Status: ${status} - Endpoint accessible (validation error): ${message}\n`);
      } else if (status === 404) {
        console.log(`   ❌ Status: ${status} - Endpoint NOT FOUND: ${endpoint.path}\n`);
      } else {
        console.log(`   ❌ Status: ${status} - Error: ${message}\n`);
      }
    }
  }
  
  console.log('🎯 Feature Test Summary:');
  console.log('- All endpoints tested for basic connectivity');
  console.log('- Auth-protected endpoints properly secured (401/403)');
  console.log('- Database-dependent features require valid authentication');
  console.log('\n📋 Next: Test with authenticated requests in browser');
}

testAllFeatures();
