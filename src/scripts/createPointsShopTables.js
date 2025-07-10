import { db } from "../config/db.js";

/**
 * Points Shop Database Migration
 * Creates all necessary tables for the integrated points shop functionality
 */
export const createPointsShopTables = async () => {
  try {
    console.log("🚀 Starting Points Shop database migration...");

    // Create sl_user_points table
    await db.schema.createTable("sl_user_points", (table) => {
      table.string("user_id", 36).primary();
      table.integer("available_points").defaultTo(0);
      table.integer("total_earned").defaultTo(0);
      table.integer("total_spent").defaultTo(0);
      table.integer("monthly_cheer_limit").defaultTo(100);
      table.integer("monthly_cheer_used").defaultTo(0);
      table.datetime("last_monthly_reset");
      table.timestamps(true, true);
      
      table.foreign("user_id").references("user_id").inTable("sl_user_accounts").onDelete("CASCADE");
      table.index(["user_id"]);
      table.index(["total_earned"]);
    });
    console.log("✅ Created sl_user_points table");

    // Create sl_transactions table
    await db.schema.createTable("sl_transactions", (table) => {
      table.string("transaction_id", 36).primary();
      table.string("from_user_id", 36).nullable();
      table.string("to_user_id", 36);
      table.enum("type", ["earned", "spent", "given", "received", "bonus", "admin_grant", "admin_deduct"]);
      table.integer("amount");
      table.string("description", 500);
      table.text("message").nullable();
      table.json("metadata").nullable();
      table.timestamps(true, true);
      
      table.foreign("from_user_id").references("user_id").inTable("sl_user_accounts").onDelete("SET NULL");
      table.foreign("to_user_id").references("user_id").inTable("sl_user_accounts").onDelete("CASCADE");
      table.index(["to_user_id", "created_at"]);
      table.index(["from_user_id", "created_at"]);
      table.index(["type", "created_at"]);
    });
    console.log("✅ Created sl_transactions table");

    // Create sl_cheers table
    await db.schema.createTable("sl_cheers", (table) => {
      table.string("cheer_id", 36).primary();
      table.string("from_user_id", 36);
      table.string("to_user_id", 36);
      table.integer("points").defaultTo(1);
      table.text("message").nullable();
      table.timestamps(true, true);
      
      table.foreign("from_user_id").references("user_id").inTable("sl_user_accounts").onDelete("CASCADE");
      table.foreign("to_user_id").references("user_id").inTable("sl_user_accounts").onDelete("CASCADE");
      table.index(["from_user_id", "created_at"]);
      table.index(["to_user_id", "created_at"]);
    });
    console.log("✅ Created sl_cheers table");

    // Create sl_products table
    await db.schema.createTable("sl_products", (table) => {
      table.string("product_id", 36).primary();
      table.string("name", 200);
      table.text("description");
      table.string("image_url", 500);
      table.integer("points_cost");
      table.enum("category", ["apparel", "accessories", "electronics", "office", "giftcards", "experiences", "food", "books", "other"]);
      table.integer("inventory").defaultTo(0);
      table.decimal("rating", 2, 1).defaultTo(0);
      table.boolean("is_active").defaultTo(true);
      table.timestamps(true, true);
      
      table.index(["category", "is_active"]);
      table.index(["points_cost"]);
      table.index(["is_active", "created_at"]);
    });
    console.log("✅ Created sl_products table");

    // Create sl_orders table
    await db.schema.createTable("sl_orders", (table) => {
      table.string("order_id", 36).primary();
      table.string("user_id", 36);
      table.string("order_number", 50).unique();
      table.integer("total_points");
      table.enum("status", ["pending", "processing", "completed", "cancelled", "refunded"]).defaultTo("pending");
      table.text("notes").nullable();
      table.timestamps(true, true);
      
      table.foreign("user_id").references("user_id").inTable("sl_user_accounts").onDelete("CASCADE");
      table.index(["user_id", "created_at"]);
      table.index(["status", "created_at"]);
      table.index(["order_number"]);
    });
    console.log("✅ Created sl_orders table");

    // Create sl_order_items table
    await db.schema.createTable("sl_order_items", (table) => {
      table.increments("order_item_id");
      table.string("order_id", 36);
      table.string("product_id", 36);
      table.integer("quantity");
      table.integer("points_cost_per_item");
      table.integer("total_points");
      table.timestamps(true, true);
      
      table.foreign("order_id").references("order_id").inTable("sl_orders").onDelete("CASCADE");
      table.foreign("product_id").references("product_id").inTable("sl_products").onDelete("CASCADE");
      table.index(["order_id"]);
      table.index(["product_id"]);
    });
    console.log("✅ Created sl_order_items table");

    // Create sl_cart table
    await db.schema.createTable("sl_cart", (table) => {
      table.string("cart_id", 36).primary();
      table.string("user_id", 36).unique();
      table.timestamps(true, true);
      
      table.foreign("user_id").references("user_id").inTable("sl_user_accounts").onDelete("CASCADE");
      table.index(["user_id"]);
    });
    console.log("✅ Created sl_cart table");

    // Create sl_cart_items table
    await db.schema.createTable("sl_cart_items", (table) => {
      table.increments("cart_item_id");
      table.string("cart_id", 36);
      table.string("product_id", 36);
      table.integer("quantity");
      table.timestamps(true, true);
      
      table.foreign("cart_id").references("cart_id").inTable("sl_cart").onDelete("CASCADE");
      table.foreign("product_id").references("product_id").inTable("sl_products").onDelete("CASCADE");
      table.unique(["cart_id", "product_id"]);
      table.index(["cart_id"]);
    });
    console.log("✅ Created sl_cart_items table");

    // Create sl_moods table
    await db.schema.createTable("sl_moods", (table) => {
      table.string("mood_id", 36).primary();
      table.string("user_id", 36);
      table.enum("mood", ["excellent", "good", "okay", "not-great", "poor"]);
      table.text("comment").nullable();
      table.json("tags").nullable();
      table.date("mood_date");
      table.timestamps(true, true);
      
      table.foreign("user_id").references("user_id").inTable("sl_user_accounts").onDelete("CASCADE");
      table.unique(["user_id", "mood_date"]);
      table.index(["user_id", "mood_date"]);
      table.index(["mood_date"]);
      table.index(["mood"]);
    });
    console.log("✅ Created sl_moods table");

    // Create sl_mood_entries table
    await db.schema.createTable("sl_mood_entries", (table) => {
      table.increments("id").primary();
      table.string("user_id", 36);
      table.enum("mood", ["excellent", "good", "okay", "not-great", "poor"]);
      table.text("comment").nullable();
      table.json("tags").nullable();
      table.date("mood_date");
      table.timestamps(true, true);
      
      table.foreign("user_id").references("user_id").inTable("sl_user_accounts").onDelete("CASCADE");
      table.unique(["user_id", "mood_date"]);
      table.index(["user_id", "mood_date"]);
      table.index(["mood_date"]);
      table.index(["mood"]);
    });
    console.log("✅ Created sl_mood_entries table");

    // Create sl_cheer_comments table
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

    // Create sl_cheer_likes table
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

    // Create enhanced product ratings table
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

    console.log("🎉 Points Shop database migration completed successfully!");
    
    return true;
  } catch (error) {
    console.error("❌ Error during Points Shop migration:", error);
    throw error;
  }
};

