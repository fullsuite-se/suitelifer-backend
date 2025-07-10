import { db } from "../config/db.js";
import { v7 as uuidv7 } from "uuid";

/**
 * Seed sample data for the points shop
 */
export const seedPointsShopData = async () => {
  try {
    console.log("🌱 Starting Points Shop data seeding...");

    // Sample products
    const sampleProducts = [
      {
        product_id: uuidv7(),
        name: "SuiteLifer Coffee Mug",
        description: "Premium ceramic mug with SuiteLifer logo. Perfect for your morning coffee or tea.",
        image_url: "https://example.com/images/coffee-mug.jpg",
        points_cost: 50,
        category: "office",
        inventory: 100,
        rating: 4.5,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        product_id: uuidv7(),
        name: "SuiteLifer T-Shirt",
        description: "Comfortable cotton t-shirt with SuiteLifer branding. Available in multiple sizes.",
        image_url: "https://example.com/images/tshirt.jpg",
        points_cost: 150,
        category: "apparel",
        inventory: 50,
        rating: 4.8,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        product_id: uuidv7(),
        name: "Wireless Mouse",
        description: "Ergonomic wireless mouse perfect for productivity. 2.4GHz connection with long battery life.",
        image_url: "https://example.com/images/wireless-mouse.jpg",
        points_cost: 300,
        category: "electronics",
        inventory: 25,
        rating: 4.3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        product_id: uuidv7(),
        name: "Starbucks Gift Card ($25)",
        description: "Digital gift card for Starbucks. Perfect for your daily coffee fix!",
        image_url: "https://example.com/images/starbucks-card.jpg",
        points_cost: 500,
        category: "giftcards",
        inventory: 1000,
        rating: 5.0,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        product_id: uuidv7(),
        name: "Team Lunch Experience",
        description: "Join the team for a special lunch experience at a local restaurant.",
        image_url: "https://example.com/images/team-lunch.jpg",
        points_cost: 800,
        category: "experiences",
        inventory: 10,
        rating: 4.9,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        product_id: uuidv7(),
        name: "Notebook Set",
        description: "High-quality notebook set with SuiteLifer branding. Great for meetings and notes.",
        image_url: "https://example.com/images/notebook-set.jpg",
        points_cost: 75,
        category: "office",
        inventory: 200,
        rating: 4.2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Insert sample products
    await db("sl_products").insert(sampleProducts);
    console.log(`✅ Inserted ${sampleProducts.length} sample products`);

    // Get a sample user to create points for (if exists)
    const sampleUser = await db("sl_user_accounts").first();
    
    if (sampleUser) {
      // Check if user already has points record
      const existingPoints = await db("sl_user_points").where("user_id", sampleUser.user_id).first();
      
      if (!existingPoints) {
        // Create sample user points record
        const userPointsData = {
          user_id: sampleUser.user_id,
          available_points: 1000, // Give them 1000 points to start
          total_earned: 1000,
          total_spent: 0,
          monthly_cheer_limit: 100,
          monthly_cheer_used: 0,
          last_monthly_reset: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          created_at: new Date(),
          updated_at: new Date()
        };

        await db("sl_user_points").insert(userPointsData);
        console.log(`✅ Created points record for user: ${sampleUser.user_id}`);
      } else {
        console.log(`ℹ️  User already has points record: ${existingPoints.available_points} points`);
      }

      // Create a sample transaction
      const transactionData = {
        transaction_id: uuidv7(),
        from_user_id: null, // System transaction
        to_user_id: sampleUser.user_id,
        type: "earned",
        amount: 1000,
        description: "Welcome bonus",
        message: "Welcome to SuiteLifer! Here are some points to get you started.",
        metadata: JSON.stringify({ source: "welcome_bonus", admin_id: "system" }),
        created_at: new Date(),
        updated_at: new Date()
      };

      await db("sl_transactions").insert(transactionData);
      console.log("✅ Created welcome transaction");

      // Create a sample mood entry
      const moodData = {
        mood_id: uuidv7(),
        user_id: sampleUser.user_id,
        mood: "excellent",
        comment: "Excited about the new points system!",
        tags: JSON.stringify(["excited", "positive", "system"]),
        mood_date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
        created_at: new Date(),
        updated_at: new Date()
      };

      await db("sl_moods").insert(moodData);
      console.log("✅ Created sample mood entry");
    } else {
      console.log("⚠️  No users found - skipping user-specific data");
    }

    console.log("🎉 Points Shop data seeding completed successfully!");
    
  } catch (error) {
    console.error("❌ Error during Points Shop data seeding:", error.message);
    throw error;
  }
};

// Run the seeding if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedPointsShopData()
    .then(() => {
      console.log("✅ Seeding completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}
