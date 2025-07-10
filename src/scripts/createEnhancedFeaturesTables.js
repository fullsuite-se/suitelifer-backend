import { db } from "../config/db.js";

/**
 * Enhanced Points Shop Features Migration
 * Adds new tables for comments, likes, and reviews
 */
export const createEnhancedFeaturesTables = async () => {
  try {
    console.log("🚀 Starting enhanced features migration...");

    // Check and create sl_cheer_comments table
    const hasCheerComments = await db.schema.hasTable("sl_cheer_comments");
    if (!hasCheerComments) {
      await db.schema.createTable("sl_cheer_comments", (table) => {
        table.increments("id").primary();
        table.string("cheer_id", 36);
        table.string("user_id", 36);
        table.text("comment");
        table.timestamps(true, true);
        
        table.foreign("cheer_id").references("cheer_id").inTable("sl_cheers").onDelete("CASCADE");
        table.foreign("user_id").references("user_id").inTable("sl_user_accounts").onDelete("CASCADE");
        table.index(["cheer_id", "created_at"]);
      });
      console.log("✅ Created sl_cheer_comments table");
    } else {
      console.log("⏭️  sl_cheer_comments table already exists");
    }

    // Check and create sl_cheer_likes table
    const hasCheerLikes = await db.schema.hasTable("sl_cheer_likes");
    if (!hasCheerLikes) {
      await db.schema.createTable("sl_cheer_likes", (table) => {
        table.string("cheer_id", 36);
        table.string("user_id", 36);
        table.timestamps(true, true);
        
        table.primary(["cheer_id", "user_id"]);
        table.foreign("cheer_id").references("cheer_id").inTable("sl_cheers").onDelete("CASCADE");
        table.foreign("user_id").references("user_id").inTable("sl_user_accounts").onDelete("CASCADE");
        table.index(["cheer_id"]);
        table.index(["user_id"]);
      });
      console.log("✅ Created sl_cheer_likes table");
    } else {
      console.log("⏭️  sl_cheer_likes table already exists");
    }

    // Check and create sl_product_reviews table
    const hasProductReviews = await db.schema.hasTable("sl_product_reviews");
    if (!hasProductReviews) {
      await db.schema.createTable("sl_product_reviews", (table) => {
        table.increments("id").primary();
        table.string("product_id", 36);
        table.string("user_id", 36);
        table.integer("rating").checkBetween([1, 5]);
        table.text("review").nullable();
        table.timestamps(true, true);
        
        table.foreign("product_id").references("product_id").inTable("sl_products").onDelete("CASCADE");
        table.foreign("user_id").references("user_id").inTable("sl_user_accounts").onDelete("CASCADE");
        table.unique(["product_id", "user_id"]);
        table.index(["product_id", "rating"]);
      });
      console.log("✅ Created sl_product_reviews table");
    } else {
      console.log("⏭️  sl_product_reviews table already exists");
    }

    console.log("🎉 Enhanced features migration completed successfully!");
    return true;
  } catch (error) {
    console.error("❌ Error during enhanced features migration:", error);
    throw error;
  }
};

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createEnhancedFeaturesTables()
    .then(() => {
      console.log("Migration completed successfully");
      process.exit(0);
    })
    .catch(err => {
      console.error("Migration failed:", err);
      process.exit(1);
    });
}
