import { db } from './src/config/db.js';

const checkAllTables = async () => {
  console.log('=== Checking All Tables ===');
  
  try {
    const tables = await db.raw('SHOW TABLES');
    console.log('Available tables:');
    tables[0].forEach(table => {
      console.log(' -', Object.values(table)[0]);
    });
    
    // Check if users table exists with different casing
    const userTables = await db.raw("SHOW TABLES LIKE '%user%'");
    console.log('\nUser-related tables:');
    userTables[0].forEach(table => {
      console.log(' -', Object.values(table)[0]);
    });
    
  } catch (error) {
    console.error('❌ Error checking tables:', error.message);
  } finally {
    await db.destroy();
  }
};

checkAllTables();
