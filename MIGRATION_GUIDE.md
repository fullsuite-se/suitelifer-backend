# Cheer Schema Migration Guide

## Overview
This guide will help you migrate from the old cheer schema to your teammate's new schema. The migration involves transitioning from `sl_cheer_post` to `sl_cheers` and updating related tables.

## ⚠️ Important Notes
- **ALWAYS backup your data before migration**
- Test the migration in a development environment first
- The migration is irreversible without a backup
- Make sure your application is stopped during migration

## Migration Steps

### Step 1: Backup Current Data
```bash
npm run backup-cheer-data
```
This creates a backup file in the `backups/` directory with timestamp.

### Step 2: Run Migration
```bash
npm run migrate-cheer-schema
```
This will:
- Create new tables (`sl_cheers`, `sl_transactions`, `sl_user_points`)
- Migrate data from old to new schema
- Update foreign key constraints
- Preserve all existing data

### Step 3: Verify Migration
Check that all data has been migrated correctly:
```sql
-- Check cheer posts
SELECT COUNT(*) FROM sl_cheers;

-- Check transactions
SELECT COUNT(*) FROM sl_transactions;

-- Check user points
SELECT COUNT(*) FROM sl_user_points;
```

## Rollback (If Needed)
If something goes wrong, you can rollback to the previous state:
```bash
npm run rollback-cheer-migration
```

Or specify a specific backup file:
```bash
node src/scripts/rollbackCheerMigration.js backups/cheer_backup_2025-01-27T10-30-00-000Z.json
```

## Schema Changes

### Old Schema → New Schema
| Old Table | New Table | Changes |
|-----------|-----------|---------|
| `sl_cheer_post` | `sl_cheers` | `cheer_post_id` → `cheer_id`, `cheerer_id` → `from_user_id`, `peer_id` → `to_user_id` |
| `sl_user_heartbits` | `sl_user_points` | `heartbits_balance` → `available_points`, added monthly limits |
| `sl_heartbits_transactions` | `sl_transactions` | Enhanced transaction types and metadata |
| `sl_cheer_designation` | *Removed* | Simplified to 1-to-1 cheers |

### New Features
- **Monthly cheer limits**: Users have monthly limits for giving cheers
- **Enhanced transactions**: Better tracking of all point movements
- **Simplified structure**: Easier to maintain and understand

## Data Migration Details

### Cheer Posts Migration
- Each `sl_cheer_post` record becomes a `sl_cheers` record
- Creates two transaction records (given/received) for each cheer
- Updates comments and likes to reference new `cheer_id`

### User Points Migration
- `heartbits_balance` → `available_points`
- `total_heartbits_earned` → `total_earned`
- `total_heartbits_spent` → `total_spent`
- Adds monthly limit tracking

### Transaction Migration
- Maps old transaction types to new ones
- Preserves all metadata and timestamps
- Creates comprehensive audit trail

## Post-Migration Tasks

### 1. Update Application Code
You'll need to update your application code to use the new schema:

**Old code:**
```javascript
// Old cheer post creation
await db("sl_cheer_post").insert({
  cheer_post_id: uuidv7(),
  cheerer_id: userId,
  peer_id: targetUserId,
  heartbits_given: points,
  cheer_message: message
});
```

**New code:**
```javascript
// New cheer creation
const cheerId = uuidv7();
await db("sl_cheers").insert({
  cheer_id: cheerId,
  from_user_id: userId,
  to_user_id: targetUserId,
  points: points,
  message: message
});

// Create transactions
await db("sl_transactions").insert([
  {
    transaction_id: uuidv7(),
    from_user_id: userId,
    to_user_id: targetUserId,
    type: "given",
    amount: points,
    description: `Cheered ${points} points`,
    message: message,
    metadata: JSON.stringify({ type: "cheer", cheer_id: cheerId })
  },
  {
    transaction_id: uuidv7(),
    from_user_id: userId,
    to_user_id: targetUserId,
    type: "received",
    amount: points,
    description: `Received ${points} points from cheer`,
    message: message,
    metadata: JSON.stringify({ type: "cheer", cheer_id: cheerId })
  }
]);
```

### 2. Update Models
Update your `suitebiteModel.js` to use the new table names and structure.

### 3. Update Frontend
Update any frontend code that references the old schema.

## Troubleshooting

### Common Issues

1. **Foreign Key Constraint Errors**
   - Make sure all referenced users exist in `sl_user_accounts`
   - Check that cheer IDs are properly migrated

2. **Duplicate Data**
   - The migration script handles duplicates, but check for any issues
   - Verify transaction counts match

3. **Missing Data**
   - Check backup files for any missing records
   - Verify all cheer posts were migrated

### Recovery Steps

1. **If migration fails mid-way:**
   ```bash
   npm run rollback-cheer-migration
   # Fix the issue
   npm run migrate-cheer-schema
   ```

2. **If data is corrupted:**
   ```bash
   npm run rollback-cheer-migration
   # Restore from backup
   node src/scripts/restoreFromBackup.js backups/your-backup-file.json
   ```

## Verification Checklist

After migration, verify:

- [ ] All cheer posts migrated (`sl_cheers` count matches old `sl_cheer_post` count)
- [ ] All comments migrated (check `sl_cheer_comments` foreign keys)
- [ ] All likes migrated (check `sl_cheer_likes` foreign keys)
- [ ] All user points migrated (`sl_user_points` has all users)
- [ ] All transactions migrated (`sl_transactions` count is correct)
- [ ] Application can create new cheers
- [ ] Application can view existing cheers
- [ ] Points system works correctly

## Support

If you encounter issues during migration:
1. Check the console output for specific error messages
2. Verify your database connection and permissions
3. Ensure all required tables exist
4. Check that backup files are created successfully

## Files Created

- `src/scripts/backupCheerData.js` - Backup script
- `src/scripts/migrateToNewCheerSchema.js` - Migration script
- `src/scripts/rollbackCheerMigration.js` - Rollback script
- `MIGRATION_GUIDE.md` - This guide
- `backups/` - Directory for backup files 