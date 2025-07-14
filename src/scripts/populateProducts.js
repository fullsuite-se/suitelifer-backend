import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

class ProductPopulator {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      this.connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_DATABASE || process.env.DB_NAME || 'suitelifer_db',
      });
      console.log('✅ Connected to database successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.end();
      console.log('🔌 Database connection closed');
    }
  }

  async createCategories() {
    const categories = [
      {
        name: 'SWAGS',
        description: 'Branded company merchandise and apparel',
        sort_order: 1
      },
      {
        name: 'VOUCHERS',
        description: 'Gift vouchers and e-gift cards',
        sort_order: 2
      },
      {
        name: 'TRAVEL',
        description: 'Travel tickets and transportation vouchers',
        sort_order: 3
      }
    ];

    console.log('📁 Creating product categories...');
    
    for (const category of categories) {
      try {
        const [result] = await this.connection.execute(`
          INSERT INTO sl_shop_categories 
          (category_name, category_description, sort_order, is_active) 
          VALUES (?, ?, ?, true)
          ON DUPLICATE KEY UPDATE 
          category_description = VALUES(category_description),
          sort_order = VALUES(sort_order)
        `, [category.name, category.description, category.sort_order]);
        
        console.log(`   ✅ Category: ${category.name}`);
      } catch (error) {
        console.log(`   ⚠️ Category ${category.name} might already exist`);
      }
    }
  }

  async getCategoryId(categoryName) {
    const [rows] = await this.connection.execute(
      'SELECT category_id FROM sl_shop_categories WHERE category_name = ?',
      [categoryName]
    );
    return rows[0]?.category_id;
  }

  async createProducts() {
    const products = [
      // SWAGS Category
      {
        name: 'FS Sweater',
        description: 'Comfortable and stylish company sweater',
        price: 1500,
        category: 'SWAGS',
        stock: 50,
        featured: true
      },
      {
        name: 'FS Gym Bag',
        description: 'Durable gym bag perfect for workouts',
        price: 1000,
        category: 'SWAGS',
        stock: 30,
        featured: false
      },
      {
        name: 'FS Mug',
        description: 'Premium ceramic coffee mug',
        price: 250,
        category: 'SWAGS',
        stock: 100,
        featured: true
      },
      {
        name: 'FS Tee (Black)',
        description: 'Classic black company t-shirt',
        price: 500,
        category: 'SWAGS',
        stock: 75,
        featured: true
      },
      {
        name: 'FS Tee (White)',
        description: 'Classic white company t-shirt',
        price: 500,
        category: 'SWAGS',
        stock: 75,
        featured: true
      },
      {
        name: 'FS Powerbank',
        description: 'Portable power bank with company branding',
        price: 500,
        category: 'SWAGS',
        stock: 40,
        featured: false
      },
      {
        name: 'FS Polo Shirt',
        description: 'Professional polo shirt for work',
        price: 800,
        category: 'SWAGS',
        stock: 60,
        featured: false
      },
      {
        name: 'FS Windbreaker',
        description: 'Lightweight windbreaker jacket',
        price: 1500,
        category: 'SWAGS',
        stock: 25,
        featured: true
      },
      {
        name: 'FS Bucket Hat',
        description: 'Trendy bucket hat with company logo',
        price: 500,
        category: 'SWAGS',
        stock: 35,
        featured: false
      },

      // VOUCHERS Category
      {
        name: 'Tauceti Voucher ₱500',
        description: 'Tauceti restaurant voucher worth ₱500',
        price: 750,
        category: 'VOUCHERS',
        stock: 20,
        featured: true
      },
      {
        name: 'Starbucks eGift ₱500',
        description: 'Starbucks electronic gift card worth ₱500',
        price: 1000,
        category: 'VOUCHERS',
        stock: 30,
        featured: true
      },
      {
        name: 'Lazada Voucher ₱500',
        description: 'Lazada shopping voucher worth ₱500',
        price: 1000,
        category: 'VOUCHERS',
        stock: 25,
        featured: true
      },
      {
        name: 'Gym/Yoga Voucher ₱500',
        description: 'Fitness center voucher worth ₱500',
        price: 1000,
        category: 'VOUCHERS',
        stock: 15,
        featured: false
      },

      // TRAVEL Category
      {
        name: 'Airfare Ticket ₱2000',
        description: 'Airline ticket voucher worth ₱2000',
        price: 4000,
        category: 'TRAVEL',
        stock: 5,
        featured: true
      },
      {
        name: 'Bus Ticket ₱500',
        description: 'Bus transportation voucher worth ₱500',
        price: 1000,
        category: 'TRAVEL',
        stock: 10,
        featured: false
      }
    ];

    console.log('🛍️ Creating products...');
    
    for (const product of products) {
      try {
        const categoryId = await this.getCategoryId(product.category);
        if (!categoryId) {
          console.log(`   ❌ Category not found: ${product.category}`);
          continue;
        }

        const [result] = await this.connection.execute(`
          INSERT INTO sl_shop_products 
          (product_name, product_description, price_points, stock_quantity, 
           category_id, is_active, featured, sort_order) 
          VALUES (?, ?, ?, ?, ?, true, ?, 0)
          ON DUPLICATE KEY UPDATE 
          product_description = VALUES(product_description),
          price_points = VALUES(price_points),
          stock_quantity = VALUES(stock_quantity),
          featured = VALUES(featured)
        `, [
          product.name, 
          product.description, 
          product.price, 
          product.stock, 
          categoryId, 
          product.featured
        ]);
        
        console.log(`   ✅ ${product.name} - ${product.price} heartbits`);
      } catch (error) {
        console.log(`   ⚠️ Product ${product.name} might already exist or error occurred`);
      }
    }
  }

  async showSummary() {
    console.log('\n📊 Product Summary:');
    
    const [categoryStats] = await this.connection.execute(`
      SELECT 
        c.category_name,
        COUNT(p.product_id) as product_count,
        MIN(p.price_points) as min_price,
        MAX(p.price_points) as max_price,
        SUM(p.stock_quantity) as total_stock
      FROM sl_shop_categories c
      LEFT JOIN sl_shop_products p ON c.category_id = p.category_id AND p.is_active = true
      GROUP BY c.category_id, c.category_name
      ORDER BY c.sort_order
    `);

    categoryStats.forEach(stat => {
      console.log(`\n${stat.category_name}:`);
      console.log(`  📦 Products: ${stat.product_count}`);
      console.log(`  💰 Price Range: ${stat.min_price || 0} - ${stat.max_price || 0} heartbits`);
      console.log(`  📊 Total Stock: ${stat.total_stock || 0} items`);
    });

    const [totalStats] = await this.connection.execute(`
      SELECT 
        COUNT(*) as total_products,
        SUM(stock_quantity) as total_stock,
        AVG(price_points) as avg_price
      FROM sl_shop_products 
      WHERE is_active = true
    `);

    console.log(`\n🎯 Overall Stats:`);
    console.log(`  📦 Total Products: ${totalStats[0].total_products}`);
    console.log(`  📊 Total Stock: ${totalStats[0].total_stock}`);
    console.log(`  💰 Average Price: ${Math.round(totalStats[0].avg_price)} heartbits`);
  }
}

async function populateProducts() {
  const populator = new ProductPopulator();
  
  try {
    console.log('🚀 Starting Suitebite Product Population...\n');
    
    await populator.connect();
    await populator.createCategories();
    await populator.createProducts();
    await populator.showSummary();
    
    console.log('\n✅ Product population completed successfully!');
    console.log('🎉 Suitebite shop is ready for business!');
    
  } catch (error) {
    console.error('\n💥 Product population failed:', error);
    process.exit(1);
  } finally {
    await populator.disconnect();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  populateProducts();
}

export { populateProducts }; 