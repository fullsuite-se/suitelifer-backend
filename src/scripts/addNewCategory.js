import { db } from '../config/db.js';

/**
 * Script to add a new category to the product system
 * This script can be used to:
 * 1. Update existing products to use a new category
 * 2. Add a new category to the system
 */

// Example: Add a new category
const newCategory = 'TECH'; // Change this to your desired category

async function addNewCategory() {
  try {
    console.log(`Starting to add new category: ${newCategory}`);
    
    // Option 1: Update specific products to use the new category
    // Uncomment and modify the where clause to target specific products
    /*
    const updateResult = await db('sl_products')
      .where('name', 'like', '%tech%') // Example: products with 'tech' in the name
      .update({ category: newCategory });
    
    console.log(`Updated ${updateResult} products to category: ${newCategory}`);
    */
    
    // Option 2: Show current category distribution
    const categoryCounts = await db('sl_products')
      .select('category')
      .count('* as count')
      .groupBy('category');
    
    console.log('\n📊 Current products by category:');
    categoryCounts.forEach(({ category, count }) => {
      console.log(`${category}: ${count} products`);
    });
    
    // Option 3: Show products that could be categorized
    const uncategorizedProducts = await db('sl_products')
      .select('product_id', 'name', 'category')
      .where('category', '=', 'SWAGS') // Example: find products in a specific category
      .limit(10);
    
    console.log('\n🔍 Sample products that could be recategorized:');
    uncategorizedProducts.forEach(product => {
      console.log(`- ${product.name} (currently: ${product.category})`);
    });
    
    console.log('\n✅ Category analysis completed!');
    console.log(`To add the new category "${newCategory}":`);
    console.log('1. Update the frontend category dropdowns');
    console.log('2. Update the category badge colors in ProductManagement.jsx');
    console.log('3. Run this script with specific product targeting');
    
  } catch (error) {
    console.error('❌ Error during category update:', error);
  } finally {
    await db.destroy();
  }
}

// Run the script
addNewCategory(); 