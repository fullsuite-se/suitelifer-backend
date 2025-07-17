import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

async function createAdminUser() {
  let conn;
  
  try {
    console.log('🔍 Connecting to database...');
    
    conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE
    });

    console.log('✅ Connected to database successfully');

    // Check if there are any admin users
    console.log('\n🔍 Checking for existing admin users...');
    
    const [adminUsers] = await conn.execute(`
      SELECT user_id, user_email, user_type, first_name, last_name, is_active, is_verified
      FROM sl_user_accounts 
      WHERE user_type IN ('ADMIN', 'SUPER_ADMIN')
      ORDER BY user_type DESC
    `);

    if (adminUsers.length > 0) {
      console.log(`\n✅ Found ${adminUsers.length} admin user(s):`);
      adminUsers.forEach(user => {
        console.log(`   • ${user.user_email} - ${user.user_type} (Active: ${user.is_active}, Verified: ${user.is_verified})`);
      });
      
      console.log('\n🎉 Admin users already exist. No need to create new ones.');
      return;
    }

    console.log('\n❌ No admin users found. Creating a default admin user...');

    // Create default admin user
    const adminEmail = 'admin@fullsuite.com.ph';
    const adminPassword = 'Admin123!'; // This should be changed after first login
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const adminUserData = {
      user_email: adminEmail,
      user_password: hashedPassword,
      first_name: 'System',
      last_name: 'Administrator',
      user_type: 'SUPER_ADMIN',
      is_active: true,
      is_verified: true,
      heartbits_balance: 0,
      monthly_heartbits_limit: 1000,
      created_at: new Date(),
      updated_at: new Date()
    };

    const [insertResult] = await conn.execute(`
      INSERT INTO sl_user_accounts (
        user_email, user_password, first_name, last_name, user_type,
        is_active, is_verified, heartbits_balance, monthly_heartbits_limit,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      adminUserData.user_email,
      adminUserData.user_password,
      adminUserData.first_name,
      adminUserData.last_name,
      adminUserData.user_type,
      adminUserData.is_active,
      adminUserData.is_verified,
      adminUserData.heartbits_balance,
      adminUserData.monthly_heartbits_limit,
      adminUserData.created_at,
      adminUserData.updated_at
    ]);

    console.log('\n✅ Admin user created successfully!');
    console.log('\n📋 Admin User Details:');
    console.log(`   • Email: ${adminEmail}`);
    console.log(`   • Password: ${adminPassword}`);
    console.log(`   • Role: SUPER_ADMIN`);
    console.log(`   • User ID: ${insertResult.insertId}`);
    
    console.log('\n⚠️  IMPORTANT SECURITY NOTICE:');
    console.log('   • Please log in and change the default password immediately');
    console.log('   • This default password should not be used in production');
    
    console.log('\n🎉 You can now access the Suitebite admin panel!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('\n💡 It looks like an admin user with this email already exists.');
      console.log('   Please check your database or use a different email.');
    }
  } finally {
    if (conn) {
      await conn.end();
      console.log('\n🔌 Database connection closed.');
    }
  }
}

// Run the script
createAdminUser(); 