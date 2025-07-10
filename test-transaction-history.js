import { db } from './src/config/db.js';

async function testTransactionHistory() {
  try {
    console.log('🔍 Testing transaction history query...');
    
    // First, let's see what users exist
    const users = await db('sl_user_accounts').select('user_id', 'first_name', 'last_name').limit(3);
    console.log('Available users:', users);
    
    if (users.length > 0) {
      const testUserId = users[0].user_id;
      console.log(`\nTesting for user: ${users[0].first_name} ${users[0].last_name} (${testUserId})`);
      
      // Test the enhanced query
      const transactions = await db('sl_transactions')
        .select(
          "sl_transactions.transaction_id AS transactionId",
          "sl_transactions.from_user_id AS fromUserId",
          "sl_transactions.to_user_id AS toUserId", 
          "sl_transactions.type",
          "sl_transactions.amount",
          "sl_transactions.description",
          "sl_transactions.message",
          "sl_transactions.metadata",
          "sl_transactions.created_at AS createdAt",
          // Join to get the "other" user's name
          db.raw(`
            CASE 
              WHEN sl_transactions.from_user_id = ? THEN 
                CONCAT(to_user.first_name, ' ', to_user.last_name)
              ELSE 
                CONCAT(from_user.first_name, ' ', from_user.last_name)
            END AS related_user
          `, [testUserId])
        )
        .leftJoin('sl_user_accounts as from_user', 'sl_transactions.from_user_id', 'from_user.user_id')
        .leftJoin('sl_user_accounts as to_user', 'sl_transactions.to_user_id', 'to_user.user_id')
        .where(function() {
          this.where("sl_transactions.from_user_id", testUserId)
              .orWhere("sl_transactions.to_user_id", testUserId);
        })
        .orderBy("sl_transactions.created_at", "desc")
        .limit(5);
      
      console.log('\nTransaction results:');
      transactions.forEach((tx, index) => {
        console.log(`${index + 1}. ${tx.type} - ${tx.amount} pts`);
        console.log(`   Description: ${tx.description}`);
        console.log(`   Related user: ${tx.related_user || 'None'}`);
        console.log(`   Date: ${tx.createdAt}`);
        console.log('');
      });
      
      if (transactions.length === 0) {
        console.log('No transactions found for this user.');
        
        // Check if there are any transactions at all
        const allTransactions = await db('sl_transactions').count('* as count').first();
        console.log(`Total transactions in database: ${allTransactions.count}`);
      }
    }
    
    await db.destroy();
    
  } catch (error) {
    console.error('❌ Error testing transaction history:', error.message);
    console.error('Full error:', error);
  }
}

testTransactionHistory();
