-- ============================================================================
-- SUITELIFER DATABASE MIGRATION SCRIPT
-- ============================================================================
-- 
-- Purpose: Migrate Stackhero database to complete schema with new features
-- Source: suitelifer_stackhero_schema.sql (24 tables)
-- Target: suitelifer_complete_schema.sql (57 tables)
-- 
-- New Features Added:
-- - E-commerce system (14 tables)
-- - Cheer/Peer recognition (5 tables)
-- - Points & Heartbits system (5 tables)
-- - Analytics & Statistics (4 tables)
-- - Enhanced admin system (4 tables)
-- - Mood tracking (1 table)
-- 
-- Migration Date: December 2024
-- ============================================================================

-- Set MySQL mode for compatibility
SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO';

-- ============================================================================
-- STEP 1: UPDATE EXISTING TABLES
-- ============================================================================

-- Update sl_user_accounts table
ALTER TABLE `sl_user_accounts` 
  MODIFY COLUMN `user_id` varchar(36) NOT NULL,
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  ADD KEY `idx_user_email` (`user_email`),
  ADD KEY `idx_user_type` (`user_type`),
  ADD KEY `idx_user_active` (`is_active`),
  ADD KEY `idx_users_active` (`is_active`,`user_id`);

-- Update sl_audit_logs table
ALTER TABLE `sl_audit_logs` 
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Update sl_verification_codes table
ALTER TABLE `sl_verification_codes` 
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Update sl_content table
ALTER TABLE `sl_content` 
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Update sl_employee_blogs table
ALTER TABLE `sl_employee_blogs` 
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Update sl_employee_blog_images table
ALTER TABLE `sl_employee_blog_images` 
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Update sl_eblog_comments table
ALTER TABLE `sl_eblog_comments` 
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Update sl_eblog_likes table
ALTER TABLE `sl_eblog_likes` 
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Update sl_events table
ALTER TABLE `sl_events` 
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Update sl_faqs table
ALTER TABLE `sl_faqs` 
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Update sl_contact table
ALTER TABLE `sl_contact` 
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Update sl_courses table
ALTER TABLE `sl_courses` 
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Update sl_certifications table
ALTER TABLE `sl_certifications` 
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Update sl_personality_tests table
ALTER TABLE `sl_personality_tests` 
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Update sl_spotify_embeds table
ALTER TABLE `sl_spotify_embeds` 
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Update sl_privacy_policy table
ALTER TABLE `sl_privacy_policy` 
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Update sl_terms_of_use table
ALTER TABLE `sl_terms_of_use` 
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Update sl_testimonials table
ALTER TABLE `sl_testimonials` 
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Update sl_job_industries table
ALTER TABLE `sl_job_industries` 
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Update sl_company_jobs_setups table
ALTER TABLE `sl_company_jobs_setups` 
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Update sl_company_jobs table
ALTER TABLE `sl_company_jobs` 
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Update sl_newsletter_issues table
ALTER TABLE `sl_newsletter_issues` 
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Update sl_newsletters table
ALTER TABLE `sl_newsletters` 
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Update sl_newsletter_images table
ALTER TABLE `sl_newsletter_images` 
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================================================
-- STEP 2: CREATE NEW TABLES - E-COMMERCE SYSTEM
-- ============================================================================

