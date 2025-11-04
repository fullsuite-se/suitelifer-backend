import { db } from "../config/db.js";
import { v7 as uuidv7 } from "uuid";
import { now } from "../utils/date.js";

const migration = async () => {
  console.log("🚀 Starting migration to new cheer schema...");
  
  try {
    // Step 1: Backup existing data
    console.log("📋 Step 1: Backing up existing data...");
    
    const existingCheerPosts = await db("sl_cheer_post").select("*");
    const existingComments = await db("sl_cheer_comments").select("*");
    const existingLikes = await db("sl_cheer_likes").select("*");
    const existingDesignations = await db("sl_cheer_designation").select("*");
    const existingHeartbits = await db("sl_user_heartbits").select("*");
    const existingTransactions = await db("sl_heartbits_transactions").select("*");
    
    console.log(`Found ${existingCheerPosts.length} cheer posts`);
    console.log(`Found ${existingComments.length} comments`);
    console.log(`Found ${existingLikes.length} likes`);
    console.log(`Found ${existingDesignations.length} designations`);
    console.log(`Found ${existingHeartbits.length} heartbits records`);
    console.log(`Found ${existingTransactions.length} transactions`);
    
    // Step 2: Create new tables if they don't exist
    console.log("📋 Step 2: Creating new tables...");
    
    // Create sl_cheers table
    await db.raw(`
      CREATE TABLE IF NOT EXISTS sl_cheers (
        cheer_id varchar(36) NOT NULL,
        from_user_id varchar(36) DEFAULT NULL,
        to_user_id varchar(36) DEFAULT NULL,
        points int DEFAULT 1,
        message text,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (cheer_id),
        KEY sl_cheers_from_user_id_created_at_index (from_user_id,created_at),
        KEY sl_cheers_to_user_id_created_at_index (to_user_id,created_at),
        CONSTRAINT sl_cheers_from_user_id_foreign FOREIGN KEY (from_user_id) REFERENCES sl_user_accounts (user_id) ON DELETE CASCADE,
        CONSTRAINT sl_cheers_to_user_id_foreign FOREIGN KEY (to_user_id) REFERENCES sl_user_accounts (user_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);
    
    // Create sl_transactions table
    await db.raw(`
      CREATE TABLE IF NOT EXISTS sl_transactions (
        transaction_id varchar(36) NOT NULL,
        from_user_id varchar(36) DEFAULT NULL,
        to_user_id varchar(36) DEFAULT NULL,
        type enum('earned','spent','given','received','bonus','admin_grant','admin_deduct') DEFAULT NULL,
        amount int DEFAULT NULL,
        description varchar(500) DEFAULT NULL,
        message text,
        metadata json DEFAULT NULL,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (transaction_id),
        KEY sl_transactions_to_user_id_created_at_index (to_user_id,created_at),
        KEY sl_transactions_from_user_id_created_at_index (from_user_id,created_at),
        KEY sl_transactions_type_created_at_index (type,created_at),
        CONSTRAINT sl_transactions_from_user_id_foreign FOREIGN KEY (from_user_id) REFERENCES sl_user_accounts (user_id) ON DELETE SET NULL,
        CONSTRAINT sl_transactions_to_user_id_foreign FOREIGN KEY (to_user_id) REFERENCES sl_user_accounts (user_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);
    
    // Create sl_user_points table
    await db.raw(`
      CREATE TABLE IF NOT EXISTS sl_user_points (
        user_id varchar(36) NOT NULL,
        available_points int DEFAULT 0,
        total_earned int DEFAULT 0,
        total_spent int DEFAULT 0,
        monthly_cheer_limit int DEFAULT 100,
        monthly_cheer_used int DEFAULT 0,
        last_monthly_reset datetime DEFAULT NULL,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id),
        KEY sl_user_points_user_id_index (user_id),
        KEY sl_user_points_total_earned_index (total_earned),
        CONSTRAINT sl_user_points_user_id_foreign FOREIGN KEY (user_id) REFERENCES sl_user_accounts (user_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);
    
         // Step 3: Add missing columns to existing tables
     console.log("📋 Step 3: Adding missing columns...");
     
     // Add cheer_id column to comments table if it doesn't exist
     try {
       await db.raw("ALTER TABLE sl_cheer_comments ADD COLUMN cheer_id varchar(36) DEFAULT NULL");
       console.log("✅ Added cheer_id column to sl_cheer_comments");
     } catch (error) {
       if (error.code === 'ER_DUP_FIELDNAME') {
         console.log("ℹ️  cheer_id column already exists in sl_cheer_comments");
       } else {
         throw error;
       }
     }
     
     // Add cheer_id column to likes table if it doesn't exist
     try {
       await db.raw("ALTER TABLE sl_cheer_likes ADD COLUMN cheer_id varchar(36) DEFAULT NULL");
       console.log("✅ Added cheer_id column to sl_cheer_likes");
     } catch (error) {
       if (error.code === 'ER_DUP_FIELDNAME') {
         console.log("ℹ️  cheer_id column already exists in sl_cheer_likes");
       } else {
         throw error;
       }
     }
     
     // Step 4: Migrate data from old to new schema
     console.log("📋 Step 4: Migrating data...");
     
     // Migrate cheer posts to new sl_cheers table
     for (const post of existingCheerPosts) {
      const newCheerId = uuidv7();
      
      // Insert into new sl_cheers table
      await db("sl_cheers").insert({
        cheer_id: newCheerId,
        from_user_id: post.cheerer_id,
        to_user_id: post.peer_id,
        points: post.heartbits_given || 1,
        message: post.cheer_message || "",
        created_at: post.posted_at || post.created_at,
        updated_at: post.updated_at || post.created_at
      });
      
      // Create transactions for this cheer
      const fromTransactionId = uuidv7();
      const toTransactionId = uuidv7();
      
      // Transaction from giver
      await db("sl_transactions").insert({
        transaction_id: fromTransactionId,
        from_user_id: post.cheerer_id,
        to_user_id: post.peer_id,
        type: "given",
        amount: post.heartbits_given || 1,
        description: `cheered ${post.heartbits_given || 1} points`,
        message: post.cheer_message || "",
        metadata: JSON.stringify({
          type: "cheer",
          cheer_id: newCheerId
        }),
        created_at: post.posted_at || post.created_at,
        updated_at: post.updated_at || post.created_at
      });
      
      // Transaction to receiver
      await db("sl_transactions").insert({
        transaction_id: toTransactionId,
        from_user_id: post.cheerer_id,
        to_user_id: post.peer_id,
        type: "received",
        amount: post.heartbits_given || 1,
        description: `received ${post.heartbits_given || 1} points from cheer`,
        message: post.cheer_message || "",
        metadata: JSON.stringify({
          type: "cheer",
          cheer_id: newCheerId
        }),
        created_at: post.posted_at || post.created_at,
        updated_at: post.updated_at || post.created_at
      });
      
      // Update comments to reference new cheer_id
      await db("sl_cheer_comments")
        .where("cheer_post_id", post.cheer_post_id)
        .update({ cheer_id: newCheerId });
      
      // Update likes to reference new cheer_id
      await db("sl_cheer_likes")
        .where("cheer_post_id", post.cheer_post_id)
        .update({ cheer_id: newCheerId });
    }
    
         // Step 5: Migrate user points/heartbits
     console.log("📋 Step 5: Migrating user points...");
    
    for (const heartbit of existingHeartbits) {
      // Check if user already has points record
      const existingPoints = await db("sl_user_points")
        .where("user_id", heartbit.user_id)
        .first();
      
      if (!existingPoints) {
        await db("sl_user_points").insert({
          user_id: heartbit.user_id,
          available_points: heartbit.heartbits_balance || 0,
          total_earned: heartbit.total_heartbits_earned || 0,
          total_spent: heartbit.total_heartbits_spent || 0,
          monthly_cheer_limit: 100,
          monthly_cheer_used: 0,
          last_monthly_reset: now().toISOString().slice(0, 7) + "-01 00:00:00",
          created_at: heartbit.created_at,
          updated_at: heartbit.updated_at
        });
      }
    }
    
         // Step 6: Migrate existing transactions
     console.log("📋 Step 6: Migrating existing transactions...");
    
    for (const transaction of existingTransactions) {
      const newTransactionId = uuidv7();
      
      let transactionType = "earned";
      if (transaction.transaction_type === "spent") transactionType = "spent";
      else if (transaction.transaction_type === "admin_adjustment") transactionType = "admin_grant";
      
      await db("sl_transactions").insert({
        transaction_id: newTransactionId,
        from_user_id: transaction.processed_by || null,
        to_user_id: transaction.user_id,
        type: transactionType,
        amount: transaction.points_amount,
        description: transaction.description || "Migrated transaction",
        message: transaction.description || "",
        metadata: JSON.stringify({
          source: "migration",
          original_transaction_id: transaction.transaction_id,
          reference_type: transaction.reference_type,
          reference_id: transaction.reference_id
        }),
        created_at: transaction.created_at,
        updated_at: transaction.updated_at || transaction.created_at
      });
    }
    
         // Step 7: Update foreign key constraints
     console.log("📋 Step 7: Updating foreign key constraints...");
    
         // Drop old foreign key constraints (with error handling)
     try {
       await db.raw("ALTER TABLE sl_cheer_comments DROP FOREIGN KEY sl_cheer_comments_cheer_post_id_foreign");
       console.log("✅ Dropped old foreign key constraint from sl_cheer_comments");
     } catch (error) {
       console.log("ℹ️  Old foreign key constraint not found in sl_cheer_comments");
     }
     
     try {
       await db.raw("ALTER TABLE sl_cheer_likes DROP FOREIGN KEY sl_cheer_likes_cheer_post_id_foreign");
       console.log("✅ Dropped old foreign key constraint from sl_cheer_likes");
     } catch (error) {
       console.log("ℹ️  Old foreign key constraint not found in sl_cheer_likes");
     }
     
     // Add new foreign key constraints
     try {
       await db.raw("ALTER TABLE sl_cheer_comments ADD CONSTRAINT sl_cheer_comments_cheer_id_foreign FOREIGN KEY (cheer_id) REFERENCES sl_cheers (cheer_id) ON DELETE CASCADE");
       console.log("✅ Added new foreign key constraint to sl_cheer_comments");
     } catch (error) {
       console.log("ℹ️  Foreign key constraint already exists in sl_cheer_comments");
     }
     
     try {
       await db.raw("ALTER TABLE sl_cheer_likes ADD CONSTRAINT sl_cheer_likes_cheer_id_foreign FOREIGN KEY (cheer_id) REFERENCES sl_cheers (cheer_id) ON DELETE CASCADE");
       console.log("✅ Added new foreign key constraint to sl_cheer_likes");
     } catch (error) {
       console.log("ℹ️  Foreign key constraint already exists in sl_cheer_likes");
     }
    
         // Step 8: Clean up old tables (optional - comment out if you want to keep them)
     console.log("📋 Step 8: Cleaning up old tables...");
    
    // Uncomment these lines if you want to drop the old tables
    // await db.raw("DROP TABLE IF EXISTS sl_cheer_designation");
    // await db.raw("DROP TABLE IF EXISTS sl_cheer_post");
    // await db.raw("DROP TABLE IF EXISTS sl_user_heartbits");
    // await db.raw("DROP TABLE IF EXISTS sl_heartbits_transactions");
    
    console.log("✅ Migration completed successfully!");
    console.log("📊 Migration Summary:");
    console.log(`- Migrated ${existingCheerPosts.length} cheer posts`);
    console.log(`- Migrated ${existingComments.length} comments`);
    console.log(`- Migrated ${existingLikes.length} likes`);
    console.log(`- Migrated ${existingHeartbits.length} user points records`);
    console.log(`- Migrated ${existingTransactions.length} transactions`);
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
};

// Run migration
migration()
  .then(() => {
    console.log("🎉 Migration script completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Migration script failed:", error);
    process.exit(1);
  }); 