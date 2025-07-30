import { db } from "./src/config/db.js";

const debugNotifications = async () => {
  try {
    console.log("🔍 Debugging notification system...");
    
    // Check all transactions in the database
    const allTransactions = await db("sl_transactions").select("*").orderBy("created_at", "desc").limit(10);
    console.log("📊 Recent transactions:", allTransactions.length);
    
    // Check for moderation transactions specifically
    const moderationTransactions = await db("sl_transactions")
      .where("type", "moderation")
      .select("*")
      .orderBy("created_at", "desc");
    
    console.log("🔔 Moderation transactions found:", moderationTransactions.length);
    if (moderationTransactions.length > 0) {
      console.log("📝 Latest moderation transaction:", moderationTransactions[0]);
    }
    
    // Check for any transactions with moderation in the message
    const moderationInMessage = await db("sl_transactions")
      .where("message", "like", "%moderated%")
      .orWhere("message", "like", "%hidden%")
      .orWhere("message", "like", "%deleted%")
      .select("*")
      .orderBy("created_at", "desc");
    
    console.log("📨 Transactions with moderation in message:", moderationInMessage.length);
    if (moderationInMessage.length > 0) {
      console.log("📝 Latest message transaction:", moderationInMessage[0]);
    }
    
    // Check the cheer posts table for moderation status
    const moderatedPosts = await db("sl_cheers")
      .where("is_hidden", true)
      .orWhereNotNull("moderation_reason")
      .select("*")
      .orderBy("created_at", "desc");
    
    console.log("🚫 Moderated posts found:", moderatedPosts.length);
    if (moderatedPosts.length > 0) {
      console.log("📝 Latest moderated post:", moderatedPosts[0]);
    }
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

debugNotifications(); 