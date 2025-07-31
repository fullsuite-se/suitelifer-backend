import { db } from "../config/db.js";
import fs from "fs";
import path from "path";

const rollbackMigration = async (backupFile) => {
  console.log("🔄 Starting rollback of cheer migration...");
  
  try {
    // Check if backup file exists
    if (!fs.existsSync(backupFile)) {
      throw new Error(`Backup file not found: ${backupFile}`);
    }
    
    // Load backup data
    console.log("📋 Loading backup data...");
    const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    
    console.log(`📊 Backup timestamp: ${backupData.timestamp}`);
    console.log(`📊 Backup contains:`);
    console.log(`- ${backupData.cheer_posts.length} cheer posts`);
    console.log(`- ${backupData.cheer_comments.length} comments`);
    console.log(`- ${backupData.cheer_likes.length} likes`);
    console.log(`- ${backupData.cheer_designations.length} designations`);
    console.log(`- ${backupData.user_heartbits.length} user heartbits records`);
    console.log(`- ${backupData.heartbits_transactions.length} transactions`);
    
    // Step 1: Drop new tables
    console.log("📋 Step 1: Dropping new tables...");
    await db.raw("DROP TABLE IF EXISTS sl_cheers");
    await db.raw("DROP TABLE IF EXISTS sl_transactions");
    await db.raw("DROP TABLE IF EXISTS sl_user_points");
    
    // Step 2: Recreate old tables
    console.log("📋 Step 2: Recreating old tables...");
    
    // Recreate sl_cheer_post table
    await db.raw(`
      CREATE TABLE IF NOT EXISTS sl_cheer_post (
        cheer_post_id varchar(36) NOT NULL,
        cheerer_id varchar(36) DEFAULT NULL,
        peer_id varchar(36) DEFAULT NULL,
        heartbits_given int DEFAULT 1,
        cheer_message text,
        posted_at timestamp DEFAULT CURRENT_TIMESTAMP,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (cheer_post_id),
        KEY idx_cheer_post_cheerer (cheerer_id),
        KEY idx_cheer_post_peer (peer_id),
        KEY idx_cheer_post_posted (posted_at),
        CONSTRAINT fk_cheer_post_cheerer FOREIGN KEY (cheerer_id) REFERENCES sl_user_accounts (user_id) ON DELETE CASCADE,
        CONSTRAINT fk_cheer_post_peer FOREIGN KEY (peer_id) REFERENCES sl_user_accounts (user_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // Recreate sl_cheer_designation table
    await db.raw(`
      CREATE TABLE IF NOT EXISTS sl_cheer_designation (
        designation_id int NOT NULL AUTO_INCREMENT,
        cheer_post_id varchar(36) NOT NULL,
        peer_id varchar(36) NOT NULL,
        heartbits_given int NOT NULL DEFAULT 1,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (designation_id),
        KEY idx_cheer_designation_post (cheer_post_id),
        KEY idx_cheer_designation_peer (peer_id),
        CONSTRAINT fk_cheer_designation_post FOREIGN KEY (cheer_post_id) REFERENCES sl_cheer_post (cheer_post_id) ON DELETE CASCADE,
        CONSTRAINT fk_cheer_designation_peer FOREIGN KEY (peer_id) REFERENCES sl_user_accounts (user_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // Recreate sl_user_heartbits table
    await db.raw(`
      CREATE TABLE IF NOT EXISTS sl_user_heartbits (
        heartbits_id int NOT NULL AUTO_INCREMENT,
        user_id varchar(36) NOT NULL,
        heartbits_balance int DEFAULT 0,
        total_heartbits_earned int DEFAULT 0,
        total_heartbits_spent int DEFAULT 0,
        is_suspended tinyint(1) DEFAULT 0,
        suspension_reason text DEFAULT NULL,
        suspended_until timestamp NULL DEFAULT NULL,
        suspended_by varchar(36) DEFAULT NULL,
        suspended_at timestamp NULL DEFAULT NULL,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (heartbits_id),
        UNIQUE KEY idx_user_heartbits_user_id (user_id),
        KEY idx_user_heartbits_balance (heartbits_balance),
        KEY idx_user_heartbits_suspended (is_suspended),
        KEY fk_user_heartbits_suspended_by (suspended_by),
        CONSTRAINT fk_user_heartbits_user FOREIGN KEY (user_id) REFERENCES sl_user_accounts (user_id) ON DELETE CASCADE,
        CONSTRAINT fk_user_heartbits_suspended_by FOREIGN KEY (suspended_by) REFERENCES sl_user_accounts (user_id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // Recreate sl_heartbits_transactions table
    await db.raw(`
      CREATE TABLE IF NOT EXISTS sl_heartbits_transactions (
        transaction_id int NOT NULL AUTO_INCREMENT,
        user_id varchar(36) NOT NULL,
        transaction_type enum('earned','spent','admin_adjustment','monthly_allowance','cheer_received','order_purchase') NOT NULL,
        points_amount int NOT NULL,
        reference_type enum('order','cheer_post','admin_action','monthly_reset') DEFAULT NULL,
        reference_id int DEFAULT NULL,
        description text DEFAULT NULL,
        processed_by varchar(36) DEFAULT NULL,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (transaction_id),
        KEY idx_transactions_user (user_id),
        KEY idx_transactions_type (transaction_type),
        KEY idx_transactions_reference (reference_type,reference_id),
        KEY idx_transactions_date (created_at),
        CONSTRAINT fk_transactions_user FOREIGN KEY (user_id) REFERENCES sl_user_accounts (user_id) ON DELETE CASCADE,
        CONSTRAINT fk_transactions_processed_by FOREIGN KEY (processed_by) REFERENCES sl_user_accounts (user_id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // Step 3: Restore data
    console.log("📋 Step 3: Restoring data...");
    
    // Restore cheer posts
    if (backupData.cheer_posts.length > 0) {
      console.log("📋 Restoring cheer posts...");
      for (const post of backupData.cheer_posts) {
        await db("sl_cheer_post").insert(post);
      }
      console.log(`✅ Restored ${backupData.cheer_posts.length} cheer posts`);
    }
    
    // Restore comments
    if (backupData.cheer_comments.length > 0) {
      console.log("📋 Restoring comments...");
      for (const comment of backupData.cheer_comments) {
        await db("sl_cheer_comments").insert(comment);
      }
      console.log(`✅ Restored ${backupData.cheer_comments.length} comments`);
    }
    
    // Restore likes
    if (backupData.cheer_likes.length > 0) {
      console.log("📋 Restoring likes...");
      for (const like of backupData.cheer_likes) {
        await db("sl_cheer_likes").insert(like);
      }
      console.log(`✅ Restored ${backupData.cheer_likes.length} likes`);
    }
    
    // Restore designations
    if (backupData.cheer_designations.length > 0) {
      console.log("📋 Restoring designations...");
      for (const designation of backupData.cheer_designations) {
        await db("sl_cheer_designation").insert(designation);
      }
      console.log(`✅ Restored ${backupData.cheer_designations.length} designations`);
    }
    
    // Restore user heartbits
    if (backupData.user_heartbits.length > 0) {
      console.log("📋 Restoring user heartbits...");
      for (const heartbit of backupData.user_heartbits) {
        await db("sl_user_heartbits").insert(heartbit);
      }
      console.log(`✅ Restored ${backupData.user_heartbits.length} user heartbits records`);
    }
    
    // Restore transactions
    if (backupData.heartbits_transactions.length > 0) {
      console.log("📋 Restoring transactions...");
      for (const transaction of backupData.heartbits_transactions) {
        await db("sl_heartbits_transactions").insert(transaction);
      }
      console.log(`✅ Restored ${backupData.heartbits_transactions.length} transactions`);
    }
    
    // Step 4: Update foreign key constraints
    console.log("📋 Step 4: Updating foreign key constraints...");
    
    // Drop new foreign key constraints
    await db.raw("ALTER TABLE sl_cheer_comments DROP FOREIGN KEY IF EXISTS sl_cheer_comments_cheer_id_foreign");
    await db.raw("ALTER TABLE sl_cheer_likes DROP FOREIGN KEY IF EXISTS sl_cheer_likes_cheer_id_foreign");
    
    // Add old foreign key constraints
    await db.raw("ALTER TABLE sl_cheer_comments ADD CONSTRAINT sl_cheer_comments_cheer_post_id_foreign FOREIGN KEY (cheer_post_id) REFERENCES sl_cheer_post (cheer_post_id) ON DELETE CASCADE");
    await db.raw("ALTER TABLE sl_cheer_likes ADD CONSTRAINT sl_cheer_likes_cheer_post_id_foreign FOREIGN KEY (cheer_post_id) REFERENCES sl_cheer_post (cheer_post_id) ON DELETE CASCADE");
    
    console.log("✅ Rollback completed successfully!");
    console.log("📊 Rollback Summary:");
    console.log(`- Restored ${backupData.cheer_posts.length} cheer posts`);
    console.log(`- Restored ${backupData.cheer_comments.length} comments`);
    console.log(`- Restored ${backupData.cheer_likes.length} likes`);
    console.log(`- Restored ${backupData.cheer_designations.length} designations`);
    console.log(`- Restored ${backupData.user_heartbits.length} user heartbits records`);
    console.log(`- Restored ${backupData.heartbits_transactions.length} transactions`);
    
  } catch (error) {
    console.error("❌ Rollback failed:", error);
    throw error;
  }
};

// Get backup file from command line argument or use latest
const getBackupFile = () => {
  const args = process.argv.slice(2);
  if (args.length > 0) {
    return args[0];
  }
  
  // Find latest backup file
  const backupDir = path.join(process.cwd(), "backups");
  if (!fs.existsSync(backupDir)) {
    throw new Error("No backups directory found");
  }
  
  const files = fs.readdirSync(backupDir)
    .filter(file => file.startsWith("cheer_backup_") && file.endsWith(".json"))
    .sort()
    .reverse();
  
  if (files.length === 0) {
    throw new Error("No backup files found");
  }
  
  return path.join(backupDir, files[0]);
};

// Run rollback
const backupFile = getBackupFile();
console.log(`🔄 Using backup file: ${backupFile}`);

rollbackMigration(backupFile)
  .then(() => {
    console.log("🎉 Rollback script completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Rollback script failed:", error);
    process.exit(1);
  }); 