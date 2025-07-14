import { Suitebite } from '../models/suitebiteModel.js';
import { db } from '../config/db.js';

async function seedSuitebiteData() {
  console.log('🌱 Starting Suitebite data seeding...\n');

  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await db('sl_order_items').del();
    await db('sl_orders').del();
    await db('sl_cart_items').del();
    await db('sl_carts').del();
    await db('sl_shop_products').del();
    await db('sl_shop_categories').del();
    
    // Seed Categories
    console.log('📂 Creating categories...');
    const categories = [
      {
        category_name: 'SWAGS',
        category_description: 'Company branded merchandise and apparel',
        sort_order: 1
      },
      {
        category_name: 'VOUCHERS',
        category_description: 'Gift cards and vouchers for various stores',
        sort_order: 2
      },
      {
        category_name: 'TRAVEL',
        category_description: 'Travel and transportation vouchers',
        sort_order: 3
      },
      {
        category_name: 'TECH',
        category_description: 'Technology gadgets and accessories',
        sort_order: 4
      },
      {
        category_name: 'FOOD',
        category_description: 'Food and beverage vouchers',
        sort_order: 5
      },
      {
        category_name: 'WELLNESS',
        category_description: 'Health and wellness related items',
        sort_order: 6
      }
    ];

    const categoryIds = {};
    for (const category of categories) {
      const [categoryId] = await db('sl_shop_categories').insert(category);
      categoryIds[category.category_name] = categoryId;
      console.log(`  ✅ ${category.category_name}`);
    }

    // Seed Products
    console.log('\n🛍️ Creating products...');
    const products = [
      // SWAGS
      {
        product_name: 'FS Premium Mug',
        product_description: 'High-quality ceramic coffee mug with company branding. Perfect for your morning brew with excellent heat retention.',
        price_points: 250,
        stock_quantity: 50,
        category_id: categoryIds['SWAGS'],
        featured: true,
        is_active: true
      },
      {
        product_name: 'FS Polo Shirt',
        product_description: 'Professional polo shirt with company branding. Made from breathable fabric perfect for business casual attire.',
        price_points: 800,
        stock_quantity: 30,
        category_id: categoryIds['SWAGS'],
        featured: true,
        is_active: true
      },
      {
        product_name: 'FS Sweater',
        product_description: 'Premium company sweater with comfortable fit and high-quality material. Perfect for casual office wear.',
        price_points: 1500,
        stock_quantity: 20,
        category_id: categoryIds['SWAGS'],
        featured: false,
        is_active: true
      },
      {
        product_name: 'FS Gym Bag',
        product_description: 'Durable gym bag with multiple compartments for all your workout essentials.',
        price_points: 1000,
        stock_quantity: 25,
        category_id: categoryIds['SWAGS'],
        featured: false,
        is_active: true
      },
      {
        product_name: 'FS Tee (Black/White)',
        product_description: 'Comfortable cotton t-shirt available in black and white colors. Features company logo.',
        price_points: 500,
        stock_quantity: 40,
        category_id: categoryIds['SWAGS'],
        featured: false,
        is_active: true
      },
      {
        product_name: 'FS Windbreaker',
        product_description: 'Lightweight windbreaker jacket with company logo. Perfect for outdoor activities.',
        price_points: 1500,
        stock_quantity: 15,
        category_id: categoryIds['SWAGS'],
        featured: false,
        is_active: true
      },
      {
        product_name: 'FS Bucket Hat',
        product_description: 'Comfortable bucket hat with company branding. Features adjustable fit.',
        price_points: 500,
        stock_quantity: 35,
        category_id: categoryIds['SWAGS'],
        featured: false,
        is_active: true
      },

      // TECH
      {
        product_name: 'FS Powerbank',
        product_description: 'Portable powerbank with high capacity for charging your devices on the go.',
        price_points: 800,
        stock_quantity: 30,
        category_id: categoryIds['TECH'],
        featured: true,
        is_active: true
      },
      {
        product_name: 'Wireless Mouse',
        product_description: 'Ergonomic wireless mouse for better productivity. 2.4GHz wireless connection.',
        price_points: 600,
        stock_quantity: 25,
        category_id: categoryIds['TECH'],
        featured: false,
        is_active: true
      },
      {
        product_name: 'USB-C Hub',
        product_description: 'Multi-port USB-C hub with HDMI, USB 3.0, and charging ports.',
        price_points: 1200,
        stock_quantity: 20,
        category_id: categoryIds['TECH'],
        featured: false,
        is_active: true
      },

      // VOUCHERS
      {
        product_name: 'Starbucks eGift ₱500',
        product_description: 'Digital gift card worth 500 pesos for Starbucks. Enjoy your favorite coffee and treats.',
        price_points: 1000,
        stock_quantity: 100,
        category_id: categoryIds['VOUCHERS'],
        featured: true,
        is_active: true
      },
      {
        product_name: 'Lazada Voucher ₱500',
        product_description: 'Shopping voucher worth 500 pesos for Lazada. Shop for your favorite products online.',
        price_points: 1000,
        stock_quantity: 100,
        category_id: categoryIds['VOUCHERS'],
        featured: false,
        is_active: true
      },
      {
        product_name: 'Tauceti Voucher ₱500',
        product_description: 'Gift voucher worth 500 pesos for Tauceti. Perfect for treating yourself.',
        price_points: 750,
        stock_quantity: 50,
        category_id: categoryIds['VOUCHERS'],
        featured: false,
        is_active: true
      },

      // FOOD
      {
        product_name: 'Food Panda Voucher ₱300',
        product_description: 'Food delivery voucher worth 300 pesos. Order your favorite meals.',
        price_points: 600,
        stock_quantity: 75,
        category_id: categoryIds['FOOD'],
        featured: false,
        is_active: true
      },
      {
        product_name: 'Jollibee Voucher ₱250',
        product_description: 'Fast food voucher worth 250 pesos for Jollibee.',
        price_points: 500,
        stock_quantity: 60,
        category_id: categoryIds['FOOD'],
        featured: false,
        is_active: true
      },

      // WELLNESS
      {
        product_name: 'Gym/Yoga Voucher ₱500',
        product_description: 'Fitness voucher worth 500 pesos for gym or yoga classes. Stay healthy and active.',
        price_points: 1000,
        stock_quantity: 40,
        category_id: categoryIds['WELLNESS'],
        featured: false,
        is_active: true
      },
      {
        product_name: 'Spa Voucher ₱800',
        product_description: 'Relaxing spa voucher worth 800 pesos. Perfect for stress relief.',
        price_points: 1600,
        stock_quantity: 25,
        category_id: categoryIds['WELLNESS'],
        featured: false,
        is_active: true
      },

      // TRAVEL
      {
        product_name: 'Airfare Ticket ₱2000',
        product_description: 'Airfare ticket worth 2000 pesos for domestic flights. Perfect for business trips.',
        price_points: 4000,
        stock_quantity: 10,
        category_id: categoryIds['TRAVEL'],
        featured: true,
        is_active: true
      },
      {
        product_name: 'Bus Ticket ₱500',
        product_description: 'Bus ticket worth 500 pesos for intercity travel. Convenient transportation.',
        price_points: 1000,
        stock_quantity: 30,
        category_id: categoryIds['TRAVEL'],
        featured: false,
        is_active: true
      },
      {
        product_name: 'Grab Voucher ₱300',
        product_description: 'Ride voucher worth 300 pesos for Grab transportation.',
        price_points: 600,
        stock_quantity: 50,
        category_id: categoryIds['TRAVEL'],
        featured: false,
        is_active: true
      }
    ];

    for (const product of products) {
      // Add required fields for compatibility with existing database schema
      const productWithAllFields = {
        ...product,
        name: product.product_name, // Add the name field
        price: product.price_points // Add the price field
      };
      await db('sl_shop_products').insert(productWithAllFields);
      console.log(`  ✅ ${product.product_name} - ${product.price_points} heartbits`);
    }

    // Display summary
    console.log('\n📊 Seeding Summary:');
    console.log(`  • Categories: ${categories.length}`);
    console.log(`  • Products: ${products.length}`);
    
    const totalStock = products.reduce((sum, p) => sum + p.stock_quantity, 0);
    const avgPrice = Math.round(products.reduce((sum, p) => sum + p.price_points, 0) / products.length);
    
    console.log(`  • Total Stock: ${totalStock} items`);
    console.log(`  • Average Price: ${avgPrice} heartbits`);

    // Test a few operations
    console.log('\n🧪 Testing CRUD operations...');
    
    const allProducts = await Suitebite.getAllProducts();
    console.log(`  ✅ getAllProducts(): Retrieved ${allProducts.length} products`);
    
    const allCategories = await Suitebite.getAllCategories();
    console.log(`  ✅ getAllCategories(): Retrieved ${allCategories.length} categories`);
    
    if (allProducts.length > 0) {
      const firstProduct = await Suitebite.getProductById(allProducts[0].product_id);
      console.log(`  ✅ getProductById(): Retrieved "${firstProduct.name}"`);
    }

    console.log('\n🎉 Suitebite data seeding completed successfully!');
    console.log('🛍️ Shop is ready for business!');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    throw error;
  }
}

// Run the seeding
seedSuitebiteData()
  .then(() => {
    console.log('\n✅ Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Database seeding failed:', error);
    process.exit(1);
  }); 