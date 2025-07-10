import { db } from "./src/config/db.js";

async function checkUsers() {
  try {
    console.log("🔍 Checking existing users in the database...\n");
    
    // Check the structure of sl_user_accounts table
    const tableStructure = await db.raw("DESCRIBE sl_user_accounts");
    console.log("📋 sl_user_accounts table structure:");
    tableStructure[0].forEach(column => {
      console.log(`   - ${column.Field} (${column.Type}) ${column.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    console.log("");
    
    // Get users with available columns
    const users = await db("sl_user_accounts")
      .select("*")
      .limit(10);

    console.log(`📊 Found ${users.length} users:\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.first_name} ${user.last_name}`);
      console.log(`   User ID: ${user.user_id}`);
      console.log(`   Email: ${user.user_email || 'No email field'}`);
      console.log(`   Active: ${user.is_active ? 'Yes' : 'No'}`);
      console.log(`   Created: ${user.created_at}`);
      console.log("   ---");
    });

    // Check points table
    try {
      const pointsRecords = await db("sl_user_points").count("* as count").first();
      console.log(`\n💰 Points records in database: ${pointsRecords.count}`);
      
      if (pointsRecords.count > 0) {
        const samplePoints = await db("sl_user_points").limit(3);
        console.log("Sample points records:");
        samplePoints.forEach(point => {
          console.log(`   User ${point.user_id}: ${point.available_points} available, ${point.total_earned} earned`);
        });
      }
    } catch (error) {
      console.log(`💰 Points table error: ${error.message}`);
    }
    
    // Check transactions
    try {
      const transactionRecords = await db("sl_transactions").count("* as count").first();
      console.log(`\n📈 Transaction records in database: ${transactionRecords.count}`);
    } catch (error) {
      console.log(`📈 Transactions table error: ${error.message}`);
    }
    
    // Check cheers
    try {
      const cheerRecords = await db("sl_cheers").count("* as count").first();
      console.log(`❤️ Cheer records in database: ${cheerRecords.count}`);
    } catch (error) {
      console.log(`❤️ Cheers table error: ${error.message}`);
    }
    
  } catch (error) {
    console.error("❌ Error checking users:", error);
  } finally {
    process.exit(0);
  }
}

checkUsers();
