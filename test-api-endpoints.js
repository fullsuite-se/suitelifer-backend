#!/usr/bin/env node

/**
 * Quick API Endpoint Test
 * Tests the points and cheer endpoints to verify they're working
 */

const API_BASE = 'http://localhost:7432/api';

// Simple test without authentication (will get 401, but endpoint should respond)
async function testEndpoint(endpoint, method = 'GET', body = null) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : null
    });
    
    const data = await response.text();
    console.log(`${method} ${endpoint}:`);
    console.log(`  Status: ${response.status}`);
    console.log(`  Response: ${data.substring(0, 100)}...`);
    console.log('');
    
    return { status: response.status, data };
  } catch (error) {
    console.log(`${method} ${endpoint}: ERROR - ${error.message}`);
    console.log('');
    return { error: error.message };
  }
}

async function runTests() {
  console.log('=== API Endpoint Tests ===\n');
  
  // Test points endpoints
  await testEndpoint('/points/balance');
  await testEndpoint('/points/transactions');
  await testEndpoint('/points/cheer', 'POST', { recipientId: 'test', amount: 5, message: 'test' });
  
  // Test users endpoint
  await testEndpoint('/points/users');
  
  console.log('=== Tests Complete ===');
  console.log('Note: 401/403 errors are expected without authentication.');
  console.log('If you see 404 errors, there may be routing issues.');
}

runTests().catch(console.error);
