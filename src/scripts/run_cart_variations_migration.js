import { db } from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runCartVariationsMigration() {
  try {
    console.log('🔧 Running cart item variations migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'create_cart_item_variations_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split by semicolon to handle multiple statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.toLowerCase().includes('create table') || statement.toLowerCase().includes('create index')) {
        console.log('📋 Executing:', statement.substring(0, 50) + '...');
        await db.raw(statement);
      }
    }
    
    console.log('✅ Cart item variations migration completed successfully!');
    console.log('📝 Created table: sl_cart_item_variations');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await db.destroy();
  }
}

runCartVariationsMigration(); 