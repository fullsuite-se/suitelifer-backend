-- ============================================================================
-- OPTIMIZED SHOP SYSTEM SCHEMA FOR MYSQL
-- Created: 2025-07-10
-- Updated: 2025-07-14
-- Description: Complete schema for shop, products, heartbits, cart, orders, and cheer-a-peer system
-- Features: E-commerce, Points/Rewards, Peer Recognition, Social Interactions
-- ============================================================================

-- Set MySQL mode for compatibility
SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO';

-- ============================================================================
-- USER ACCOUNTS TABLE (Reference - should exist)
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
-- SHOP CATEGORIES TABLE
-- ============================================================================
CREATE TABLE `sl_shop_categories` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `category_name` (`category_name`),
  KEY `idx_category_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PRODUCTS TABLE
-- ============================================================================
-- Note: Status column has been removed. Product visibility is controlled by is_active only.
-- This simplifies product management and reduces complexity.
CREATE TABLE `sl_products` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `image_url` varchar(500) DEFAULT NULL,
  `price_points` int NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `category_id` int DEFAULT NULL,
  `featured` tinyint(1) DEFAULT 0,
  `sort_order` int DEFAULT 0,
  `created_by` varchar(36) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`product_id`),
  KEY `idx_products_category` (`category_id`),
  KEY `idx_products_active` (`is_active`),
  KEY `idx_products_price` (`price_points`),
  KEY `idx_products_featured` (`featured`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `sl_shop_categories` (`category_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_products_created_by` FOREIGN KEY (`created_by`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- VARIATION TYPES TABLE (for product variations like size, color, etc.)
-- ============================================================================
CREATE TABLE `sl_variation_types` (
  `variation_type_id` int NOT NULL AUTO_INCREMENT,
  `type_name` varchar(50) NOT NULL,
  `type_label` varchar(100) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `sort_order` int DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`variation_type_id`),
  UNIQUE KEY `unique_type_name` (`type_name`),
  KEY `idx_variation_type_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- VARIATION OPTIONS TABLE (specific options for each variation type)
-- ============================================================================
CREATE TABLE `sl_variation_options` (
  `option_id` int NOT NULL AUTO_INCREMENT,
  `variation_type_id` int NOT NULL,
  `option_value` varchar(100) NOT NULL,
  `option_label` varchar(100) NOT NULL,
  `hex_color` varchar(7) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `sort_order` int DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`option_id`),
  KEY `idx_variation_option_type` (`variation_type_id`),
  KEY `idx_variation_option_active` (`is_active`),
  CONSTRAINT `fk_variation_option_type` FOREIGN KEY (`variation_type_id`) REFERENCES `sl_variation_types` (`variation_type_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PRODUCT VARIATIONS TABLE (specific product variants)
-- ============================================================================
CREATE TABLE `sl_product_variations` (
  `variation_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `variation_sku` varchar(100) DEFAULT NULL,
  `price_adjustment` int DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `weight` decimal(8,2) DEFAULT NULL,
  `dimensions` varchar(100) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`variation_id`),
  UNIQUE KEY `variation_sku` (`variation_sku`),
  KEY `fk_variation_product` (`product_id`),
  KEY `idx_variation_active` (`is_active`),
  CONSTRAINT `fk_variation_product` FOREIGN KEY (`product_id`) REFERENCES `sl_products` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PRODUCT VARIATION OPTIONS MAPPING TABLE
