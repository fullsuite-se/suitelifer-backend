import { db } from "./src/config/db.js";

const debugTransactionHistory = async () => {
  try {
    console.log("🔍 Debugging transaction history...");
    
    // Get a test user ID
    const testUser = await db("sl_user_accounts").select("user_id").first();
    if (!testUser) {
      console.log("❌ No users found");
      return;
    }
    
    const userId = testUser.user_id;
    console.log("👤 Using user ID:", userId);
    
    // Check all transactions for this user (unfiltered)
    const allTransactions = await db("sl_transactions")
      .where("from_user_id", userId)
      .orWhere("to_user_id", userId)
      .orderBy("created_at", "desc");
    
    console.log("📊 Total transactions for user:", allTransactions.length);
    console.log("📋 Transaction types found:", [...new Set(allTransactions.map(t => t.type))]);
    
    // Check what the getUserTransactions function returns
    const filteredTransactions = await db("sl_transactions")
      .select(
        "sl_transactions.transaction_id AS transactionId",
        "sl_transactions.from_user_id AS fromUserId",
        "sl_transactions.to_user_id AS toUserId", 
        "sl_transactions.type",
        "sl_transactions.amount",
        "sl_transactions.description",
        "sl_transactions.message",
        "sl_transactions.metadata",
        "sl_transactions.created_at AS createdAt"
      )
      .leftJoin('sl_user_accounts as from_user', 'sl_transactions.from_user_id', 'from_user.user_id')
      .leftJoin('sl_user_accounts as to_user', 'sl_transactions.to_user_id', 'to_user.user_id')
      .where(function() {
        this.where(function() {
          this.where("sl_transactions.from_user_id", userId)
              .whereIn("sl_transactions.type", ["given", "purchase", "admin_deduct"]);
        }).orWhere(function() {
          this.where("sl_transactions.to_user_id", userId)
              .whereIn("sl_transactions.type", ["received", "admin_grant", "admin_added", "moderation"]);
        });
      })
      .orderBy("sl_transactions.created_at", "desc")
      .limit(10);
    
    console.log("🔍 Filtered transactions returned:", filteredTransactions.length);
    console.log("📋 Filtered transaction types:", [...new Set(filteredTransactions.map(t => t.type))]);
    
    // Check for missing transaction types
    const allTypes = [...new Set(allTransactions.map(t => t.type))];
    const filteredTypes = [...new Set(filteredTransactions.map(t => t.type))];
    const missingTypes = allTypes.filter(type => !filteredTypes.includes(type));
    
    if (missingTypes.length > 0) {
      console.log("❌ Missing transaction types:", missingTypes);
      
      // Show examples of missing transactions
      for (const missingType of missingTypes) {
        const examples = allTransactions.filter(t => t.type === missingType).slice(0, 3);
        console.log(`📝 Examples of '${missingType}' transactions:`, examples);
      }
    } else {
      console.log("✅ All transaction types are being returned");
    }
    
    // Check transaction count vs actual count
    const actualCount = allTransactions.length;
    const filteredCount = await db("sl_transactions")
      .where(function() {
        this.where(function() {
          this.where("from_user_id", userId)
              .whereIn("type", ["given", "purchase", "admin_deduct"]);
        }).orWhere(function() {
          this.where("to_user_id", userId)
              .whereIn("type", ["received", "admin_grant", "admin_added", "moderation"]);
        });
      })
      .count("* as count");
    
    console.log("📊 Actual transaction count:", actualCount);
    console.log("📊 Filtered transaction count:", filteredCount[0].count);
    console.log("📊 Difference:", actualCount - filteredCount[0].count);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

debugTransactionHistory(); 