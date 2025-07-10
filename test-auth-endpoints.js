#!/usr/bin/env node

/**
 * Authentication Test Script
 * Tests if authentication and login endpoints are working
 */

const API_BASE = 'http://localhost:7432/api';

async function testAuthEndpoints() {
  console.log('🔐 AUTHENTICATION ENDPOINTS TEST');
  console.log('===================================\n');

  try {
    // Test 1: Check if auth routes exist
    console.log('1️⃣ Testing auth endpoints...');
    
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'wrong'
      })
    });
    
    const loginData = await loginResponse.text();
    console.log(`   Login endpoint status: ${loginResponse.status}`);
    console.log(`   Response: ${loginData.substring(0, 100)}...`);

    // Test 2: Check available auth routes
    console.log('\n2️⃣ Checking common auth routes...');
    
    const authRoutes = [
      '/auth/login',
      '/auth/register', 
      '/auth/me',
      '/auth/logout'
    ];

    for (const route of authRoutes) {
      try {
        const response = await fetch(`${API_BASE}${route}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        console.log(`   ${route}: ${response.status} ${response.statusText}`);
      } catch (error) {
        console.log(`   ${route}: ERROR - ${error.message}`);
      }
    }

    console.log('\n✅ AUTHENTICATION TEST COMPLETED');
    console.log('💡 RECOMMENDATIONS:');
    console.log('   1. Use a valid user account to log in');
    console.log('   2. Available users: test@fullsuite.ph, melbraei.santiago@fullsuite.ph');
    console.log('   3. Once logged in, the Points Dashboard should work correctly');

  } catch (error) {
    console.error('❌ AUTH TEST FAILED:', error.message);
  }
}

testAuthEndpoints();
