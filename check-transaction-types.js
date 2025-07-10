#!/usr/bin/env node

// Check transaction types in the database
import { db } from './src/config/db.js';

async function checkTransactionTypes() {
  console.log('🔍 Checking transaction types in database...\n');
  
  try {
    // Get distinct transaction types
    const types = await db('sl_transactions').distinct('type').select('type');
    console.log('Available transaction types:', types.map(t => t.type));
    
    // Get sample transactions with their types
    const samples = await db('sl_transactions').select('*').limit(5);
    console.log('\nSample transactions:');
    samples.forEach((t, i) => {
      console.log(`   ${i+1}. Type: ${t.type}, Amount: ${t.amount}, From: ${t.from_user_id}, To: ${t.to_user_id}`);
    });
    
  } catch (error) {
    console.error('❌ Failed to check transaction types:', error);
  }
  
  process.exit(0);
}

checkTransactionTypes();
