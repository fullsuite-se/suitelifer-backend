import { db } from "../config/db.js";

const addModerationColumns = async () => {
  console.log("🚀 Adding moderation columns to sl_cheers table...");
  
  try {
    // Add moderation columns to sl_cheers table
    const columns = [
      {
        name: 'is_hidden',
        definition: 'TINYINT(1) DEFAULT 0'
      },
      {
        name: 'is_flagged',
        definition: 'TINYINT(1) DEFAULT 0'
      },
      {
        name: 'is_reported',
        definition: 'TINYINT(1) DEFAULT 0'
      },
      {
        name: 'moderation_reason',
        definition: 'TEXT DEFAULT NULL'
      },
      {
        name: 'moderated_by',
        definition: 'VARCHAR(36) DEFAULT NULL'
      },
      {
        name: 'moderated_at',
        definition: 'TIMESTAMP NULL DEFAULT NULL'
      }
    ];

    for (const column of columns) {
      try {
        await db.raw(`ALTER TABLE sl_cheers ADD COLUMN ${column.name} ${column.definition}`);
        console.log(`✅ Added column: ${column.name}`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`ℹ️  Column ${column.name} already exists`);
        } else {
          console.error(`❌ Error adding column ${column.name}:`, error.message);
        }
      }
    }

    // Add foreign key constraint for moderated_by
    try {
      await db.raw(`
        ALTER TABLE sl_cheers 
        ADD CONSTRAINT fk_cheers_moderated_by 
        FOREIGN KEY (moderated_by) REFERENCES sl_user_accounts(user_id) ON DELETE SET NULL
      `);
      console.log("✅ Added foreign key constraint for moderated_by");
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log("ℹ️  Foreign key constraint already exists");
      } else {
        console.error("❌ Error adding foreign key constraint:", error.message);
      }
    }

    console.log("🎉 Moderation columns added successfully!");
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
};

// Run the migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  addModerationColumns()
    .then(() => {
      console.log("✅ Migration completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Migration failed:", error);
      process.exit(1);
    });
}

export default addModerationColumns; 