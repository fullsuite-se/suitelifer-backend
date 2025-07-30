-- ============================================================================
-- CREATE CART ITEM VARIATIONS TABLE MIGRATION
-- ============================================================================
-- Date: 2025-01-27
-- Description: Add missing sl_cart_item_variations table for cart item variations
-- ============================================================================

-- Create the cart item variations table
CREATE TABLE IF NOT EXISTS `sl_cart_item_variations` (
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

-- Add indexes for better performance
CREATE INDEX `idx_cart_item_variations_item_type` ON `sl_cart_item_variations` (`cart_item_id`, `variation_type_id`);
CREATE INDEX `idx_cart_item_variations_created_at` ON `sl_cart_item_variations` (`created_at`); 