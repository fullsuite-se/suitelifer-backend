-- Mood Logs Table Creation Script
-- This script creates the mood logging table for the SuiteLife mood tracking feature

CREATE TABLE IF NOT EXISTS `sl_mood_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) NOT NULL,
  `mood_level` tinyint(1) NOT NULL CHECK (`mood_level` >= 1 AND `mood_level` <= 5),
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_user_date` (`user_id`, `created_at`),
  CONSTRAINT `fk_mood_user` FOREIGN KEY (`user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for better performance
CREATE INDEX `idx_mood_level` ON `sl_mood_logs` (`mood_level`);
CREATE INDEX `idx_user_mood_date` ON `sl_mood_logs` (`user_id`, `mood_level`, `created_at`);

-- Add comments for documentation
ALTER TABLE `sl_mood_logs` COMMENT = 'Stores user mood tracking entries';
ALTER TABLE `sl_mood_logs` MODIFY COLUMN `mood_level` tinyint(1) NOT NULL COMMENT 'Mood rating from 1 (very bad) to 5 (excellent)';
ALTER TABLE `sl_mood_logs` MODIFY COLUMN `notes` text DEFAULT NULL COMMENT 'Optional notes or comments about the mood entry';
ALTER TABLE `sl_mood_logs` MODIFY COLUMN `user_id` varchar(255) NOT NULL COMMENT 'Foreign key reference to sl_user_accounts.user_id';

-- Insert sample data (optional - remove in production)
-- INSERT INTO `sl_mood_logs` (`user_id`, `mood_level`, `notes`) VALUES
-- ('019614eb-5acf-700e-a7f3-295b59219714', 4, 'Feeling good today, productive morning'),
-- ('019614eb-5acf-700e-a7f3-295b59219714', 3, 'Neutral day, nothing special'),
-- ('019614eb-5acf-700e-a7f3-295b59219714', 5, 'Excellent day! Team meeting went well');
