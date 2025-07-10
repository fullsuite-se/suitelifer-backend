const testAuthWithValidUser = async () => {
  console.log('=== Authentication Test with Valid User ===');
  
  try {
    // First, let's see what happens with login
    console.log('\n1. Testing login with email/password (will use a test user)...');
    
    // Let's check if we can get some user from the database to test with
    console.log('\n2. Testing send verification link to see if it gives better error...');
    const verifyResponse = await fetch('http://localhost:7432/api/send-account-verification-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        userId: 'test-user-id',
        email: 'test@example.com'
      })
    });
    
    console.log('Verify status:', verifyResponse.status);
    const verifyData = await verifyResponse.text();
    console.log('Verify response:', verifyData);

    // Test CORS preflight
    console.log('\n3. Testing CORS preflight...');
    const corsResponse = await fetch('http://localhost:7432/api/user-info', {
      method: 'OPTIONS',
    });
    
    console.log('CORS status:', corsResponse.status);
    console.log('CORS headers:', Object.fromEntries(corsResponse.headers.entries()));

  } catch (error) {
    console.error('Test error:', error.message);
  }
};

// Run the test
testAuthWithValidUser();