/**
 * Rollback function to drop all Points Shop tables
 */
export const rollbackPointsShopTables = async () => {
  try {
    console.log("🔄 Rolling back Points Shop database migration...");

    const tables = [
      "sl_cart_items",
      "sl_cart", 
      "sl_order_items",
      "sl_orders",
      "sl_products",
      "sl_moods",
      "sl_cheers",
      "sl_transactions",
      "sl_user_points",
      "sl_mood_entries",
      "sl_cheer_comments",
      "sl_cheer_likes",
      "sl_product_reviews"
    ];

    for (const table of tables) {
      if (await db.schema.hasTable(table)) {
        await db.schema.dropTable(table);
        console.log(`✅ Dropped ${table} table`);
      }
    }

    console.log("🎉 Points Shop rollback completed successfully!");
    return true;
  } catch (error) {
    console.error("❌ Error during Points Shop rollback:", error);
    throw error;
  }
};

/**
 * Check if Points Shop tables exist
 */
export const checkPointsShopTables = async () => {
  const tables = [
    "sl_user_points",
    "sl_transactions", 
    "sl_cheers",
    "sl_products",
    "sl_orders",
    "sl_order_items",
    "sl_cart",
    "sl_cart_items",
    "sl_moods",
    "sl_mood_entries",
    "sl_cheer_comments",
    "sl_cheer_likes",
    "sl_product_reviews"
  ];

  const existingTables = [];
  
  for (const table of tables) {
    if (await db.schema.hasTable(table)) {
      existingTables.push(table);
    }
  }

  return {
    allTablesExist: existingTables.length === tables.length,
    existingTables,
    missingTables: tables.filter(table => !existingTables.includes(table))
  };
};

// Run migration if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createPointsShopTables()
    .then(() => {
      console.log("🎉 Migration completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Migration failed:", error);
      process.exit(1);
    });
}
