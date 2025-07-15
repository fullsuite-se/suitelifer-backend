#!/usr/bin/env node

import { db } from '../config/db.js';

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    const result = await db.raw('SELECT 1 as test');
    console.log('✅ Database connection successful:', result[0]);
    
    // Check if mood table exists
    console.log('\n🔍 Checking if sl_mood_logs table exists...');
    const tableExists = await db.schema.hasTable('sl_mood_logs');
    console.log('sl_mood_logs table exists:', tableExists);
    
    if (tableExists) {
      // Check table structure
      console.log('\n🔍 Checking table structure...');
      const columns = await db.raw('DESCRIBE sl_mood_logs');
      console.log('Table columns:', columns[0]);
      
      // Check if there are any existing records
      console.log('\n🔍 Checking existing mood logs...');
      const count = await db('sl_mood_logs').count('* as total');
      console.log('Total mood logs:', count[0].total);
      
      // Show sample data if any exists
      if (count[0].total > 0) {
        const sampleData = await db('sl_mood_logs').limit(3).select('*');
        console.log('Sample data:', sampleData);
      }
    } else {
      console.log('❌ sl_mood_logs table does not exist. Please run the createMoodTable.sql script in MySQL Workbench.');
    }
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Make sure MySQL server is running and the database credentials are correct.');
    }
  } finally {
    await db.destroy();
    console.log('\n🔒 Database connection closed.');
  }
}

// Run the test
testDatabaseConnection().catch(console.error);
