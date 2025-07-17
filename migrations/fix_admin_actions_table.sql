-- ============================================================================
-- Migration: Fix sl_admin_actions table column sizes
-- Date: 2025-07-17
-- Description: Increase action_type and target_type column sizes to prevent truncation
-- ============================================================================

-- Check if table exists and alter column sizes
SELECT 'Updating sl_admin_actions table...' as message;

-- Alter the action_type column to be larger
ALTER TABLE `sl_admin_actions` 
MODIFY COLUMN `action_type` varchar(255) NOT NULL;

-- Alter the target_type column to be larger
ALTER TABLE `sl_admin_actions` 
MODIFY COLUMN `target_type` varchar(100) DEFAULT NULL;

SELECT 'sl_admin_actions table updated successfully!' as message;
