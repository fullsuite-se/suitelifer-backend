// Test to simulate the exact frontend request
console.log('Simulating frontend cheer request...');

// This is exactly what the frontend CheerPage.jsx sends:
const frontendPayload = {
  recipientId: 'test-user-123',
  amount: 1, // This should be what you set in the frontend
  message: 'Test message from frontend simulation'
};

console.log('Frontend would send this payload:');
console.log(JSON.stringify(frontendPayload, null, 2));

// Test the backend logic locally
console.log('\nTesting backend parameter extraction logic:');

function testCheerLogic(requestBody) {
  const { to_user_id, recipientId, points, amount, message } = requestBody;
  
  console.log('=== SIMULATED BACKEND LOGIC ===');
  console.log('Full request body:', JSON.stringify(requestBody, null, 2));
  console.log('Extracted values:');
  console.log('  - to_user_id:', to_user_id);
  console.log('  - recipientId:', recipientId);
  console.log('  - points:', points, '(type:', typeof points, ')');
  console.log('  - amount:', amount, '(type:', typeof amount, ')');
  console.log('  - message:', message);
  
  // This is the FIXED logic from the backend
  let heartbitsToSend;
  if (amount !== undefined && amount !== null && amount !== '') {
    heartbitsToSend = parseInt(amount, 10);
    console.log('✅ Using amount parameter:', amount, '-> parsed:', heartbitsToSend);
  } else if (points !== undefined && points !== null && points !== '') {
    heartbitsToSend = parseInt(points, 10);
    console.log('✅ Using points parameter:', points, '-> parsed:', heartbitsToSend);
  } else {
    heartbitsToSend = 10; // Default fallback
    console.log('⚠️  Using default fallback: 10');
  }
  
  console.log('FINAL heartbitsToSend:', heartbitsToSend);
  console.log('=== END SIMULATION ===\n');
  
  return heartbitsToSend;
}

// Test the frontend payload
const result = testCheerLogic(frontendPayload);
console.log(`Result: Should send ${result} heartbits (expected: 1)`);

// Test edge cases
console.log('\n--- Testing Edge Cases ---');

console.log('\n1. Amount as string "5":');
testCheerLogic({ recipientId: 'user', amount: "5", message: 'test' });

console.log('\n2. Amount as 0:');
testCheerLogic({ recipientId: 'user', amount: 0, message: 'test' });

console.log('\n3. Points parameter instead:');
testCheerLogic({ recipientId: 'user', points: 15, message: 'test' });

console.log('\n4. Both amount and points (amount should win):');
testCheerLogic({ recipientId: 'user', amount: 25, points: 15, message: 'test' });

console.log('\n5. No amount specified:');
testCheerLogic({ recipientId: 'user', message: 'test' });
