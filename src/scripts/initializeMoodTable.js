import { db } from "../config/db.js";

// Database initialization script for mood tracking
export const initializeMoodTable = async () => {
  try {
    console.log('Initializing mood tracking table...');
    
    // Create the mood logs table
    await db.schema.createTable('sl_mood_logs', (table) => {
      table.increments('id').primary();
      table.string('user_id', 255).notNullable();
      table.tinyint('mood_level').notNullable().checkBetween([1, 5]);
      table.text('notes').nullable();
      table.timestamps(true, true);
      
      // Indexes
      table.index('user_id', 'idx_user_id');
      table.index('created_at', 'idx_created_at');
      table.index(['user_id', 'created_at'], 'idx_user_date');
      table.index('mood_level', 'idx_mood_level');
      table.index(['user_id', 'mood_level', 'created_at'], 'idx_user_mood_date');
      
      // Foreign key constraint
      table.foreign('user_id').references('user_id').inTable('sl_user_accounts').onDelete('CASCADE').onUpdate('CASCADE');
    });
    
    console.log('Mood tracking table created successfully!');
    
  } catch (error) {
    if (error.code === 'ER_TABLE_EXISTS_ERROR') {
      console.log('Mood tracking table already exists.');
    } else {
      console.error('Error creating mood tracking table:', error);
      throw error;
    }
  }
};

// Run this script directly if called from command line
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeMoodTable()
    .then(() => {
      console.log('Database initialization completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database initialization failed:', error);
      process.exit(1);
    });
}
