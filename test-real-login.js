const testRealLogin = async () => {
  console.log('=== Testing Login with Real User ===');
  
  try {
    // Test with a verified user (using a generic test - won't use real password)
    console.log('\n1. Testing login endpoint behavior...');
    const loginResponse = await fetch('http://localhost:7432/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: 'test@fullsuite.ph', // This is unverified, should get specific error
        password: 'wrongpassword'
      })
    });
    
    console.log('Login status:', loginResponse.status);
    const loginData = await loginResponse.text();
    console.log('Login response:', loginData);

    // Test 2: Try with a verified user but wrong password
    console.log('\n2. Testing with verified user, wrong password...');
    const verifiedLoginResponse = await fetch('http://localhost:7432/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: 'hernani.domingo@fullsuite.ph', // This is verified
        password: 'wrongpassword'
      })
    });
    
    console.log('Verified user login status:', verifiedLoginResponse.status);
    const verifiedLoginData = await verifiedLoginResponse.text();
    console.log('Verified user login response:', verifiedLoginData);

    // Test 3: Test if cookies are set correctly during successful authentication
    console.log('\n3. Checking cookie headers...');
    console.log('Login response cookies:', loginResponse.headers.get('set-cookie'));
    console.log('Verified login response cookies:', verifiedLoginResponse.headers.get('set-cookie'));

    // Test 4: Test user-info endpoint behavior
    console.log('\n4. Testing user-info without authentication...');
    const userInfoResponse = await fetch('http://localhost:7432/api/user-info', {
      method: 'GET',
      credentials: 'include'
    });
    
    console.log('User-info status:', userInfoResponse.status);
    const userInfoData = await userInfoResponse.text();
    console.log('User-info response:', userInfoData);

  } catch (error) {
    console.error('Test error:', error.message);
  }
};

testRealLogin();
