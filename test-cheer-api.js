#!/usr/bin/env node

// Test script to verify all cheer API endpoints
import http from 'http';

const baseUrl = 'http://localhost:7432';
const testUser = { email: 'melbraei.santiago@fullsuite.ph', password: 'password' };
let accessToken = '';

async function loginAndGetToken() {
  return new Promise((resolve) => {
    const loginData = JSON.stringify({ email: testUser.email, password: testUser.password });
    const options = {
      hostname: 'localhost',
      port: 7432,
      path: '/api/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log(`Login status: ${res.statusCode}`);
        console.log(`Login response: ${data}`);
        try {
          const json = JSON.parse(data);
          if (json && json.accessToken) {
            accessToken = json.accessToken;
            console.log('✅ Access token obtained.');
          } else {
            console.error('❌ No accessToken in login response.');
          }
        } catch (e) {
          console.error('❌ Failed to parse login response as JSON.');
        }
        resolve();
      });
    });
    req.on('error', (err) => { console.error('Login error:', err.message); resolve(); });
    req.write(loginData);
    req.end();
  });
}

// Test all cheer endpoints
const endpoints = [
  { path: '/api/points/cheer/stats/1', method: 'GET', description: 'Cheer stats for user 1' },
  { path: '/api/points/cheer/received/1', method: 'GET', description: 'Received cheers for user 1' },
  { path: '/api/points/cheer/leaderboard', method: 'GET', description: 'Cheer leaderboard' },
  { path: '/api/points/cheer/feed', method: 'GET', description: 'Cheer feed' },
  // Date filtering tests
  { path: '/api/points/cheer/feed?from=2025-07-01', method: 'GET', description: 'Cheer feed from 2025-07-01' },
  { path: '/api/points/cheer/feed?to=2025-07-05', method: 'GET', description: 'Cheer feed to 2025-07-05' },
  { path: '/api/points/cheer/feed?from=2025-07-01&to=2025-07-05', method: 'GET', description: 'Cheer feed from 2025-07-01 to 2025-07-05' },
  { path: '/api/points/search/users?query=j', method: 'GET', description: 'User search' },
];

async function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const url = new URL(baseUrl + endpoint.path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    if (accessToken) options.headers['Authorization'] = `Bearer ${accessToken}`;
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log(`\n📍 ${endpoint.description}`);
        console.log(`   ${endpoint.method} ${endpoint.path}`);
        console.log(`   Status: ${res.statusCode}`);
        try {
          const jsonData = JSON.parse(data);
          console.log(`   Response: ${JSON.stringify(jsonData, null, 2).substring(0, 200)}...`);
        } catch (e) {
          console.log(`   Response: ${data.substring(0, 200)}...`);
        }
        resolve({ endpoint, status: res.statusCode, data });
      });
    });
    req.on('error', (err) => {
      console.log(`\n❌ ${endpoint.description}`);
      console.log(`   Error: ${err.message}`);
      resolve({ endpoint, error: err.message });
    });
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Logging in as test user...');
  await loginAndGetToken();
  if (!accessToken) {
    console.error('❌ Login failed. Cannot test authenticated endpoints.');
    process.exit(1);
  }
  console.log('🚀 Testing Cheer API Endpoints...\n');
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between requests
  }
  console.log('\n✅ API testing complete!');
}

runTests().catch(console.error);
