import { db } from "../config/db.js";
import fs from "fs";
import path from "path";

const backupData = async () => {
  console.log("📦 Starting backup of cheer data...");
  
  try {
    const backupData = {
      timestamp: new Date().toISOString(),
      cheer_posts: [],
      cheer_comments: [],
      cheer_likes: [],
      cheer_designations: [],
      user_heartbits: [],
      heartbits_transactions: []
    };
    
    // Backup cheer posts
    console.log("📋 Backing up cheer posts...");
    backupData.cheer_posts = await db("sl_cheer_post").select("*");
    console.log(`✅ Backed up ${backupData.cheer_posts.length} cheer posts`);
    
    // Backup comments
    console.log("📋 Backing up comments...");
    backupData.cheer_comments = await db("sl_cheer_comments").select("*");
    console.log(`✅ Backed up ${backupData.cheer_comments.length} comments`);
    
    // Backup likes
    console.log("📋 Backing up likes...");
    backupData.cheer_likes = await db("sl_cheer_likes").select("*");
    console.log(`✅ Backed up ${backupData.cheer_likes.length} likes`);
    
    // Backup designations
    console.log("📋 Backing up designations...");
    backupData.cheer_designations = await db("sl_cheer_designation").select("*");
    console.log(`✅ Backed up ${backupData.cheer_designations.length} designations`);
    
    // Backup user heartbits
    console.log("📋 Backing up user heartbits...");
    backupData.user_heartbits = await db("sl_user_heartbits").select("*");
    console.log(`✅ Backed up ${backupData.user_heartbits.length} user heartbits records`);
    
    // Backup transactions
    console.log("📋 Backing up transactions...");
    backupData.heartbits_transactions = await db("sl_heartbits_transactions").select("*");
    console.log(`✅ Backed up ${backupData.heartbits_transactions.length} transactions`);
    
    // Create backup directory if it doesn't exist
    const backupDir = path.join(process.cwd(), "backups");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Save backup to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFile = path.join(backupDir, `cheer_backup_${timestamp}.json`);
    
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    
    console.log("✅ Backup completed successfully!");
    console.log(`📁 Backup saved to: ${backupFile}`);
    console.log("📊 Backup Summary:");
    console.log(`- ${backupData.cheer_posts.length} cheer posts`);
    console.log(`- ${backupData.cheer_comments.length} comments`);
    console.log(`- ${backupData.cheer_likes.length} likes`);
    console.log(`- ${backupData.cheer_designations.length} designations`);
    console.log(`- ${backupData.user_heartbits.length} user heartbits records`);
    console.log(`- ${backupData.heartbits_transactions.length} transactions`);
    
    return backupFile;
    
  } catch (error) {
    console.error("❌ Backup failed:", error);
    throw error;
  }
};

// Run backup
backupData()
  .then((backupFile) => {
    console.log("🎉 Backup script completed!");
    console.log(`💾 Backup file: ${backupFile}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Backup script failed:", error);
    process.exit(1);
  }); 