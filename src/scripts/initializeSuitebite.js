import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Initialize Suitebite system with database setup and configuration
 */
class SuitebiteInitializer {
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
        multipleStatements: true
      });
      console.log('Connected to database successfully');
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.end();
      console.log('Database connection closed');
    }
  }

  async executeSQLFile(filePath) {
    try {
      const fullPath = path.resolve(__dirname, '..', '..', filePath);
      console.log(`Executing SQL file: ${fullPath}`);
      
      if (!fs.existsSync(fullPath)) {
        throw new Error(`SQL file not found: ${fullPath}`);
      }

      const sql = fs.readFileSync(fullPath, 'utf8');
      
      if (!sql.trim()) {
        console.log(`SQL file is empty: ${filePath}`);
        return;
      }

      // Split SQL into individual statements and execute one by one
      const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i].trim();
        if (statement) {
          try {
            // Use query instead of execute for certain statements that don't support prepared statements
            if (statement.toUpperCase().startsWith('USE') || 
                statement.toUpperCase().startsWith('DELIMITER') ||
                statement.includes('TRIGGER') ||
                statement.includes('PROCEDURE')) {
              await this.connection.query(statement);
            } else {
              await this.connection.execute(statement);
            }
          } catch (error) {
            // Log warning for non-critical errors (like column already exists)
            if (error.code === 'ER_DUP_FIELDNAME' || error.code === 'ER_TABLE_EXISTS_ERROR' || error.code === 'ER_DUP_KEYNAME') {
              console.log(`Warning: ${error.message} (continuing...)`);
            } else if (error.code === 'ER_PARSE_ERROR' && statement.includes('IF NOT EXISTS')) {
              console.log(`Warning: IF NOT EXISTS syntax not supported, trying alternative approach...`);
              // Try without IF NOT EXISTS for some statements
              const altStatement = statement.replace(/IF NOT EXISTS/g, '');
              try {
                if (altStatement.toUpperCase().startsWith('USE') || 
                    altStatement.toUpperCase().startsWith('DELIMITER') ||
                    altStatement.includes('TRIGGER') ||
                    altStatement.includes('PROCEDURE')) {
                  await this.connection.query(altStatement);
                } else {
                  await this.connection.execute(altStatement);
                }
              } catch (altError) {
                if (altError.code === 'ER_TABLE_EXISTS_ERROR' || altError.code === 'ER_DUP_FIELDNAME') {
                  console.log(`Warning: ${altError.message} (continuing...)`);
                } else {
                  throw altError;
                }
              }
            } else {
              throw error;
            }
          }
        }
      }
      
      console.log(`Successfully executed: ${filePath}`);
    } catch (error) {
      console.error(`Error executing ${filePath}:`, error);
      throw error;
    }
  }

  async checkTableExists(tableName) {
    try {
      const [rows] = await this.connection.execute(
        'SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = ?',
        [process.env.DB_DATABASE || process.env.DB_NAME || 'suitelifer_db', tableName]
      );
      return rows[0].count > 0;
    } catch (error) {
      console.error(`Error checking table ${tableName}:`, error);
      return false;
    }
  }

  async verifyInstallation() {
    console.log('\n=== Verifying Suitebite Installation ===');
    
    const requiredTables = [
      'sl_cheer_post',
      'sl_shop_products',
      'sl_shop_categories', 
      'sl_carts',
      'sl_orders',
      'sl_order_items',
      'sl_heartbits_transactions',
      'sl_monthly_limits',
      'sl_admin_actions',
      'sl_system_config',
      'sl_admin_permissions',
      'sl_admin_roles'
    ];

    let allTablesExist = true;
    for (const table of requiredTables) {
      const exists = await this.checkTableExists(table);
      console.log(`${table}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
      if (!exists) allTablesExist = false;
    }

    // Check system configuration
    try {
      const [configRows] = await this.connection.execute(
        'SELECT COUNT(*) as count FROM sl_system_config'
      );
      console.log(`System configurations: ${configRows[0].count} entries`);

      const [adminRows] = await this.connection.execute(
        'SELECT COUNT(*) as count FROM sl_user_accounts WHERE user_type = "SUPER_ADMIN"'
      );
      console.log(`Super admin accounts: ${adminRows[0].count}`);

      const [productRows] = await this.connection.execute(
        'SELECT COUNT(*) as count FROM sl_shop_products'
      );
      console.log(`Sample products: ${productRows[0].count}`);

    } catch (error) {
      console.error('Error checking data:', error);
      allTablesExist = false;
    }

    return allTablesExist;
  }

  async createSampleData() {
    console.log('\n=== Creating Additional Sample Data ===');
    
    try {
      // Add sample cheer posts (if users exist)
      const [users] = await this.connection.execute(
        'SELECT user_id FROM sl_user_accounts WHERE user_type IN ("EMPLOYEE", "ADMIN") LIMIT 5'
      );

      if (users.length >= 2) {
        const sampleCheers = [
          {
            cheerer_id: users[0].user_id,
            cheeree_id: users[1].user_id,
            message: 'Great job on the project presentation! Your attention to detail was impressive.',
            heartbits: 15,
            type: 'recognition'
          },
          {
            cheerer_id: users[1].user_id,
            cheeree_id: users[0].user_id,
            message: 'Thanks for helping me debug that issue. You saved the day!',
            heartbits: 10,
            type: 'general'
          }
        ];

        for (const cheer of sampleCheers) {
          await this.connection.execute(
            'INSERT INTO sl_cheer_post (cheerer_id, cheeree_id, cheer_message, heartbits_given, cheer_type) VALUES (?, ?, ?, ?, ?)',
            [cheer.cheerer_id, cheer.cheeree_id, cheer.message, cheer.heartbits, cheer.type]
          );
        }
        console.log('Sample cheer posts created');
      }

      // Add sample cart items (if products exist)
      const [products] = await this.connection.execute(
        'SELECT product_id FROM sl_shop_products LIMIT 2'
      );

      if (products.length > 0 && users.length > 0) {
        // Create a cart for the user first
        const [cartResult] = await this.connection.execute(
          'INSERT IGNORE INTO sl_carts (user_id, created_at) VALUES (?, NOW())',
          [users[0].user_id]
        );
        
        // Get the cart_id (either newly created or existing)
        const [cartData] = await this.connection.execute(
          'SELECT cart_id FROM sl_carts WHERE user_id = ? LIMIT 1',
          [users[0].user_id]
        );
        
        if (cartData.length > 0) {
          // Add item to cart_items table
          await this.connection.execute(
            'INSERT IGNORE INTO sl_cart_items (cart_id, product_id, quantity, added_at) VALUES (?, ?, ?, NOW())',
            [cartData[0].cart_id, products[0].product_id, 1]
        );
        console.log('Sample cart items created');
        }
      }

    } catch (error) {
      console.error('Error creating sample data:', error);
    }
  }

  async showSetupSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('🎉 SUITEBITE SETUP COMPLETE! 🎉');
    console.log('='.repeat(60));
    
    try {
      // Get super admin details
      const [adminData] = await this.connection.execute(
        'SELECT user_email FROM sl_user_accounts WHERE user_type = "SUPER_ADMIN" LIMIT 1'
      );

      if (adminData.length > 0) {
        console.log('\n📧 SUPER ADMIN LOGIN:');
        console.log(`   Email: ${adminData[0].user_email}`);
        console.log(`   Password: SuperAdmin123!`);
        console.log(`   ⚠️  IMPORTANT: Change this password immediately!`);
      }

      // Get system stats
      const [tableStats] = await this.connection.execute(`
        SELECT 
          (SELECT COUNT(*) FROM sl_shop_products) as products,
          (SELECT COUNT(*) FROM sl_shop_categories) as categories,
          (SELECT COUNT(*) FROM sl_system_config) as configs,
          (SELECT COUNT(*) FROM sl_admin_permissions) as permissions,
          (SELECT COUNT(*) FROM sl_admin_roles) as roles
      `);

      console.log('\n📊 SYSTEM SUMMARY:');
      console.log(`   Products: ${tableStats[0].products}`);
      console.log(`   Categories: ${tableStats[0].categories}`);
      console.log(`   System Configs: ${tableStats[0].configs}`);
      console.log(`   Admin Permissions: ${tableStats[0].permissions}`);
      console.log(`   Admin Roles: ${tableStats[0].roles}`);

      console.log('\n🚀 NEXT STEPS:');
      console.log('   1. Start your backend server: npm start');
      console.log('   2. Login as super admin and change password');
      console.log('   3. Create regular admin accounts');
      console.log('   4. Configure system settings');
      console.log('   5. Add more products to the shop');
      console.log('   6. Test the employee experience');

      console.log('\n📚 DOCUMENTATION:');
      console.log('   - Admin features: See SUITEBITE_ADMIN_MANAGEMENT.md');
      console.log('   - API endpoints: Check the routes files');
      console.log('   - Database schema: Review database_setup_suitebite.sql');

    } catch (error) {
      console.error('Error generating summary:', error);
    }

    console.log('\n' + '='.repeat(60));
  }
}

/**
 * Main initialization function
 */
async function initializeSuitebite() {
  const initializer = new SuitebiteInitializer();
  
  try {
    console.log('🚀 Starting Suitebite Initialization...\n');
    
    // Connect to database
    await initializer.connect();
    
    // Execute database setup scripts
    console.log('📊 Setting up database tables...');
    await initializer.executeSQLFile('database_setup_suitebite_simple.sql');
    
    console.log('👑 Setting up super admin and advanced features...');
    await initializer.executeSQLFile('database_superadmin_setup.sql');
    
    // Create additional sample data
    await initializer.createSampleData();
    
    // Verify installation
    const isValid = await initializer.verifyInstallation();
    
    if (isValid) {
      await initializer.showSetupSummary();
    } else {
      console.log('\n❌ Installation verification failed. Please check the logs above.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n💥 Initialization failed:', error);
    process.exit(1);
  } finally {
    await initializer.disconnect();
  }
}

// Run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeSuitebite();
}

export default initializeSuitebite; 