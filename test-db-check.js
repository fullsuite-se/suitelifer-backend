import { db } from './src/config/db.js';

const testDatabaseConnection = async () => {
  console.log('=== Database Connection Test ===');
  
  try {
    // Test basic database connection
    const result = await db.raw('SELECT 1 as test');
    console.log('✅ Database connection successful:', result[0]);
    
    // Test if the users table exists and has some data structure we expect
    const tableExists = await db.raw("SHOW TABLES LIKE 'users'");
    console.log('✅ Users table exists:', tableExists[0].length > 0);
    
    // Check verification_codes table
    const verificationTableExists = await db.raw("SHOW TABLES LIKE 'verification_codes'");
    console.log('✅ Verification codes table exists:', verificationTableExists[0].length > 0);
    
    if (verificationTableExists[0].length > 0) {
      const verifyStructure = await db.raw("DESCRIBE verification_codes");
      console.log('Verification codes table structure:', verifyStructure[0]);
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await db.destroy();
  }
};

testDatabaseConnection();
