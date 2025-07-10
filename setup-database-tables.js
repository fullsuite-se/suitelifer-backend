import { db } from './src/config/db.js';

async function checkAndCreateTables() {
  try {
    console.log('🔍 Checking existing tables...');
    
    // Check what tables exist
    const tables = await db.raw(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
    `);
    
    console.log('📋 Existing tables:');
    tables[0].forEach(table => {
      console.log(`  - ${table.TABLE_NAME}`);
    });
    
    // Check if user_points table exists
    const userPointsExists = tables[0].some(table => table.TABLE_NAME === 'user_points');
    
    if (!userPointsExists) {
      console.log('\n❌ user_points table missing. Creating it...');
      
      await db.schema.createTable('user_points', (table) => {
        table.increments('id').primary();
        table.integer('user_id').notNullable();
        table.integer('points').defaultTo(0); // Spendable points from received cheers
        table.integer('monthly_cheer_limit').defaultTo(100); // Monthly heartbits allocation
        table.integer('monthly_cheer_used').defaultTo(0); // Heartbits used this month
        table.date('last_reset_date').defaultTo(db.fn.now()); // Last monthly reset
        table.timestamps(true, true);
        
        // Foreign key constraint
        table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
        
        // Unique constraint
        table.unique(['user_id']);
      });
      
      console.log('✅ user_points table created successfully!');
    } else {
      console.log('✅ user_points table already exists');
    }
    
    // Check if transactions table exists
    const transactionsExists = tables[0].some(table => table.TABLE_NAME === 'transactions');
    
    if (!transactionsExists) {
      console.log('\n❌ transactions table missing. Creating it...');
      
      await db.schema.createTable('transactions', (table) => {
        table.string('transaction_id').primary();
        table.integer('from_user_id');
        table.integer('to_user_id').notNullable();
        table.enum('type', ['given', 'received', 'purchase', 'refund']).notNullable();
        table.integer('amount').notNullable();
        table.text('description');
        table.text('message');
        table.json('metadata');
        table.timestamps(true, true);
        
        // Foreign key constraints
        table.foreign('from_user_id').references('id').inTable('users').onDelete('CASCADE');
        table.foreign('to_user_id').references('id').inTable('users').onDelete('CASCADE');
        
        // Indexes
        table.index(['from_user_id']);
        table.index(['to_user_id']);
        table.index(['type']);
        table.index(['created_at']);
      });
      
      console.log('✅ transactions table created successfully!');
    } else {
      console.log('✅ transactions table already exists');
    }
    
    // Check if cheers table exists
    const cheersExists = tables[0].some(table => table.TABLE_NAME === 'cheers');
    
    if (!cheersExists) {
      console.log('\n❌ cheers table missing. Creating it...');
      
      await db.schema.createTable('cheers', (table) => {
        table.string('cheer_id').primary();
        table.integer('from_user_id').notNullable();
        table.integer('to_user_id').notNullable();
        table.integer('points').notNullable();
        table.text('message');
        table.integer('like_count').defaultTo(0);
        table.integer('comment_count').defaultTo(0);
        table.timestamps(true, true);
        
        // Foreign key constraints
        table.foreign('from_user_id').references('id').inTable('users').onDelete('CASCADE');
        table.foreign('to_user_id').references('id').inTable('users').onDelete('CASCADE');
        
        // Indexes
        table.index(['from_user_id']);
        table.index(['to_user_id']);
        table.index(['created_at']);
      });
      
      console.log('✅ cheers table created successfully!');
    } else {
      console.log('✅ cheers table already exists');
    }
    
    console.log('\n🎉 Database setup complete!');
    console.log('\nTesting a query on user_points...');
    
    const testQuery = await db('user_points').limit(1);
    console.log('✅ user_points table is accessible:', testQuery);
    
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
  } finally {
    process.exit(0);
  }
}

checkAndCreateTables();