-- ============================================================================
CREATE TABLE `sl_product_variation_options` (
  `variation_option_id` int NOT NULL AUTO_INCREMENT,
  `variation_id` int NOT NULL,
  `option_id` int NOT NULL,
  PRIMARY KEY (`variation_option_id`),
  UNIQUE KEY `unique_variation_option` (`variation_id`,`option_id`),
  KEY `fk_variation_option_option` (`option_id`),
  CONSTRAINT `fk_variation_option_variation` FOREIGN KEY (`variation_id`) REFERENCES `sl_product_variations` (`variation_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_variation_option_option` FOREIGN KEY (`option_id`) REFERENCES `sl_variation_options` (`option_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- USER HEARTBITS TABLE
-- ============================================================================
CREATE TABLE `sl_user_heartbits` (
  `heartbits_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `heartbits_balance` int DEFAULT 0,
  `total_heartbits_earned` int DEFAULT 0,
  `total_heartbits_spent` int DEFAULT 0,
  `is_suspended` tinyint(1) DEFAULT 0,
  `suspension_reason` text DEFAULT NULL,
  `suspended_until` timestamp NULL DEFAULT NULL,
  `suspended_by` varchar(36) DEFAULT NULL,
  `suspended_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`heartbits_id`),
  UNIQUE KEY `idx_user_heartbits_user_id` (`user_id`),
  KEY `idx_user_heartbits_balance` (`heartbits_balance`),
  KEY `idx_user_heartbits_suspended` (`is_suspended`),
  KEY `fk_user_heartbits_suspended_by` (`suspended_by`),
  CONSTRAINT `fk_user_heartbits_user` FOREIGN KEY (`user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_heartbits_suspended_by` FOREIGN KEY (`suspended_by`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- HEARTBITS TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE `sl_heartbits_transactions` (
  `transaction_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `transaction_type` enum('earned','spent','admin_adjustment','monthly_allowance','cheer_received','order_purchase') NOT NULL,
  `points_amount` int NOT NULL,
  `reference_type` enum('order','cheer_post','admin_action','monthly_reset') DEFAULT NULL,
  `reference_id` int DEFAULT NULL,
  `description` text DEFAULT NULL,
  `processed_by` varchar(36) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`transaction_id`),
  KEY `idx_transactions_user` (`user_id`),
  KEY `idx_transactions_type` (`transaction_type`),
  KEY `idx_transactions_reference` (`reference_type`,`reference_id`),
  KEY `idx_transactions_date` (`created_at`),
  CONSTRAINT `fk_transactions_user` FOREIGN KEY (`user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_transactions_processed_by` FOREIGN KEY (`processed_by`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- MONTHLY LIMITS TABLE
-- ============================================================================
CREATE TABLE `sl_monthly_limits` (
  `limit_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `month_year` varchar(7) NOT NULL COMMENT 'Format: YYYY-MM',
  `heartbits_limit` int NOT NULL,
  `heartbits_sent` int DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`limit_id`),
  UNIQUE KEY `unique_user_month` (`user_id`,`month_year`),
  KEY `idx_monthly_limits_user` (`user_id`),
  KEY `idx_monthly_limits_month` (`month_year`),
  CONSTRAINT `fk_monthly_limits_user` FOREIGN KEY (`user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- USER POINTS TABLE (Alternative points system)
-- ============================================================================
CREATE TABLE `sl_user_points` (
  `user_id` varchar(36) NOT NULL,
  `available_points` int DEFAULT 0,
  `total_earned` int DEFAULT 0,
  `total_spent` int DEFAULT 0,
  `monthly_cheer_limit` int DEFAULT 100,
  `monthly_cheer_used` int DEFAULT 0,
  `last_monthly_reset` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  KEY `sl_user_points_user_id_index` (`user_id`),
  KEY `sl_user_points_total_earned_index` (`total_earned`),
  CONSTRAINT `sl_user_points_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- CHEERS TABLE (Peer-to-peer recognition system)
-- ============================================================================
CREATE TABLE `sl_cheers` (
  `cheer_id` varchar(36) NOT NULL,
  `from_user_id` varchar(36) DEFAULT NULL,
  `to_user_id` varchar(36) DEFAULT NULL,
  `points` int DEFAULT 1,
  `message` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`cheer_id`),
  KEY `sl_cheers_from_user_id_created_at_index` (`from_user_id`,`created_at`),
  KEY `sl_cheers_to_user_id_created_at_index` (`to_user_id`,`created_at`),
  CONSTRAINT `sl_cheers_from_user_id_foreign` FOREIGN KEY (`from_user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `sl_cheers_to_user_id_foreign` FOREIGN KEY (`to_user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- CHEER COMMENTS TABLE
-- ============================================================================
CREATE TABLE `sl_cheer_comments` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `cheer_id` varchar(36) DEFAULT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `comment` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `sl_cheer_comments_user_id_foreign` (`user_id`),
  KEY `sl_cheer_comments_cheer_id_created_at_index` (`cheer_id`,`created_at`),
  CONSTRAINT `sl_cheer_comments_cheer_id_foreign` FOREIGN KEY (`cheer_id`) REFERENCES `sl_cheers` (`cheer_id`) ON DELETE CASCADE,
  CONSTRAINT `sl_cheer_comments_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- CHEER LIKES TABLE
-- ============================================================================
CREATE TABLE `sl_cheer_likes` (
  `cheer_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`cheer_id`,`user_id`),
  KEY `sl_cheer_likes_cheer_id_index` (`cheer_id`),
  KEY `sl_cheer_likes_user_id_index` (`user_id`),
  CONSTRAINT `sl_cheer_likes_cheer_id_foreign` FOREIGN KEY (`cheer_id`) REFERENCES `sl_cheers` (`cheer_id`) ON DELETE CASCADE,
  CONSTRAINT `sl_cheer_likes_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- TRANSACTIONS TABLE (General purpose transaction log)
-- ============================================================================
CREATE TABLE `sl_transactions` (
  `transaction_id` varchar(36) NOT NULL,
  `from_user_id` varchar(36) DEFAULT NULL,
  `to_user_id` varchar(36) DEFAULT NULL,
  `type` enum('earned','spent','given','received','bonus','admin_grant','admin_deduct') DEFAULT NULL,
  `amount` int DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  `message` text,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`transaction_id`),
  KEY `sl_transactions_to_user_id_created_at_index` (`to_user_id`,`created_at`),
  KEY `sl_transactions_from_user_id_created_at_index` (`from_user_id`,`created_at`),
  KEY `sl_transactions_type_created_at_index` (`type`,`created_at`),
  CONSTRAINT `sl_transactions_from_user_id_foreign` FOREIGN KEY (`from_user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `sl_transactions_to_user_id_foreign` FOREIGN KEY (`to_user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- CARTS TABLE
-- ============================================================================
CREATE TABLE `sl_carts` (
  `cart_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`cart_id`),
  KEY `idx_carts_user` (`user_id`),
  KEY `idx_carts_created` (`created_at`),
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
  `added_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`cart_item_id`),
  UNIQUE KEY `unique_cart_product_variation` (`cart_id`,`product_id`,`variation_id`),
  KEY `idx_cart_items_cart` (`cart_id`),
  KEY `idx_cart_items_product` (`product_id`),
  KEY `sl_cart_items_variation_id_foreign` (`variation_id`),
  CONSTRAINT `fk_cart_items_cart` FOREIGN KEY (`cart_id`) REFERENCES `sl_carts` (`cart_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_items_product` FOREIGN KEY (`product_id`) REFERENCES `sl_products` (`product_id`) ON DELETE CASCADE,
  CONSTRAINT `sl_cart_items_variation_id_foreign` FOREIGN KEY (`variation_id`) REFERENCES `sl_product_variations` (`variation_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- ORDERS TABLE
-- ============================================================================
CREATE TABLE `sl_orders` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `total_points` int NOT NULL,
  `status` enum('pending','processing','completed','cancelled','refunded') DEFAULT 'pending',
  `ordered_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `processed_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`order_id`),
  KEY `idx_orders_user` (`user_id`),
  KEY `idx_orders_status` (`status`),
  KEY `idx_orders_date` (`ordered_at`),
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
CREATE INDEX `idx_cheer_likes_created_at` ON `sl_cheer_likes` (`created_at`);

-- ============================================================================
-- VIEWS FOR COMMON QUERIES (Optional)
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

-- View for user points summary (alternative to heartbits)
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
-- TRIGGERS FOR DATA CONSISTENCY (Optional)
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
    IF NEW.transaction_type IN ('earned', 'admin_adjustment', 'monthly_allowance', 'cheer_received') THEN
        UPDATE sl_user_heartbits 
        SET heartbits_balance = heartbits_balance + NEW.points_amount,
            total_heartbits_earned = total_heartbits_earned + NEW.points_amount,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = NEW.user_id;
    ELSEIF NEW.transaction_type IN ('spent', 'order_purchase') THEN
        UPDATE sl_user_heartbits 
        SET heartbits_balance = heartbits_balance - NEW.points_amount,
            total_heartbits_spent = total_heartbits_spent + NEW.points_amount,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = NEW.user_id;
    END IF;
END$$

-- Trigger to sync cheer transactions with general transactions table
CREATE TRIGGER `tr_sync_cheer_to_transactions`
AFTER INSERT ON `sl_cheers`
FOR EACH ROW
BEGIN
    -- Insert transaction for the giver (points spent)
    INSERT INTO sl_transactions (
        transaction_id,
        from_user_id,
        to_user_id,
        type,
        amount,
        description,
        message,
        metadata,
        created_at,
        updated_at
    ) VALUES (
        CONCAT(NEW.cheer_id, '-given'),
        NEW.from_user_id,
        NEW.to_user_id,
        'given',
        NEW.points,
        CONCAT('Cheered ', NEW.points, ' heartbits'),
        NEW.message,
        JSON_OBJECT('type', 'cheer', 'cheer_id', NEW.cheer_id),
        NEW.created_at,
        NEW.updated_at
    );
    
    -- Insert transaction for the receiver (points received)
    INSERT INTO sl_transactions (
        transaction_id,
        from_user_id,
        to_user_id,
        type,
        amount,
        description,
        message,
        metadata,
        created_at,
        updated_at
    ) VALUES (
        CONCAT(NEW.cheer_id, '-received'),
        NEW.from_user_id,
        NEW.to_user_id,
        'received',
        NEW.points,
        CONCAT('Received ', NEW.points, ' points from cheer'),
        NEW.message,
        JSON_OBJECT('type', 'cheer', 'cheer_id', NEW.cheer_id),
        NEW.created_at,
        NEW.updated_at
    );
END$$
DELIMITER ;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

-- Reset SQL mode
SET sql_mode = DEFAULT; 