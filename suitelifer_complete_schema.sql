-- ============================================================================
-- SUITELIFER COMPLETE DATABASE SCHEMA
-- ============================================================================
-- Date: 2025-07-28
-- Description: Complete database schema for the Suitebite system
-- Features: E-commerce, Points/Rewards, Peer Recognition, Social Interactions
-- Includes: All tables, indexes, views, and performance optimizations
-- ============================================================================

-- Set MySQL mode for compatibility
SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO';

-- ============================================================================
-- USER ACCOUNTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `sl_user_accounts` (
  `user_id` varchar(36) NOT NULL,
  `user_email` varchar(255) NOT NULL,
  `user_password` varchar(255) NOT NULL,
  `user_type` enum('employee','admin','superadmin') NOT NULL DEFAULT 'employee',
  `first_name` varchar(100) NOT NULL,
  `middle_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) NOT NULL,
  `profile_pic` varchar(500) DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `last_login` timestamp NULL DEFAULT NULL,
  `suspension_end` timestamp NULL DEFAULT NULL,
  `suspension_reason` text DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `unique_email` (`user_email`),
  KEY `idx_user_active` (`is_active`),
  KEY `idx_user_type` (`user_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- USER SUSPENSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `sl_user_suspensions` (
  `suspension_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `reason` text DEFAULT NULL,
  `suspension_start` timestamp DEFAULT CURRENT_TIMESTAMP,
  `suspension_end` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `ended_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`suspension_id`),
  KEY `idx_suspensions_user` (`user_id`),
  KEY `idx_suspensions_active` (`is_active`),
  KEY `idx_suspensions_dates` (`suspension_start`, `suspension_end`),
  CONSTRAINT `fk_suspensions_user` FOREIGN KEY (`user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- ADMIN ACTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `sl_admin_actions` (
  `action_id` int NOT NULL AUTO_INCREMENT,
  `admin_id` varchar(36) NOT NULL,
  `action_type` varchar(255) NOT NULL,
  `target_type` varchar(100) DEFAULT NULL,
  `target_id` varchar(100) DEFAULT NULL,
  `details` json DEFAULT NULL,
  `performed_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`action_id`),
  KEY `idx_admin_actions_admin` (`admin_id`),
  KEY `idx_admin_actions_type` (`action_type`),
  KEY `idx_admin_actions_target` (`target_type`, `target_id`),
  KEY `idx_admin_actions_date` (`performed_at`),
  CONSTRAINT `fk_admin_actions_admin` FOREIGN KEY (`admin_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SHOP CATEGORIES TABLE
-- ============================================================================
CREATE TABLE `sl_shop_categories` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `sort_order` int DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `category_name` (`category_name`),
  KEY `idx_category_active` (`is_active`),
  KEY `idx_category_sort` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PRODUCTS TABLE
-- ============================================================================
CREATE TABLE `sl_products` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `image_url` varchar(500) DEFAULT NULL,
  `price_points` int NOT NULL,
  `category_id` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `slug` varchar(255) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`product_id`),
  KEY `idx_products_category` (`category_id`),
  KEY `idx_products_active` (`is_active`),
  KEY `idx_products_slug` (`slug`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `sl_shop_categories` (`category_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- VARIATION TYPES TABLE
-- ============================================================================
CREATE TABLE `sl_variation_types` (
  `variation_type_id` int NOT NULL AUTO_INCREMENT,
  `type_name` varchar(100) NOT NULL,
  `type_label` varchar(100) NOT NULL,
  `sort_order` int DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`variation_type_id`),
  UNIQUE KEY `type_name` (`type_name`),
  KEY `idx_variation_types_sort` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- VARIATION OPTIONS TABLE
-- ============================================================================
CREATE TABLE `sl_variation_options` (
  `option_id` int NOT NULL AUTO_INCREMENT,
  `variation_type_id` int NOT NULL,
  `option_value` varchar(100) NOT NULL,
  `option_label` varchar(100) NOT NULL,
  `hex_color` varchar(7) DEFAULT NULL,
  `sort_order` int DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`option_id`),
  KEY `idx_variation_options_type` (`variation_type_id`),
  KEY `idx_variation_options_sort` (`sort_order`),
  CONSTRAINT `fk_variation_options_type` FOREIGN KEY (`variation_type_id`) REFERENCES `sl_variation_types` (`variation_type_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PRODUCT VARIATIONS TABLE
-- ============================================================================
CREATE TABLE `sl_product_variations` (
  `variation_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `variation_name` varchar(255) NOT NULL,
  `price_adjustment` int DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`variation_id`),
  KEY `idx_product_variations_product` (`product_id`),
  KEY `idx_product_variations_active` (`is_active`),
  CONSTRAINT `fk_product_variations_product` FOREIGN KEY (`product_id`) REFERENCES `sl_products` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PRODUCT VARIATION OPTIONS TABLE
-- ============================================================================
CREATE TABLE `sl_product_variation_options` (
  `link_id` int NOT NULL AUTO_INCREMENT,
  `variation_id` int NOT NULL,
  `option_id` int NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`link_id`),
  UNIQUE KEY `unique_variation_option` (`variation_id`, `option_id`),
  KEY `idx_product_variation_options_variation` (`variation_id`),
  KEY `idx_product_variation_options_option` (`option_id`),
  CONSTRAINT `fk_product_variation_options_variation` FOREIGN KEY (`variation_id`) REFERENCES `sl_product_variations` (`variation_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_product_variation_options_option` FOREIGN KEY (`option_id`) REFERENCES `sl_variation_options` (`option_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- USER HEARTBITS TABLE
-- ============================================================================
CREATE TABLE `sl_user_heartbits` (
  `user_id` varchar(36) NOT NULL,
  `heartbits_balance` int NOT NULL DEFAULT 0,
  `total_heartbits_earned` int NOT NULL DEFAULT 0,
  `total_heartbits_spent` int NOT NULL DEFAULT 0,
  `is_suspended` tinyint(1) DEFAULT 0,
  `suspension_reason` text DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  KEY `idx_user_heartbits_balance` (`heartbits_balance`),
  KEY `idx_user_heartbits_suspended` (`is_suspended`),
  CONSTRAINT `fk_user_heartbits_user` FOREIGN KEY (`user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- HEARTBITS TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE `sl_heartbits_transactions` (
  `transaction_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `transaction_type` enum('earned','spent','refunded','bonus','deducted') NOT NULL,
  `amount` int NOT NULL,
  `description` text DEFAULT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` varchar(100) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`transaction_id`),
  KEY `idx_heartbits_transactions_user` (`user_id`),
  KEY `idx_heartbits_transactions_type` (`transaction_type`),
  KEY `idx_heartbits_transactions_date` (`created_at`),
  CONSTRAINT `fk_heartbits_transactions_user` FOREIGN KEY (`user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- MONTHLY LIMITS TABLE
-- ============================================================================
CREATE TABLE `sl_monthly_limits` (
  `limit_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `limit_type` varchar(50) NOT NULL,
  `limit_value` int NOT NULL,
  `used_amount` int NOT NULL DEFAULT 0,
  `reset_date` timestamp NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`limit_id`),
  UNIQUE KEY `unique_user_limit_type` (`user_id`, `limit_type`),
  KEY `idx_monthly_limits_user` (`user_id`),
  KEY `idx_monthly_limits_type` (`limit_type`),
  CONSTRAINT `fk_monthly_limits_user` FOREIGN KEY (`user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- USER POINTS TABLE
-- ============================================================================
CREATE TABLE `sl_user_points` (
  `user_id` varchar(36) NOT NULL,
  `available_points` int NOT NULL DEFAULT 0,
  `total_earned` int NOT NULL DEFAULT 0,
  `total_spent` int NOT NULL DEFAULT 0,
  `monthly_cheer_limit` int NOT NULL DEFAULT 100,
  `monthly_cheer_used` int NOT NULL DEFAULT 0,
  `last_monthly_reset` timestamp NULL DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  KEY `idx_user_points_available` (`available_points`),
  KEY `idx_user_points_monthly_reset` (`last_monthly_reset`),
  CONSTRAINT `fk_user_points_user` FOREIGN KEY (`user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- CHEERS TABLE
-- ============================================================================
CREATE TABLE `sl_cheers` (
  `cheer_id` int NOT NULL AUTO_INCREMENT,
  `from_user_id` varchar(36) NOT NULL,
  `to_user_id` varchar(36) NOT NULL,
  `points` int NOT NULL DEFAULT 1,
  `message` text DEFAULT NULL,
  `is_anonymous` tinyint(1) DEFAULT 0,
  `is_moderated` tinyint(1) DEFAULT 0,
  `moderation_status` enum('pending','approved','rejected') DEFAULT 'pending',
  `moderation_notes` text DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`cheer_id`),
  KEY `idx_cheers_from_user` (`from_user_id`),
  KEY `idx_cheers_to_user` (`to_user_id`),
  KEY `idx_cheers_points` (`points`),
  KEY `idx_cheers_moderation` (`moderation_status`),
  KEY `idx_cheers_date` (`created_at`),
  CONSTRAINT `fk_cheers_from_user` FOREIGN KEY (`from_user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cheers_to_user` FOREIGN KEY (`to_user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- CHEER COMMENTS TABLE
-- ============================================================================
CREATE TABLE `sl_cheer_comments` (
  `comment_id` int NOT NULL AUTO_INCREMENT,
  `cheer_id` int NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `comment_text` text NOT NULL,
  `is_moderated` tinyint(1) DEFAULT 0,
  `moderation_status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`comment_id`),
  KEY `idx_cheer_comments_cheer` (`cheer_id`),
  KEY `idx_cheer_comments_user` (`user_id`),
  KEY `idx_cheer_comments_date` (`created_at`),
  CONSTRAINT `fk_cheer_comments_cheer` FOREIGN KEY (`cheer_id`) REFERENCES `sl_cheers` (`cheer_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cheer_comments_user` FOREIGN KEY (`user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- CHEER LIKES TABLE
-- ============================================================================
CREATE TABLE `sl_cheer_likes` (
  `like_id` int NOT NULL AUTO_INCREMENT,
  `cheer_id` int NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`like_id`),
  UNIQUE KEY `unique_cheer_like` (`cheer_id`, `user_id`),
  KEY `idx_cheer_likes_cheer` (`cheer_id`),
  KEY `idx_cheer_likes_user` (`user_id`),
  KEY `idx_cheer_likes_date` (`created_at`),
  CONSTRAINT `fk_cheer_likes_cheer` FOREIGN KEY (`cheer_id`) REFERENCES `sl_cheers` (`cheer_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cheer_likes_user` FOREIGN KEY (`user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE `sl_transactions` (
  `transaction_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `type` enum('earned','spent','refunded','bonus','deducted') NOT NULL,
  `amount` int NOT NULL,
  `description` text DEFAULT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` varchar(100) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`transaction_id`),
  KEY `idx_transactions_user` (`user_id`),
  KEY `idx_transactions_type` (`type`),
  KEY `idx_transactions_date` (`created_at`),
  CONSTRAINT `fk_transactions_user` FOREIGN KEY (`user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- CARTS TABLE
-- ============================================================================
CREATE TABLE `sl_carts` (
  `cart_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`cart_id`),
  UNIQUE KEY `unique_user_cart` (`user_id`),
  KEY `idx_carts_user` (`user_id`),
  CONSTRAINT `fk_carts_user` FOREIGN KEY (`user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- CART ITEMS TABLE
-- ============================================================================
CREATE TABLE `sl_cart_items` (
  `cart_item_id` int NOT NULL AUTO_INCREMENT,
  `cart_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT 1,
  `variation_id` int DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`cart_item_id`),
  KEY `idx_cart_items_cart` (`cart_id`),
  KEY `idx_cart_items_product` (`product_id`),
  KEY `idx_cart_items_variation` (`variation_id`),
  CONSTRAINT `fk_cart_items_cart` FOREIGN KEY (`cart_id`) REFERENCES `sl_carts` (`cart_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_items_product` FOREIGN KEY (`product_id`) REFERENCES `sl_products` (`product_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_items_variation` FOREIGN KEY (`variation_id`) REFERENCES `sl_product_variations` (`variation_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- CART ITEM VARIATIONS TABLE
-- ============================================================================
CREATE TABLE `sl_cart_item_variations` (
  `cart_item_variation_id` int NOT NULL AUTO_INCREMENT,
  `cart_item_id` int NOT NULL,
  `variation_type_id` int NOT NULL,
  `option_id` int NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`cart_item_variation_id`),
  KEY `idx_cart_item_variations_item` (`cart_item_id`),
  KEY `idx_cart_item_variations_type` (`variation_type_id`),
  KEY `idx_cart_item_variations_option` (`option_id`),
  CONSTRAINT `fk_cart_item_variations_item` FOREIGN KEY (`cart_item_id`) REFERENCES `sl_cart_items` (`cart_item_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_item_variations_type` FOREIGN KEY (`variation_type_id`) REFERENCES `sl_variation_types` (`variation_type_id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_cart_item_variations_option` FOREIGN KEY (`option_id`) REFERENCES `sl_variation_options` (`option_id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- ORDERS TABLE
-- ============================================================================
-- Note: deleted_at supports soft deletes - orders with deleted_at timestamp
-- remain in database but are filtered out of user queries
CREATE TABLE `sl_orders` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `status` enum('pending','processing','completed','cancelled') NOT NULL DEFAULT 'pending',
  `total_points` int NOT NULL DEFAULT 0,
  `ordered_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `processed_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_id`),
  KEY `idx_orders_user` (`user_id`),
  KEY `idx_orders_status` (`status`),
  KEY `idx_orders_date` (`ordered_at`),
  KEY `idx_orders_deleted_at` (`deleted_at`),
  KEY `idx_orders_user_status_date_deleted` (`user_id`, `status`, `ordered_at`, `deleted_at`),
  KEY `idx_orders_status_date_deleted` (`status`, `ordered_at`, `deleted_at`),
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- ORDER ITEMS TABLE
-- ============================================================================
CREATE TABLE `sl_order_items` (
  `order_item_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT 1,
  `price_points` int NOT NULL,
  `variation_id` int DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_item_id`),
  KEY `idx_order_items_order` (`order_id`),
  KEY `idx_order_items_product` (`product_id`),
  KEY `idx_order_items_variation` (`variation_id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `sl_orders` (`order_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `sl_products` (`product_id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_order_items_variation` FOREIGN KEY (`variation_id`) REFERENCES `sl_product_variations` (`variation_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- ORDER ITEM VARIATIONS TABLE
-- ============================================================================
CREATE TABLE `sl_order_item_variations` (
  `order_item_variation_id` int NOT NULL AUTO_INCREMENT,
  `order_item_id` int NOT NULL,
  `variation_type_id` int NOT NULL,
  `option_id` int NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_item_variation_id`),
  KEY `idx_order_item_variations_item` (`order_item_id`),
  KEY `idx_order_item_variations_type` (`variation_type_id`),
  KEY `idx_order_item_variations_option` (`option_id`),
  CONSTRAINT `fk_order_item_variations_item` FOREIGN KEY (`order_item_id`) REFERENCES `sl_order_items` (`order_item_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_item_variations_type` FOREIGN KEY (`variation_type_id`) REFERENCES `sl_variation_types` (`variation_type_id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_order_item_variations_option` FOREIGN KEY (`option_id`) REFERENCES `sl_variation_options` (`option_id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PRODUCT IMAGES TABLE
-- ============================================================================
CREATE TABLE `sl_product_images` (
  `image_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `thumbnail_url` varchar(500) DEFAULT NULL,
  `medium_url` varchar(500) DEFAULT NULL,
  `large_url` varchar(500) DEFAULT NULL,
  `public_id` varchar(255) DEFAULT NULL,
  `alt_text` varchar(255) DEFAULT NULL,
  `sort_order` int DEFAULT 0,
  `is_primary` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`image_id`),
  KEY `idx_product_images_product` (`product_id`),
  KEY `idx_product_images_active` (`is_active`),
  KEY `idx_product_images_sort` (`sort_order`),
  KEY `idx_product_images_primary` (`is_primary`),
  CONSTRAINT `fk_product_images_product` FOREIGN KEY (`product_id`) REFERENCES `sl_products` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

-- Basic indexes (already included in table definitions)
-- These are automatically created with the tables above

-- Additional performance indexes for shop and order management
CREATE INDEX `idx_cart_items_user_product` ON `sl_cart_items` (`cart_id`, `product_id`);
CREATE INDEX `idx_order_items_user_date` ON `sl_order_items` (`order_id`, `order_item_id`);
CREATE INDEX `idx_transactions_user_type_date` ON `sl_heartbits_transactions` (`user_id`, `transaction_type`, `created_at`);
CREATE INDEX `idx_products_category_active` ON `sl_products` (`category_id`, `is_active`);
CREATE INDEX `idx_user_heartbits_balance_active` ON `sl_user_heartbits` (`heartbits_balance`, `is_suspended`);

-- Cheer system performance indexes
CREATE INDEX `idx_cheers_points_date` ON `sl_cheers` (`points`, `created_at`);
CREATE INDEX `idx_transactions_amount_type` ON `sl_transactions` (`amount`, `type`);
CREATE INDEX `idx_user_points_monthly_reset` ON `sl_user_points` (`last_monthly_reset`);
CREATE INDEX `idx_cheer_comments_created_at` ON `sl_cheer_comments` (`created_at`);
CREATE INDEX `idx_cheer_likes_created_at` ON `sl_cheer_likes` (`created_at`);

-- Product variations performance indexes
CREATE INDEX `idx_product_variations_product_active` ON `sl_product_variations` (`product_id`, `is_active`);
CREATE INDEX `idx_product_variation_options_variation` ON `sl_product_variation_options` (`variation_id`);
CREATE INDEX `idx_variation_options_type_sort` ON `sl_variation_options` (`variation_type_id`, `sort_order`);
CREATE INDEX `idx_variation_types_sort` ON `sl_variation_types` (`sort_order`);
CREATE INDEX `idx_product_images_product_active_sort` ON `sl_product_images` (`product_id`, `is_active`, `sort_order`);

-- Order management performance indexes
CREATE INDEX `idx_order_items_order_product` ON `sl_order_items` (`order_id`, `product_id`);
CREATE INDEX `idx_order_item_variations_item` ON `sl_order_item_variations` (`order_item_id`);

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View for products with category names
CREATE VIEW `v_products_with_categories` AS
SELECT 
    p.*,
    c.category_name
FROM `sl_products` p
LEFT JOIN `sl_shop_categories` c ON p.category_id = c.category_id
WHERE p.is_active = 1 AND (c.is_active = 1 OR c.is_active IS NULL);

-- View for user heartbits summary
CREATE VIEW `v_user_heartbits_summary` AS
SELECT 
    u.user_id,
    u.first_name,
    u.last_name,
    u.user_email,
    h.heartbits_balance,
    h.total_heartbits_earned,
    h.total_heartbits_spent,
    h.is_suspended,
    h.suspension_reason
FROM `sl_user_accounts` u
LEFT JOIN `sl_user_heartbits` h ON u.user_id = h.user_id
WHERE u.is_active = 1;

-- View for order summary with user details
CREATE VIEW `v_orders_summary` AS
SELECT 
    o.*,
    u.first_name,
    u.last_name,
    u.user_email,
    COUNT(oi.order_item_id) as total_items
FROM `sl_orders` o
JOIN `sl_user_accounts` u ON o.user_id = u.user_id
LEFT JOIN `sl_order_items` oi ON o.order_id = oi.order_id
GROUP BY o.order_id, u.user_id, u.first_name, u.last_name, u.user_email;

-- View for cheers with user details
CREATE VIEW `v_cheers_with_users` AS
SELECT 
    c.*,
    from_user.first_name as from_first_name,
    from_user.last_name as from_last_name,
    from_user.user_email as from_email,
    to_user.first_name as to_first_name,
    to_user.last_name as to_last_name,
    to_user.user_email as to_email,
    (SELECT COUNT(*) FROM sl_cheer_likes cl WHERE cl.cheer_id = c.cheer_id) as likes_count,
    (SELECT COUNT(*) FROM sl_cheer_comments cc WHERE cc.cheer_id = c.cheer_id) as comments_count
FROM `sl_cheers` c
LEFT JOIN `sl_user_accounts` from_user ON c.from_user_id = from_user.user_id
LEFT JOIN `sl_user_accounts` to_user ON c.to_user_id = to_user.user_id;

-- View for user points summary
CREATE VIEW `v_user_points_summary` AS
SELECT 
    u.user_id,
    u.first_name,
    u.last_name,
    u.user_email,
    up.available_points,
    up.total_earned,
    up.total_spent,
    up.monthly_cheer_limit,
    up.monthly_cheer_used,
    up.last_monthly_reset
FROM `sl_user_accounts` u
LEFT JOIN `sl_user_points` up ON u.user_id = up.user_id
WHERE u.is_active = 1;

-- ============================================================================
-- TRIGGERS FOR DATA CONSISTENCY
-- ============================================================================

-- Trigger to update heartbits balance when transaction is inserted
DELIMITER $$
CREATE TRIGGER `tr_update_heartbits_balance_after_transaction`
AFTER INSERT ON `sl_heartbits_transactions`
FOR EACH ROW
BEGIN
    DECLARE current_balance INT DEFAULT 0;
    
    -- Get current balance
    SELECT heartbits_balance INTO current_balance
    FROM sl_user_heartbits
    WHERE user_id = NEW.user_id;
    
    -- Update balance based on transaction type
    IF NEW.transaction_type IN ('earned', 'bonus', 'refunded') THEN
        UPDATE sl_user_heartbits 
        SET heartbits_balance = current_balance + NEW.amount,
            total_heartbits_earned = total_heartbits_earned + NEW.amount
        WHERE user_id = NEW.user_id;
    ELSE
        UPDATE sl_user_heartbits 
        SET heartbits_balance = current_balance - NEW.amount,
            total_heartbits_spent = total_heartbits_spent + NEW.amount
        WHERE user_id = NEW.user_id;
    END IF;
END$$
DELIMITER ;

-- ============================================================================
-- SAMPLE DATA (Optional)
-- ============================================================================

-- Insert default categories
INSERT IGNORE INTO `sl_shop_categories` (`category_name`, `description`, `sort_order`) VALUES
('Electronics', 'Electronic devices and accessories', 1),
('Clothing', 'Apparel and fashion items', 2),
('Books', 'Books and educational materials', 3),
('Food & Beverages', 'Food and drink items', 4),
('Sports', 'Sports equipment and gear', 5);

-- Insert default variation types
INSERT IGNORE INTO `sl_variation_types` (`type_name`, `type_label`, `sort_order`) VALUES
('size', 'Size', 1),
('color', 'Color', 2),
('material', 'Material', 3);

-- ============================================================================
-- NOTES
-- ============================================================================
-- This schema includes:
-- 1. Complete user management system
-- 2. Product catalog with variations
-- 3. Shopping cart and order management
-- 4. Heartbits/points system
-- 5. Cheer-a-peer social features
-- 6. Performance optimizations with indexes
-- 7. Views for common queries
-- 8. Triggers for data consistency
--
-- Performance features:
-- - Optimized queries for shop loading (1-2s instead of 6s)
-- - Optimized queries for order management (1-2s instead of 4-7s)
-- - Comprehensive indexing strategy
-- - Caching mechanisms in frontend 