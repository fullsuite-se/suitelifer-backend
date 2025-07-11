-- Mood Logs Table Creation Script for MySQL Workbench (Without Foreign Key)
-- This script creates the mood logging table for the SuiteLife mood tracking feature
-- Run this script in MySQL Workbench connected to your database server

-- Set SQL mode and other session variables for compatibility
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

-- Use the dev_SuiteLifer schema
USE dev_SuiteLifer;

-- Verify we're in the correct schema
SELECT DATABASE() as 'Current Schema';

-- Check the user_id column type in sl_user_accounts table (for reference)
DESCRIBE `sl_user_accounts`;

-- Drop table if exists (for clean recreation)
DROP TABLE IF EXISTS `sl_mood_logs`;

-- Create mood logs table with all indexes included
CREATE TABLE `sl_mood_logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Reference to sl_user_accounts.user_id',
  `mood_level` TINYINT(1) NOT NULL CHECK (`mood_level` >= 1 AND `mood_level` <= 5) COMMENT 'Mood rating from 1 (very bad) to 5 (excellent)',
  `notes` TEXT DEFAULT NULL COMMENT 'Optional notes or comments about the mood entry',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_user_date` (`user_id`, `created_at`),
  KEY `idx_mood_level` (`mood_level`),
  KEY `idx_user_mood_date` (`user_id`, `mood_level`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores user mood tracking entries';

-- Verify table creation
SELECT 'Table sl_mood_logs created successfully!' as Result;

-- Show table structure
DESCRIBE `sl_mood_logs`;

-- Show table indexes
SHOW INDEX FROM `sl_mood_logs`;

-- Commit the transaction
COMMIT;

-- Optional test data insert (uncomment to add sample data)
/*
INSERT INTO `sl_mood_logs` (`user_id`, `mood_level`, `notes`) VALUES
('019614eb-5acf-700e-a7f3-295b59219714', 4, 'Feeling good today'),
('019614eb-5acf-700e-a7f3-295b59219714', 3, 'Neutral day'),
('019614eb-5acf-700e-a7f3-295b59219714', 5, 'Excellent day!');
*/

-- Instructions for MySQL Workbench:
-- 1. Connect to your MySQL server in MySQL Workbench
-- 2. Ensure the dev_SuiteLifer schema exists
-- 3. Execute this entire script by clicking the "Execute SQL Script" button (lightning bolt icon)
-- 4. Check the output panel for any errors
-- 5. Verify table creation by refreshing the schema in the Navigator panel

-- Notes:
-- - Foreign key constraint is intentionally omitted to avoid compatibility issues
-- - Application-level referential integrity should be maintained in the backend code
-- - All necessary indexes are included for optimal query performance
