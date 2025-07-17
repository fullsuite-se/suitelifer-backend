import { Points } from './src/models/pointsModel.js';
import { v7 as uuidv7 } from 'uuid';

async function testFullCheerProcess() {
  console.log('🎯 Testing Full Cheer Process...\n');
  
  try {
    // Test user IDs
    const senderId = '019614eb-5acf-700e-a7f3-295b59219714'; // MB Santiago
    const recipientId = '01963893-fb5f-73bc-8291-01a4cd400dca'; // Hernani Domingo
    const cheerAmount = 5;
    
    console.log('📊 BEFORE CHEER TRANSACTION');
    console.log('================================');
    
    // Get initial state
    const senderBefore = await Points.getUserPoints(senderId);
    let recipientBefore = await Points.getUserPoints(recipientId);
    
    if (!recipientBefore) {
      console.log('Creating points record for recipient...');
      recipientBefore = await Points.createUserPoints(recipientId);
    }
    
    console.log(`Sender (${senderId}):`);
    console.log(`  - Available Points: ${senderBefore.availablePoints}`);
    console.log(`  - Heartbits Used: ${senderBefore.monthlyHeartbitsUsed}/${senderBefore.monthlyHeartbits}`);
    console.log(`  - Heartbits Remaining: ${senderBefore.monthlyHeartbits - senderBefore.monthlyHeartbitsUsed}`);
    
    console.log(`Recipient (${recipientId}):`);
    console.log(`  - Available Points: ${recipientBefore.availablePoints}`);
    console.log(`  - Total Earned: ${recipientBefore.totalEarned}`);
    
    // Check if sender can send heartbits
    const canSend = await Points.canSendHeartbits(senderId, cheerAmount);
    if (!canSend) {
      console.log(`❌ Cannot send ${cheerAmount} heartbits - insufficient remaining.`);
      return;
    }
    
    console.log(`\n✅ Sender can send ${cheerAmount} heartbits`);
    
    // Perform the cheer transaction
    console.log(`\n🚀 PERFORMING CHEER TRANSACTION`);
    console.log('=====================================');
    console.log(`Sending ${cheerAmount} heartbits from sender to recipient...`);
    
    // Use heartbits from sender
    await Points.useHeartbits(senderId, cheerAmount);
    console.log(`✅ Deducted ${cheerAmount} heartbits from sender`);
    
    // Add points to recipient
    await Points.addPointsFromCheer(recipientId, cheerAmount);
    console.log(`✅ Added ${cheerAmount} points to recipient`);
    
    // Create transaction records (simulated)
    const transactionId = uuidv7();
    const cheerId = uuidv7();
    
    await Points.createTransaction({
      transaction_id: transactionId,
      from_user_id: senderId,
      to_user_id: recipientId,
      type: "given",
      amount: cheerAmount,
      description: `Cheered ${cheerAmount} heartbits`,
      message: "Test cheer message",
      metadata: JSON.stringify({ cheer_id: cheerId, type: "cheer" })
    });
    
    await Points.createTransaction({
      transaction_id: uuidv7(),
      from_user_id: senderId,
      to_user_id: recipientId,
      type: "received",
      amount: cheerAmount,
      description: `Received ${cheerAmount} points from cheer`,
      message: "Test cheer message",
      metadata: JSON.stringify({ cheer_id: cheerId, type: "cheer" })
    });
    
    console.log(`✅ Created transaction records`);
    
    // Get final state
    console.log(`\n📊 AFTER CHEER TRANSACTION`);
    console.log('===============================');
    
    const senderAfter = await Points.getUserPoints(senderId);
    const recipientAfter = await Points.getUserPoints(recipientId);
    
    console.log(`Sender (${senderId}):`);
    console.log(`  - Available Points: ${senderAfter.availablePoints} (changed: ${senderAfter.availablePoints - senderBefore.availablePoints})`);
    console.log(`  - Heartbits Used: ${senderAfter.monthlyHeartbitsUsed}/${senderAfter.monthlyHeartbits} (used: +${senderAfter.monthlyHeartbitsUsed - senderBefore.monthlyHeartbitsUsed})`);
    console.log(`  - Heartbits Remaining: ${senderAfter.monthlyHeartbits - senderAfter.monthlyHeartbitsUsed}`);
    
    console.log(`Recipient (${recipientId}):`);
    console.log(`  - Available Points: ${recipientAfter.availablePoints} (gained: +${recipientAfter.availablePoints - recipientBefore.availablePoints})`);
    console.log(`  - Total Earned: ${recipientAfter.totalEarned} (gained: +${recipientAfter.totalEarned - recipientBefore.totalEarned})`);
    
    // Verify the transaction worked correctly
    console.log(`\n🔍 VERIFICATION`);
    console.log('=================');
    
    const heartbitsUsedCorrectly = (senderAfter.monthlyHeartbitsUsed - senderBefore.monthlyHeartbitsUsed) === cheerAmount;
    const pointsReceivedCorrectly = (recipientAfter.availablePoints - recipientBefore.availablePoints) === cheerAmount;
    const totalEarnedUpdated = (recipientAfter.totalEarned - recipientBefore.totalEarned) === cheerAmount;
    
    console.log(`✅ Heartbits deducted correctly: ${heartbitsUsedCorrectly}`);
    console.log(`✅ Points added to recipient: ${pointsReceivedCorrectly}`);
    console.log(`✅ Total earned updated: ${totalEarnedUpdated}`);
    
    if (heartbitsUsedCorrectly && pointsReceivedCorrectly && totalEarnedUpdated) {
      console.log(`\n🎉 CHEER TRANSACTION SUCCESSFUL!`);
      console.log(`Heartbits system is working perfectly! 💖`);
    } else {
      console.log(`\n❌ CHEER TRANSACTION FAILED!`);
      console.log(`There seems to be an issue with the heartbits system.`);
    }
    
  } catch (error) {
    console.error('❌ Error testing full cheer process:', error);
  } finally {
    process.exit(0);
  }
}

testFullCheerProcess();
