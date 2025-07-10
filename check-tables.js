import { db } from "./src/config/db.js";

async function checkTables() {
  try {
    console.log("🔍 Checking cheer-related table structures...\n");
    
    // Check sl_cheers table
    console.log("📋 sl_cheers table structure:");
    const cheersStructure = await db.raw("DESCRIBE sl_cheers");
    cheersStructure[0].forEach(column => {
      console.log(`   - ${column.Field} (${column.Type}) ${column.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    console.log("");
    
    // Check sl_cheer_comments table
    console.log("📋 sl_cheer_comments table structure:");
    const commentsStructure = await db.raw("DESCRIBE sl_cheer_comments");
    commentsStructure[0].forEach(column => {
      console.log(`   - ${column.Field} (${column.Type}) ${column.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    console.log("");
    
    // Check sl_cheer_likes table
    console.log("📋 sl_cheer_likes table structure:");
    const likesStructure = await db.raw("DESCRIBE sl_cheer_likes");
    likesStructure[0].forEach(column => {
      console.log(`   - ${column.Field} (${column.Type}) ${column.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    console.log("");
    
  } catch (error) {
    console.error("❌ Error checking tables:", error);
  } finally {
    process.exit(0);
  }
}

checkTables();