-- Shop Categories
CREATE TABLE `sl_shop_categories` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `category_name` (`category_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Products
CREATE TABLE `sl_products` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `description` text,
  `image_url` varchar(255) DEFAULT NULL,
  `price_points` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `images_json` json DEFAULT NULL COMMENT 'Array of image URLs for quick access',
  PRIMARY KEY (`product_id`),
  UNIQUE KEY `unique_product_slug` (`slug`),
  KEY `idx_products_category` (`category_id`),
  KEY `idx_products_active` (`is_active`),
  KEY `idx_products_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `sl_shop_categories` (`category_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Variation Types
CREATE TABLE `sl_variation_types` (
  `variation_type_id` int NOT NULL AUTO_INCREMENT,
  `type_name` varchar(50) NOT NULL,
  `sort_order` int DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`variation_type_id`),
  UNIQUE KEY `unique_variation_type_name` (`type_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Variation Options
CREATE TABLE `sl_variation_options` (
  `option_id` int NOT NULL AUTO_INCREMENT,
  `variation_type_id` int NOT NULL,
  `option_value` varchar(100) NOT NULL,
  `sort_order` int DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`option_id`),
  KEY `idx_variation_options_type` (`variation_type_id`),
  CONSTRAINT `fk_variation_options_type` FOREIGN KEY (`variation_type_id`) REFERENCES `sl_variation_types` (`variation_type_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Product Variations
CREATE TABLE `sl_product_variations` (
  `variation_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `price_points` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`variation_id`),
  KEY `idx_product_variations_product` (`product_id`),
  CONSTRAINT `fk_product_variations_product` FOREIGN KEY (`product_id`) REFERENCES `sl_products` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Product Variation Options
CREATE TABLE `sl_product_variation_options` (
  `variation_option_id` int NOT NULL AUTO_INCREMENT,
  `variation_id` int NOT NULL,
  `option_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`variation_option_id`),
  UNIQUE KEY `unique_variation_option` (`variation_id`,`option_id`),
  KEY `idx_product_variation_options_variation` (`variation_id`),
  KEY `idx_product_variation_options_option` (`option_id`),
  CONSTRAINT `fk_product_variation_options_variation` FOREIGN KEY (`variation_id`) REFERENCES `sl_product_variations` (`variation_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_product_variation_options_option` FOREIGN KEY (`option_id`) REFERENCES `sl_variation_options` (`option_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Product Images
CREATE TABLE `sl_product_images` (
  `image_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `alt_text` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `sort_order` int DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`image_id`),
  KEY `idx_product_images_product` (`product_id`),
  CONSTRAINT `fk_product_images_product` FOREIGN KEY (`product_id`) REFERENCES `sl_products` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Shopping Carts
CREATE TABLE `sl_carts` (
  `cart_id` int NOT NULL AUTO_INCREMENT,
  `user_id` char(36) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`cart_id`),
  UNIQUE KEY `unique_user_cart` (`user_id`),
  KEY `idx_carts_user` (`user_id`),
  CONSTRAINT `fk_carts_user` FOREIGN KEY (`user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cart Items
CREATE TABLE `sl_cart_items` (
  `cart_item_id` int NOT NULL AUTO_INCREMENT,
  `cart_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `added_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`cart_item_id`),
  KEY `idx_cart_items_cart` (`cart_id`),
  KEY `idx_cart_items_product` (`product_id`),
  CONSTRAINT `fk_cart_items_cart` FOREIGN KEY (`cart_id`) REFERENCES `sl_carts` (`cart_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_items_product` FOREIGN KEY (`product_id`) REFERENCES `sl_products` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cart Item Variations
CREATE TABLE `sl_cart_item_variations` (
  `cart_item_variation_id` int NOT NULL AUTO_INCREMENT,
  `cart_item_id` int NOT NULL,
  `variation_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`cart_item_variation_id`),
  KEY `idx_cart_item_variations_item` (`cart_item_id`),
  KEY `idx_cart_item_variations_variation` (`variation_id`),
  CONSTRAINT `fk_cart_item_variations_item` FOREIGN KEY (`cart_item_id`) REFERENCES `sl_cart_items` (`cart_item_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_item_variations_variation` FOREIGN KEY (`variation_id`) REFERENCES `sl_product_variations` (`variation_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orders
CREATE TABLE `sl_orders` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `user_id` char(36) DEFAULT NULL,
  `total_points` int DEFAULT NULL,
  `ordered_at` datetime DEFAULT NULL,
  `status` enum('pending','processing','completed','cancelled') DEFAULT NULL,
  PRIMARY KEY (`order_id`),
  KEY `idx_orders_user` (`user_id`),
  KEY `idx_orders_status` (`status`),
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order Items
CREATE TABLE `sl_order_items` (
  `order_item_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `points_spent` int DEFAULT NULL,
  `product_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`order_item_id`),
  KEY `idx_order_items_order` (`order_id`),
  KEY `idx_order_items_product` (`product_id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `sl_orders` (`order_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `sl_products` (`product_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order Item Variations
CREATE TABLE `sl_order_item_variations` (
  `order_item_variation_id` int NOT NULL AUTO_INCREMENT,
  `order_item_id` int NOT NULL,
  `variation_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_item_variation_id`),
  KEY `idx_order_item_variations_item` (`order_item_id`),
  KEY `idx_order_item_variations_variation` (`variation_id`),
  CONSTRAINT `fk_order_item_variations_item` FOREIGN KEY (`order_item_id`) REFERENCES `sl_order_items` (`order_item_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_item_variations_variation` FOREIGN KEY (`variation_id`) REFERENCES `sl_product_variations` (`variation_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Shop Comments
CREATE TABLE `sl_shop_comments` (
  `comment_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `user_id` char(36) NOT NULL,
  `comment_text` text NOT NULL,
  `rating` tinyint(1) DEFAULT NULL,
  `is_approved` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`comment_id`),
  KEY `idx_shop_comments_product` (`product_id`),
  KEY `idx_shop_comments_user` (`user_id`),
  KEY `idx_shop_comments_approved` (`is_approved`),
  CONSTRAINT `fk_shop_comments_product` FOREIGN KEY (`product_id`) REFERENCES `sl_products` (`product_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_shop_comments_user` FOREIGN KEY (`user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- STEP 3: CREATE NEW TABLES - CHEER/PEER RECOGNITION SYSTEM
-- ============================================================================

-- Cheers
CREATE TABLE `sl_cheers` (
  `cheer_id` varchar(36) NOT NULL,
  `from_user_id` varchar(36) DEFAULT NULL,
  `to_user_id` varchar(36) DEFAULT NULL,
  `points` int DEFAULT 1,
  `message` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_flagged` tinyint(1) DEFAULT 0,
  `is_visible` tinyint(1) DEFAULT 1,
  `is_hidden` tinyint(1) DEFAULT 0,
  `is_warned` tinyint(1) DEFAULT 0,
  `warned_at` timestamp NULL DEFAULT NULL,
  `warned_by` varchar(36) DEFAULT NULL,
  `warning_message` text,
  `moderated_at` timestamp NULL DEFAULT NULL,
  `moderated_by` varchar(36) DEFAULT NULL,
  `is_reported` tinyint(1) DEFAULT 0,
  `moderation_reason` text,
  PRIMARY KEY (`cheer_id`),
  KEY `idx_cheers_from_user` (`from_user_id`),
  KEY `idx_cheers_to_user` (`to_user_id`),
  KEY `idx_cheers_created_at` (`created_at`),
  KEY `idx_cheers_visible` (`is_visible`),
  KEY `idx_cheers_hidden` (`is_hidden`),
  CONSTRAINT `fk_cheers_from_user` FOREIGN KEY (`from_user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_cheers_to_user` FOREIGN KEY (`to_user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cheer Comments
CREATE TABLE `sl_cheer_comments` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `cheer_id` varchar(36) DEFAULT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `comment` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cheer_comments_cheer` (`cheer_id`),
  KEY `idx_cheer_comments_user` (`user_id`),
  CONSTRAINT `fk_cheer_comments_cheer` FOREIGN KEY (`cheer_id`) REFERENCES `sl_cheers` (`cheer_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cheer_comments_user` FOREIGN KEY (`user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cheer Likes
CREATE TABLE `sl_cheer_likes` (
  `cheer_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`cheer_id`,`user_id`),
  KEY `idx_cheer_likes_user` (`user_id`),
  CONSTRAINT `fk_cheer_likes_cheer` FOREIGN KEY (`cheer_id`) REFERENCES `sl_cheers` (`cheer_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cheer_likes_user` FOREIGN KEY (`user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cheer Posts
CREATE TABLE `sl_cheer_post` (
  `post_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `post_content` text NOT NULL,
  `post_image` text,
  `is_public` tinyint(1) NOT NULL DEFAULT '1',
  `is_approved` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`post_id`),
  KEY `idx_cheer_post_user` (`user_id`),
  KEY `idx_cheer_post_approved` (`is_approved`),
  CONSTRAINT `fk_cheer_post_user` FOREIGN KEY (`user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cheer Designations
CREATE TABLE `sl_cheer_designation` (
  `designation_id` char(36) NOT NULL,
  `designation_name` varchar(100) NOT NULL,
  `description` text,
  `points_value` int NOT NULL DEFAULT '1',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`designation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- STEP 4: CREATE NEW TABLES - POINTS & HEARTBITS SYSTEM
-- ============================================================================

-- User Heartbits
CREATE TABLE `sl_user_heartbits` (
  `heartbits_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `heartbits_balance` int DEFAULT 0,
  `total_heartbits_earned` int DEFAULT 0,
  `total_heartbits_spent` int DEFAULT 0,
  `is_suspended` tinyint(1) DEFAULT 0,
  `suspension_reason` text,
  `suspended_until` timestamp NULL DEFAULT NULL,
  `suspended_by` varchar(36) DEFAULT NULL,
  `suspended_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`heartbits_id`),
  UNIQUE KEY `unique_user_heartbits` (`user_id`),
  KEY `idx_user_heartbits_user` (`user_id`),
  KEY `idx_user_heartbits_suspended` (`is_suspended`),
  CONSTRAINT `fk_user_heartbits_user` FOREIGN KEY (`user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Heartbits Transactions
CREATE TABLE `sl_heartbits_transactions` (
  `transaction_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `transaction_type` varchar(32) NOT NULL,
  `points_amount` int NOT NULL,
  `reference_type` enum('cheer','purchase','reward','adjustment','refund') DEFAULT NULL,
  `reference_id` int DEFAULT NULL,
  `processed_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`transaction_id`),
  KEY `idx_heartbits_transactions_user` (`user_id`),
  KEY `idx_heartbits_transactions_type` (`transaction_type`),
  KEY `idx_heartbits_transactions_created` (`created_at`),
  CONSTRAINT `fk_heartbits_transactions_user` FOREIGN KEY (`user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Monthly Limits
CREATE TABLE `sl_monthly_limits` (
  `limit_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `month_year` varchar(7) DEFAULT NULL,
  `heartbits_limit` int DEFAULT NULL,
  `heartbits_sent` int DEFAULT NULL,
  PRIMARY KEY (`limit_id`),
  UNIQUE KEY `unique_user_month_year` (`user_id`,`month_year`),
  KEY `idx_monthly_limits_user` (`user_id`),
  CONSTRAINT `fk_monthly_limits_user` FOREIGN KEY (`user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User Points
CREATE TABLE `sl_user_points` (
  `points_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `available_points` int DEFAULT 0,
  `total_earned` int DEFAULT 0,
  `total_spent` int DEFAULT 0,
  `monthly_cheer_limit` int DEFAULT 0,
  `monthly_cheer_used` int DEFAULT 0,
  `last_monthly_reset` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`points_id`),
  UNIQUE KEY `unique_user_points` (`user_id`),
  KEY `idx_user_points_user` (`user_id`),
  CONSTRAINT `fk_user_points_user` FOREIGN KEY (`user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Transactions
CREATE TABLE `sl_transactions` (
  `transaction_id` varchar(36) NOT NULL,
  `from_user_id` varchar(36) DEFAULT NULL,
  `to_user_id` varchar(36) DEFAULT NULL,
  `type` enum('transfer','reward','purchase','refund','adjustment') NOT NULL,
  `amount` int DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  `message` text,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`transaction_id`),
  KEY `idx_transactions_from_user` (`from_user_id`),
  KEY `idx_transactions_to_user` (`to_user_id`),
  KEY `idx_transactions_type` (`type`),
  KEY `idx_transactions_created` (`created_at`),
  CONSTRAINT `fk_transactions_from_user` FOREIGN KEY (`from_user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_transactions_to_user` FOREIGN KEY (`to_user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- STEP 5: CREATE NEW TABLES - ANALYTICS & STATISTICS
-- ============================================================================

-- Daily Stats
CREATE TABLE `sl_daily_stats` (
  `stat_id` int NOT NULL AUTO_INCREMENT,
  `stat_date` date NOT NULL,
  `total_users` int DEFAULT 0,
  `active_users` int DEFAULT 0,
  `total_cheers` int DEFAULT 0,
  `total_orders` int DEFAULT 0,
  `total_points_earned` int DEFAULT 0,
  `total_points_spent` int DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`stat_id`),
  UNIQUE KEY `unique_daily_stat` (`stat_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User Monthly Stats
CREATE TABLE `sl_user_monthly_stats` (
  `stat_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `month_year` varchar(7) NOT NULL,
  `cheers_received` int DEFAULT 0,
  `cheers_sent` int DEFAULT 0,
  `points_earned` int DEFAULT 0,
  `points_spent` int DEFAULT 0,
  `orders_placed` int DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`stat_id`),
  UNIQUE KEY `unique_user_monthly_stat` (`user_id`,`month_year`),
  KEY `idx_user_monthly_stats_user` (`user_id`),
  CONSTRAINT `fk_user_monthly_stats_user` FOREIGN KEY (`user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User Notifications
CREATE TABLE `sl_user_notifications` (
  `notification_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `type` enum('cheer','order','system','reward','announcement') NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `related_id` varchar(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `read_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`notification_id`),
  KEY `idx_user_notifications_user` (`user_id`),
  KEY `idx_user_notifications_read` (`is_read`),
  KEY `idx_user_notifications_created` (`created_at`),
  CONSTRAINT `fk_user_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Leaderboard Cache
CREATE TABLE `leaderboard_cache` (
  `cache_id` int NOT NULL AUTO_INCREMENT,
  `leaderboard_type` enum('cheers_received','cheers_sent','points_earned','points_spent') NOT NULL,
  `time_period` enum('daily','weekly','monthly','all_time') NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `rank` int NOT NULL,
  `score` int NOT NULL,
  `cached_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`cache_id`),
  UNIQUE KEY `unique_leaderboard_cache` (`leaderboard_type`,`time_period`,`user_id`),
  KEY `idx_leaderboard_cache_type_period` (`leaderboard_type`,`time_period`),
  KEY `idx_leaderboard_cache_user` (`user_id`),
  CONSTRAINT `fk_leaderboard_cache_user` FOREIGN KEY (`user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- STEP 6: CREATE NEW TABLES - SYSTEM & ADMINISTRATION
-- ============================================================================

-- Admin Actions
CREATE TABLE `sl_admin_actions` (
  `action_id` int NOT NULL AUTO_INCREMENT,
  `admin_id` varchar(36) NOT NULL,
  `action_type` varchar(255) NOT NULL,
  `target_type` varchar(100) DEFAULT NULL,
  `details` json DEFAULT NULL,
  `target_id` varchar(36) DEFAULT NULL,
  `action_details` json DEFAULT NULL,
  `reason` text,
  `performed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  PRIMARY KEY (`action_id`),
  KEY `idx_admin_actions_admin` (`admin_id`),
  KEY `idx_admin_actions_type` (`action_type`),
  KEY `idx_admin_actions_performed` (`performed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin Permissions
CREATE TABLE `sl_admin_permissions` (
  `permission_id` char(36) NOT NULL,
  `permission_name` varchar(100) NOT NULL,
  `description` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`permission_id`),
  UNIQUE KEY `unique_permission_name` (`permission_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin Roles
CREATE TABLE `sl_admin_roles` (
  `role_id` char(36) NOT NULL,
  `role_name` varchar(100) NOT NULL,
  `description` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `unique_role_name` (`role_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- System Config
CREATE TABLE `sl_system_config` (
  `config_id` char(36) NOT NULL,
  `config_key` varchar(100) NOT NULL,
  `config_value` text,
  `config_type` enum('string','integer','boolean','json') NOT NULL DEFAULT 'string',
  `description` text,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`config_id`),
  UNIQUE KEY `unique_config_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- STEP 7: CREATE NEW TABLES - ADDITIONAL FEATURES
-- ============================================================================

-- Mood Logs
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

-- ============================================================================
-- STEP 8: CREATE ADDITIONAL INDEXES FOR PERFORMANCE
-- ============================================================================

-- Cart items indexes
CREATE INDEX `idx_cart_items_user_product` ON `sl_cart_items` (`cart_id`, `product_id`);

-- Order items indexes
CREATE INDEX `idx_order_items_user_date` ON `sl_order_items` (`order_id`, `order_item_id`);

-- Transactions indexes
CREATE INDEX `idx_transactions_user_type_date` ON `sl_heartbits_transactions` (`user_id`, `transaction_type`, `created_at`);

-- Products indexes
CREATE INDEX `idx_products_category_active` ON `sl_products` (`category_id`, `is_active`);

-- User heartbits indexes
CREATE INDEX `idx_user_heartbits_balance_active` ON `sl_user_heartbits` (`heartbits_balance`, `is_suspended`);

-- Cheers indexes
CREATE INDEX `idx_cheers_points_date` ON `sl_cheers` (`points`, `created_at`);

-- Transactions indexes
CREATE INDEX `idx_transactions_amount_type` ON `sl_transactions` (`amount`, `type`);

-- User points indexes
CREATE INDEX `idx_user_points_monthly_reset` ON `sl_user_points` (`last_monthly_reset`);

-- Cheer comments indexes
CREATE INDEX `idx_cheer_comments_created_at` ON `sl_cheer_comments` (`created_at`);

-- Cheer likes indexes
CREATE INDEX `idx_cheer_likes_created_at` ON `sl_cheer_likes` (`created_at`);

-- Product variations indexes
CREATE INDEX `idx_product_variations_product_active` ON `sl_product_variations` (`product_id`, `is_active`);

-- Product variation options indexes
CREATE INDEX `idx_product_variation_options_variation` ON `sl_product_variation_options` (`variation_id`);

-- Variation options indexes
CREATE INDEX `idx_variation_options_type_sort` ON `sl_variation_options` (`variation_type_id`, `sort_order`);

-- Variation types indexes
CREATE INDEX `idx_variation_types_sort` ON `sl_variation_types` (`sort_order`);

-- Product images indexes
CREATE INDEX `idx_product_images_product_active_sort` ON `sl_product_images` (`product_id`, `is_active`, `sort_order`);

-- Order items indexes
CREATE INDEX `idx_order_items_order_product` ON `sl_order_items` (`order_id`, `product_id`);

-- Order item variations indexes
CREATE INDEX `idx_order_item_variations_item` ON `sl_order_item_variations` (`order_item_id`);

-- ============================================================================
-- STEP 9: CREATE VIEWS
-- ============================================================================

-- User Heartbits Summary View
CREATE VIEW `v_user_heartbits_summary` AS
SELECT 
    u.user_id,
    u.first_name,
    u.last_name,
    u.user_email,
    p.available_points AS heartbits_balance,
    p.total_earned AS total_heartbits_earned,
    p.total_spent AS total_heartbits_spent,
    0 AS is_suspended,
    NULL AS suspension_reason
FROM sl_user_accounts u
LEFT JOIN sl_user_points p ON u.user_id = p.user_id
WHERE u.is_active = 1;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- 
-- Summary of changes:
-- ✅ Updated 24 existing tables (collation and indexes)
-- ✅ Created 33 new tables
-- ✅ Added 25+ performance indexes
-- ✅ Created 1 view
-- ✅ Added 6 major new business systems
-- 
-- New features available:
-- - E-commerce system with products, cart, orders
-- - Cheer/peer recognition system
-- - Points and heartbits reward system
-- - Analytics and statistics tracking
-- - Enhanced admin system with roles/permissions
-- - Mood tracking for employee wellness
-- 
-- Database size: 24 → 57 tables (+137.5%)
-- ============================================================================ 