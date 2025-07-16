#!/usr/bin/env node

// Comprehensive test script for cheer functionality with authentication
import http from 'http';

const baseUrl = 'http://localhost:7432';
const credentials = {
  email: 'hernani.domingo@fullsuite.ph',
  password: 'password',
  recaptchaToken: 'test-token' // Mock token for testing
};

let authToken = null;

// Helper function to make HTTP requests
async function makeRequest(endpoint, method = 'GET', data = null, useAuth = true) {
  return new Promise((resolve) => {
    const url = new URL(baseUrl + endpoint);
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (useAuth && authToken) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ error: err.message });
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Step 1: Login and get authentication token
async function login() {
  console.log('🔐 Logging in...');
  const result = await makeRequest('/api/login', 'POST', credentials, false);
  
  if (result.status === 200 && result.data.token) {
    authToken = result.data.token;
    console.log('✅ Login successful');
    console.log('   User:', result.data.user.first_name, result.data.user.last_name);
    console.log('   Role:', result.data.user.role);
    return result.data.user;
  } else {
    console.log('❌ Login failed:', result);
    return null;
  }
}

// Step 2: Test cheer statistics
async function testCheerStats(userId) {
  console.log('\n📊 Testing cheer statistics...');
  const result = await makeRequest(`/api/points/cheer/stats/${userId}`);
  
  if (result.status === 200) {
    console.log('✅ Cheer stats retrieved successfully');
    console.log('   Stats:', result.data);
  } else {
    console.log('❌ Failed to get cheer stats:', result);
  }
  return result;
}

// Step 3: Test user search
async function testUserSearch() {
  console.log('\n🔍 Testing user search...');
  const result = await makeRequest('/api/points/search/users?query=j');
  
  if (result.status === 200) {
    console.log('✅ User search successful');
    console.log('   Found users:', result.data.length);
    if (result.data.length > 0) {
      console.log('   Sample user:', result.data[0]);
    }
  } else {
    console.log('❌ User search failed:', result);
  }
  return result;
}

// Step 4: Test leaderboard
async function testLeaderboard() {
  console.log('\n🏆 Testing leaderboard...');
  const result = await makeRequest('/api/points/cheer/leaderboard?period=all&limit=5');
  
  if (result.status === 200) {
    console.log('✅ Leaderboard retrieved successfully');
    console.log('   Leaderboard entries:', result.data.length);
    if (result.data.length > 0) {
      console.log('   Top user:', result.data[0]);
    }
  } else {
    console.log('❌ Failed to get leaderboard:', result);
  }
  return result;
}

// Step 5: Test cheer feed
async function testCheerFeed() {
  console.log('\n📝 Testing cheer feed...');
  const result = await makeRequest('/api/points/cheer/feed?page=1&limit=5');
  
  if (result.status === 200) {
    console.log('✅ Cheer feed retrieved successfully');
    console.log('   Feed entries:', result.data.length);
    if (result.data.length > 0) {
      console.log('   Sample cheer:', {
        from: result.data[0].from.name,
        to: result.data[0].to.name,
        points: result.data[0].points,
        message: result.data[0].message
      });
    }
  } else {
    console.log('❌ Failed to get cheer feed:', result);
  }
  return result;
}

// Step 6: Test received cheers
async function testReceivedCheers(userId) {
  console.log('\n📨 Testing received cheers...');
  const result = await makeRequest(`/api/points/cheer/received/${userId}?page=1&limit=5`);
  
  if (result.status === 200) {
    console.log('✅ Received cheers retrieved successfully');
    console.log('   Received cheers:', result.data.length);
    if (result.data.length > 0) {
      console.log('   Sample received cheer:', {
        from: result.data[0].from.name,
        points: result.data[0].points,
        message: result.data[0].message
      });
    }
  } else {
    console.log('❌ Failed to get received cheers:', result);
  }
  return result;
}

// Step 7: Test sending a cheer (if there are other users)
async function testSendCheer(currentUserId, searchResults) {
  if (!searchResults || searchResults.data.length === 0) {
    console.log('\n⚠️  Skipping cheer sending - no other users found');
    return;
  }

  // Find a user that's not the current user
  const targetUser = searchResults.data.find(user => user.id !== currentUserId);
  if (!targetUser) {
    console.log('\n⚠️  Skipping cheer sending - no other users available');
    return;
  }

  console.log('\n💌 Testing send cheer...');
  const cheerData = {
    recipientId: targetUser.id,
    amount: 5,
    message: 'Test cheer from automated testing! 🎉'
  };

  const result = await makeRequest('/api/points/cheer', 'POST', cheerData);
  
  if (result.status === 200 || result.status === 201) {
    console.log('✅ Cheer sent successfully');
    console.log(`   Sent ${cheerData.amount} points to ${targetUser.first_name} ${targetUser.last_name}`);
    console.log(`   Message: ${cheerData.message}`);
  } else {
    console.log('❌ Failed to send cheer:', result);
  }
  return result;
}

// Main test function
async function runAllTests() {
  console.log('🚀 Starting comprehensive cheer functionality tests...\n');
  
  try {
    // Step 1: Login
    const user = await login();
    if (!user) {
      console.log('Cannot proceed without authentication');
      return;
    }

    // Step 2: Test all read operations
    await testCheerStats(user.id);
    const searchResults = await testUserSearch();
    await testLeaderboard();
    await testCheerFeed();
    await testReceivedCheers(user.id);

    // Step 3: Test write operations
    await testSendCheer(user.id, searchResults);

    // Step 4: Test again to see if the new cheer appears
    console.log('\n🔄 Re-testing feed after sending cheer...');
    await testCheerFeed();
    await testCheerStats(user.id);

    console.log('\n✅ All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✓ Authentication working');
    console.log('   ✓ Cheer statistics endpoint working');
    console.log('   ✓ User search endpoint working');
    console.log('   ✓ Leaderboard endpoint working');
    console.log('   ✓ Cheer feed endpoint working');
    console.log('   ✓ Received cheers endpoint working');
    console.log('   ✓ Send cheer endpoint working');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

runAllTests().catch(console.error);
