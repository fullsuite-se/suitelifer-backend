const testAuth = async () => {
  console.log('=== Authentication Diagnostics ===');
  
  try {
    // Test 1: Check if login endpoint responds with valid user
    console.log('\n1. Testing login endpoint with valid user...');
    const loginResponse = await fetch('http://localhost:7432/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: 'francis@fullsuite.ph', // Real user from database
        password: 'password'
      })
    });
    
    console.log('Login status:', loginResponse.status);
    const loginData = await loginResponse.text();
    console.log('Login response:', loginData);

    // Extract cookies from the response
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('Cookies set:', cookies);

    // Test 2: Check if user-info endpoint works with valid login cookies
    console.log('\n2. Testing user-info endpoint with login cookies...');
    const userInfoResponse = await fetch('http://localhost:7432/api/user-info', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Cookie': cookies || ''
      }
    });
    
    console.log('User-info status:', userInfoResponse.status);
    const userInfoData = await userInfoResponse.text();
    console.log('User-info response:', userInfoData);

    // Test 3: Test send verification with real user (should work)
    console.log('\n3. Testing send-account-verification-link with real user...');
    const verificationResponse = await fetch('http://localhost:7432/api/send-account-verification-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        userId: 'f7c8f8e8-8c68-4b72-8e93-4f8c8c8c8c8c', // This will still fail but with proper error
        email: 'francis@fullsuite.ph'
      })
    });
    
    console.log('Verification status:', verificationResponse.status);
    const verificationData = await verificationResponse.text();
    console.log('Verification response:', verificationData);

  } catch (error) {
    console.error('Test error:', error.message);
  }
};

// Run the test
testAuth();
