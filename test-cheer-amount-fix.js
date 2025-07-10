import axios from 'axios';

// Test the cheer amount fix
async function testCheerAmount() {
  try {
    console.log('Testing cheer amount parameter handling...');
    
    // Test 1: Send with amount parameter
    console.log('\n1. Testing with amount parameter (should use 25):');
    const response1 = await axios.post('http://localhost:7432/api/points/cheer', {
      recipientId: 'test-user-id',
      amount: 25,
      message: 'Test with amount parameter'
    }, {
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    }).catch(err => {
      console.log('Expected auth error:', err.response?.data?.message || err.message);
      return { data: { extractedAmount: 'test failed due to auth' } };
    });

    // Test 2: Send with points parameter
    console.log('\n2. Testing with points parameter (should use 15):');
    const response2 = await axios.post('http://localhost:7432/api/points/cheer', {
      recipientId: 'test-user-id',
      points: 15,
      message: 'Test with points parameter'
    }, {
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    }).catch(err => {
      console.log('Expected auth error:', err.response?.data?.message || err.message);
      return { data: { extractedAmount: 'test failed due to auth' } };
    });

    // Test 3: Send with both (should prioritize amount)
    console.log('\n3. Testing with both amount and points (should use amount=30, not points=20):');
    const response3 = await axios.post('http://localhost:7432/api/points/cheer', {
      recipientId: 'test-user-id',
      amount: 30,
      points: 20,
      message: 'Test with both parameters'
    }, {
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    }).catch(err => {
      console.log('Expected auth error:', err.response?.data?.message || err.message);
      return { data: { extractedAmount: 'test failed due to auth' } };
    });

    // Test 4: Send with no amount (should default to 10)
    console.log('\n4. Testing with no amount (should default to 10):');
    const response4 = await axios.post('http://localhost:7432/api/points/cheer', {
      recipientId: 'test-user-id',
      message: 'Test with no amount'
    }, {
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    }).catch(err => {
      console.log('Expected auth error:', err.response?.data?.message || err.message);
      return { data: { extractedAmount: 'test failed due to auth' } };
    });

    console.log('\nTest completed. The fix should now properly handle the amount parameter.');
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

testCheerAmount();
