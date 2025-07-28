-- ============================================================================
-- SUITELIFER SHOP SYSTEM SCHEMA (Updated with cancelled_at column)
-- ============================================================================
-- Date: 2025-07-28
-- Description: Complete database schema for the Suitebite shop system
-- Includes cancelled_at column for order cancellation tracking

-- ============================================================================
-- USER ACCOUNTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `sl_user_accounts` (
  `user_id` varchar(36) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `user_email` varchar(255) NOT NULL UNIQUE,
  `password_hash` varchar(255) NOT NULL,
  `user_type` enum('USER','ADMIN','SUPER_ADMIN') DEFAULT 'USER',
  `is_active` boolean DEFAULT true,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  KEY `idx_user_email` (`user_email`),
  KEY `idx_user_type` (`user_type`),
  KEY `idx_user_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- USER SUSPENSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `sl_user_suspensions` (
  `suspension_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `reason` text NOT NULL,
  `suspended_until` timestamp NULL DEFAULT NULL,
  `suspended_by` varchar(36) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`suspension_id`),
  KEY `idx_suspensions_user` (`user_id`),
  KEY `idx_suspensions_until` (`suspended_until`),
  CONSTRAINT `fk_suspensions_user` FOREIGN KEY (`user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_suspensions_admin` FOREIGN KEY (`suspended_by`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- ADMIN ACTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `sl_admin_actions` (
  `action_id` int NOT NULL AUTO_INCREMENT,
  `admin_id` varchar(36) NOT NULL,
  `action_type` varchar(50) NOT NULL,
  `target_type` varchar(50) NOT NULL,
  `target_id` varchar(255) NOT NULL,
  `action_data` json DEFAULT NULL,
  `performed_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`action_id`),
  KEY `idx_admin_actions_admin` (`admin_id`),
  KEY `idx_admin_actions_type` (`action_type`),
  KEY `idx_admin_actions_target` (`target_type`, `target_id`),
  KEY `idx_admin_actions_date` (`performed_at`),
  CONSTRAINT `fk_admin_actions_user` FOREIGN KEY (`admin_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SHOP CATEGORIES TABLE
-- ============================================================================
CREATE TABLE `sl_shop_categories` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` boolean DEFAULT true,
  `sort_order` int DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`category_id`),
  KEY `idx_categories_active` (`is_active`),
  KEY `idx_categories_sort` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PRODUCTS TABLE
-- ============================================================================
CREATE TABLE `sl_products` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `price_points` int NOT NULL DEFAULT 0,
  `is_active` boolean DEFAULT true,
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
  `type_name` varchar(50) NOT NULL,
  `type_label` varchar(100) NOT NULL,
  `is_active` boolean DEFAULT true,
  `sort_order` int DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`variation_type_id`),
  KEY `idx_variation_types_active` (`is_active`),
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
  `is_active` boolean DEFAULT true,
  `sort_order` int DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`option_id`),
  KEY `idx_variation_options_type` (`variation_type_id`),
  KEY `idx_variation_options_active` (`is_active`),
  KEY `idx_variation_options_sort` (`sort_order`),
  CONSTRAINT `fk_variation_options_type` FOREIGN KEY (`variation_type_id`) REFERENCES `sl_variation_types` (`variation_type_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PRODUCT VARIATIONS TABLE
-- ============================================================================
CREATE TABLE `sl_product_variations` (
  `variation_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `variation_type_id` int NOT NULL,
  `option_id` int NOT NULL,
  `price_adjustment` int DEFAULT 0,
  `is_active` boolean DEFAULT true,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`variation_id`),
  KEY `idx_product_variations_product` (`product_id`),
  KEY `idx_product_variations_type` (`variation_type_id`),
  KEY `idx_product_variations_option` (`option_id`),
  KEY `idx_product_variations_active` (`is_active`),
  CONSTRAINT `fk_product_variations_product` FOREIGN KEY (`product_id`) REFERENCES `sl_products` (`product_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_product_variations_type` FOREIGN KEY (`variation_type_id`) REFERENCES `sl_variation_types` (`variation_type_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_product_variations_option` FOREIGN KEY (`option_id`) REFERENCES `sl_variation_options` (`option_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PRODUCT VARIATION OPTIONS TABLE (Many-to-Many)
-- ============================================================================
CREATE TABLE `sl_product_variation_options` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `variation_type_id` int NOT NULL,
  `option_id` int NOT NULL,
  `price_adjustment` int DEFAULT 0,
  `is_active` boolean DEFAULT true,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_product_variation_option` (`product_id`, `variation_type_id`, `option_id`),
  KEY `idx_product_variation_options_product` (`product_id`),
  KEY `idx_product_variation_options_type` (`variation_type_id`),
  KEY `idx_product_variation_options_option` (`option_id`),
  CONSTRAINT `fk_product_variation_options_product` FOREIGN KEY (`product_id`) REFERENCES `sl_products` (`product_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_product_variation_options_type` FOREIGN KEY (`variation_type_id`) REFERENCES `sl_variation_types` (`variation_type_id`) ON DELETE CASCADE,
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
  `is_suspended` boolean DEFAULT false,
  `suspended_until` timestamp NULL DEFAULT NULL,
  `suspension_reason` text DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  KEY `idx_user_heartbits_balance` (`heartbits_balance`),
  KEY `idx_user_heartbits_suspended` (`is_suspended`),
  KEY `idx_user_heartbits_suspended_until` (`suspended_until`),
  CONSTRAINT `fk_user_heartbits_user` FOREIGN KEY (`user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- HEARTBITS TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE `sl_heartbits_transactions` (
  `transaction_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `transaction_type` enum('EARNED','SPENT','REFUND','ADMIN_ADJUSTMENT','MONTHLY_RESET') NOT NULL,
  `points` int NOT NULL,
  `description` text DEFAULT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`transaction_id`),
  KEY `idx_heartbits_transactions_user` (`user_id`),
  KEY `idx_heartbits_transactions_type` (`transaction_type`),
  KEY `idx_heartbits_transactions_reference` (`reference_type`, `reference_id`),
  KEY `idx_heartbits_transactions_date` (`created_at`),
  CONSTRAINT `fk_heartbits_transactions_user` FOREIGN KEY (`user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- MONTHLY LIMITS TABLE
-- ============================================================================
CREATE TABLE `sl_monthly_limits` (
  `limit_id` int NOT NULL AUTO_INCREMENT,
  `limit_type` varchar(50) NOT NULL,
  `limit_value` int NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` boolean DEFAULT true,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`limit_id`),
  KEY `idx_monthly_limits_type` (`limit_type`),
  KEY `idx_monthly_limits_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- USER POINTS TABLE (Legacy)
-- ============================================================================
CREATE TABLE `sl_user_points` (
  `point_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `points` int NOT NULL DEFAULT 0,
  `last_monthly_reset` timestamp NULL DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`point_id`),
  UNIQUE KEY `unique_user_points` (`user_id`),
  KEY `idx_user_points_user` (`user_id`),
  KEY `idx_user_points_reset` (`last_monthly_reset`),
  CONSTRAINT `fk_user_points_user` FOREIGN KEY (`user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- CHEERS TABLE
-- ============================================================================
CREATE TABLE `sl_cheers` (
  `cheer_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `points` int NOT NULL DEFAULT 1,
  `message` text DEFAULT NULL,
  `is_moderated` boolean DEFAULT false,
  `moderation_status` enum('pending','approved','rejected') DEFAULT 'pending',
  `moderation_notes` text DEFAULT NULL,
  `moderated_by` varchar(36) DEFAULT NULL,
  `moderated_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`cheer_id`),
  KEY `idx_cheers_user` (`user_id`),
  KEY `idx_cheers_points` (`points`),
  KEY `idx_cheers_moderation` (`is_moderated`, `moderation_status`),
  KEY `idx_cheers_date` (`created_at`),
  CONSTRAINT `fk_cheers_user` FOREIGN KEY (`user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cheers_moderator` FOREIGN KEY (`moderated_by`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- CHEER COMMENTS TABLE
-- ============================================================================
CREATE TABLE `sl_cheer_comments` (
  `comment_id` int NOT NULL AUTO_INCREMENT,
  `cheer_id` int NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `comment` text NOT NULL,
  `is_moderated` boolean DEFAULT false,
  `moderation_status` enum('pending','approved','rejected') DEFAULT 'pending',
  `moderation_notes` text DEFAULT NULL,
  `moderated_by` varchar(36) DEFAULT NULL,
  `moderated_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`comment_id`),
  KEY `idx_cheer_comments_cheer` (`cheer_id`),
  KEY `idx_cheer_comments_user` (`user_id`),
  KEY `idx_cheer_comments_moderation` (`is_moderated`, `moderation_status`),
  KEY `idx_cheer_comments_date` (`created_at`),
  CONSTRAINT `fk_cheer_comments_cheer` FOREIGN KEY (`cheer_id`) REFERENCES `sl_cheers` (`cheer_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cheer_comments_user` FOREIGN KEY (`user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cheer_comments_moderator` FOREIGN KEY (`moderated_by`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE SET NULL
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
  CONSTRAINT `fk_cheer_likes_cheer` FOREIGN KEY (`cheer_id`) REFERENCES `sl_cheers` (`cheer_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cheer_likes_user` FOREIGN KEY (`user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TRANSACTIONS TABLE (Legacy)
-- ============================================================================
CREATE TABLE `sl_transactions` (
  `transaction_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `type` enum('EARNED','SPENT','REFUND','ADMIN_ADJUSTMENT') NOT NULL,
  `amount` int NOT NULL,
  `description` text DEFAULT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`transaction_id`),
  KEY `idx_transactions_user` (`user_id`),
  KEY `idx_transactions_type` (`type`),
  KEY `idx_transactions_reference` (`reference_type`, `reference_id`),
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
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`cart_item_id`),
  KEY `idx_cart_items_cart` (`cart_id`),
  KEY `idx_cart_items_product` (`product_id`),
  CONSTRAINT `fk_cart_items_cart` FOREIGN KEY (`cart_id`) REFERENCES `sl_carts` (`cart_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_items_product` FOREIGN KEY (`product_id`) REFERENCES `sl_products` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- ORDERS TABLE (UPDATED WITH cancelled_at COLUMN)
-- ============================================================================
CREATE TABLE `sl_orders` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `total_points` int NOT NULL,
  `status` enum('pending','processing','completed','cancelled','refunded') DEFAULT 'pending',
  `ordered_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `processed_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`order_id`),
  KEY `idx_orders_user` (`user_id`),
  KEY `idx_orders_status` (`status`),
  KEY `idx_orders_date` (`ordered_at`),
  KEY `idx_orders_cancelled_at` (`cancelled_at`),
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- ORDER ITEMS TABLE
-- ============================================================================
CREATE TABLE `sl_order_items` (
  `order_item_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `product_name` varchar(255) NOT NULL COMMENT 'Snapshot of product name at time of order',
  `price_points` int NOT NULL COMMENT 'Snapshot of price at time of order',
  `quantity` int NOT NULL DEFAULT 1,
  `variation_id` int DEFAULT NULL,
  `variation_details` json DEFAULT NULL COMMENT 'Snapshot of variation details at time of order',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_item_id`),
  KEY `idx_order_items_order` (`order_id`),
  KEY `idx_order_items_product` (`product_id`),
  KEY `fk_order_item_variation` (`variation_id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `sl_orders` (`order_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `sl_products` (`product_id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_order_item_variation` FOREIGN KEY (`variation_id`) REFERENCES `sl_product_variations` (`variation_id`) ON DELETE SET NULL
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
  CONSTRAINT `fk_order_item_variations_type` FOREIGN KEY (`variation_type_id`) REFERENCES `sl_variation_types` (`variation_type_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_item_variations_option` FOREIGN KEY (`option_id`) REFERENCES `sl_variation_options` (`option_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PRODUCT IMAGES TABLE
-- ============================================================================
CREATE TABLE `sl_product_images` (
  `image_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `alt_text` varchar(255) DEFAULT NULL,
  `is_primary` boolean DEFAULT false,
  `is_active` boolean DEFAULT true,
  `sort_order` int DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`image_id`),
  KEY `idx_product_images_product` (`product_id`),
  KEY `idx_product_images_primary` (`is_primary`),
  KEY `idx_product_images_active` (`is_active`),
  KEY `idx_product_images_sort` (`sort_order`),
  CONSTRAINT `fk_product_images_product` FOREIGN KEY (`product_id`) REFERENCES `sl_products` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SAMPLE DATA INSERTS (Optional - Remove if not needed)
-- ============================================================================

-- Sample Categories
INSERT INTO `sl_shop_categories` (`category_name`, `is_active`) VALUES
('SWAGS', 1),
('Electronics', 1),
('Apparel', 1),
('Office Supplies', 1),
('Accessories', 1),
('Gift Items', 1),
('Food & Beverages', 1);

-- Sample Variation Types
INSERT INTO `sl_variation_types` (`type_name`, `type_label`, `is_active`, `sort_order`) VALUES
('size', 'Size', 1, 1),
('color', 'Color', 1, 2),
('material', 'Material', 1, 3),
('design', 'Design', 1, 4),
('capacity', 'Capacity', 1, 5);

-- Sample Variation Options
INSERT INTO `sl_variation_options` (`variation_type_id`, `option_value`, `option_label`, `hex_color`, `is_active`, `sort_order`) VALUES
-- Sizes
(1, 'xs', 'Extra Small', NULL, 1, 1),
(1, 's', 'Small', NULL, 1, 2),
(1, 'm', 'Medium', NULL, 1, 3),
(1, 'l', 'Large', NULL, 1, 4),
(1, 'xl', 'Extra Large', NULL, 1, 5),
-- Colors
(2, 'red', 'Red', '#FF0000', 1, 1),
(2, 'blue', 'Blue', '#0000FF', 1, 2),
(2, 'green', 'Green', '#00FF00', 1, 3),
(2, 'black', 'Black', '#000000', 1, 4),
(2, 'white', 'White', '#FFFFFF', 1, 5),
-- Materials
(3, 'cotton', 'Cotton', NULL, 1, 1),
(3, 'polyester', 'Polyester', NULL, 1, 2),
(3, 'plastic', 'Plastic', NULL, 1, 3),
(3, 'metal', 'Metal', NULL, 1, 4),
-- Designs
(4, 'logo', 'Company Logo', NULL, 1, 1),
(4, 'plain', 'Plain', NULL, 1, 2);

-- ============================================================================
-- PERFORMANCE OPTIMIZATION QUERIES
-- ============================================================================

-- Create additional composite indexes for common query patterns
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

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Products with categories view
CREATE VIEW `v_products_with_categories` AS
SELECT 
  p.*,
  c.category_name,
  c.category_id
FROM `sl_products` p
LEFT JOIN `sl_shop_categories` c ON p.category_id = c.category_id
WHERE p.is_active = true;

-- User heartbits summary view
CREATE VIEW `v_user_heartbits_summary` AS
SELECT 
  u.user_id,
  u.first_name,
  u.last_name,
  u.user_email,
  COALESCE(uh.heartbits_balance, 0) as heartbits_balance,
  COALESCE(uh.total_heartbits_earned, 0) as total_heartbits_earned,
  COALESCE(uh.total_heartbits_spent, 0) as total_heartbits_spent,
  uh.is_suspended,
  uh.suspended_until
FROM `sl_user_accounts` u
LEFT JOIN `sl_user_heartbits` uh ON u.user_id = uh.user_id
WHERE u.is_active = true;

-- Orders summary view
CREATE VIEW `v_orders_summary` AS
SELECT 
  o.*,
  u.first_name,
  u.last_name,
  u.user_email
FROM `sl_orders` o
LEFT JOIN `sl_user_accounts` u ON o.user_id = u.user_id;

-- Cheers with users view
CREATE VIEW `v_cheers_with_users` AS
SELECT 
  c.*,
  u.first_name,
  u.last_name,
  u.user_email
FROM `sl_cheers` c
LEFT JOIN `sl_user_accounts` u ON c.user_id = u.user_id
WHERE c.moderation_status = 'approved' OR c.moderation_status = 'pending';

-- User points summary view
CREATE VIEW `v_user_points_summary` AS
SELECT 
  u.user_id,
  u.first_name,
  u.last_name,
  u.user_email,
  COALESCE(up.points, 0) as points,
  up.last_monthly_reset
FROM `sl_user_accounts` u
LEFT JOIN `sl_user_points` up ON u.user_id = up.user_id
WHERE u.is_active = true; 