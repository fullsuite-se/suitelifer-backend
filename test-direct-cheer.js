import axios from 'axios';

async function testCheerEndpoint() {
  try {
    console.log('Testing cheer endpoint directly...');
    
    const testPayload = {
      recipientId: 'test-user-123',
      amount: 1,
      message: 'Direct test - should show 1 heartbit'
    };
    
    console.log('Sending payload:', JSON.stringify(testPayload, null, 2));
    
    const response = await axios.post('http://localhost:7432/api/points/cheer', testPayload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fake-token' // Will fail auth but should show our debug logs
      }
    });
    
    console.log('Response:', response.data);
    
  } catch (error) {
    console.log('Expected error (auth):', error.response?.status, error.response?.data?.message);
    console.log('The important thing is that our backend debug logs should show up in the backend terminal');
  }
}

testCheerEndpoint();
