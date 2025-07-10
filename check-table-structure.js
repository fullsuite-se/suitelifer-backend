import { db } from './src/config/db.js';

async function checkTableStructure() {
  try {
    console.log('🔍 Checking table structures...');
    
    // Check sl_user_accounts structure
    console.log('\n📋 sl_user_accounts table structure:');
    const userColumns = await db.raw('DESCRIBE sl_user_accounts');
    console.log(userColumns[0]);
    
    // Get a sample record to see what data looks like
    console.log('\n📄 Sample sl_user_accounts record:');
    const sampleUser = await db('sl_user_accounts').limit(1);
    console.log(sampleUser[0]);
    
    await db.destroy();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkTableStructure();
