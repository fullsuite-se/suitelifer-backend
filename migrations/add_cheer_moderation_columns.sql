-- Add moderation columns to sl_cheers table
-- Created: 2025-07-18
-- Purpose: Add missing moderation fields that are referenced in the code

ALTER TABLE `sl_cheers` 
ADD COLUMN `is_flagged` TINYINT(1) DEFAULT 0 COMMENT 'Whether this cheer has been flagged for review',
ADD COLUMN `is_visible` TINYINT(1) DEFAULT 1 COMMENT 'Whether this cheer is visible to users',
ADD COLUMN `is_hidden` TINYINT(1) DEFAULT 0 COMMENT 'Whether this cheer is hidden by moderators',
ADD COLUMN `is_warned` TINYINT(1) DEFAULT 0 COMMENT 'Whether this cheer has received a warning',
ADD COLUMN `warned_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'When this cheer was warned',
ADD COLUMN `warned_by` VARCHAR(36) NULL DEFAULT NULL COMMENT 'Which admin warned this cheer',
ADD COLUMN `warning_message` TEXT NULL DEFAULT NULL COMMENT 'Warning message for this cheer',
ADD COLUMN `moderated_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'When this cheer was moderated',
ADD COLUMN `moderated_by` VARCHAR(36) NULL DEFAULT NULL COMMENT 'Which admin moderated this cheer';

-- Add foreign key constraints for moderation fields
ALTER TABLE `sl_cheers`
ADD CONSTRAINT `fk_cheers_warned_by` FOREIGN KEY (`warned_by`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE SET NULL,
ADD CONSTRAINT `fk_cheers_moderated_by` FOREIGN KEY (`moderated_by`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE SET NULL;

-- Add indexes for moderation queries
CREATE INDEX `idx_cheers_flagged` ON `sl_cheers` (`is_flagged`, `is_visible`);
CREATE INDEX `idx_cheers_visible` ON `sl_cheers` (`is_visible`, `created_at`);
CREATE INDEX `idx_cheers_moderated` ON `sl_cheers` (`moderated_at`, `moderated_by`);
