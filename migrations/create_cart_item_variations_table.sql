-- Migration: Create sl_cart_item_variations table for multiple variations per cart item
-- This table allows a cart item to have multiple variation options (e.g., size AND color)

CREATE TABLE IF NOT EXISTS `sl_cart_item_variations` (
  `cart_item_variation_id` int NOT NULL AUTO_INCREMENT,
  `cart_item_id` int NOT NULL,
  `variation_type_id` int NOT NULL,
  `option_id` int NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`cart_item_variation_id`),
  UNIQUE KEY `unique_cart_item_variation` (`cart_item_id`, `variation_type_id`, `option_id`),
  KEY `idx_cart_item_variations_cart_item` (`cart_item_id`),
  KEY `idx_cart_item_variations_type` (`variation_type_id`),
  KEY `idx_cart_item_variations_option` (`option_id`),
  CONSTRAINT `fk_cart_item_variations_cart_item` FOREIGN KEY (`cart_item_id`) REFERENCES `sl_cart_items` (`cart_item_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_item_variations_type` FOREIGN KEY (`variation_type_id`) REFERENCES `sl_variation_types` (`variation_type_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_item_variations_option` FOREIGN KEY (`option_id`) REFERENCES `sl_variation_options` (`option_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migrate existing cart items with variations (if any)
-- Note: This assumes the old variation_id column in sl_cart_items refers to sl_product_variations
-- We need to extract the individual options from those variations and migrate them

-- Create sl_order_item_variations table for multiple variations per order item
CREATE TABLE IF NOT EXISTS `sl_order_item_variations` (
  `order_item_variation_id` int NOT NULL AUTO_INCREMENT,
  `order_item_id` int NOT NULL,
  `variation_type_id` int NOT NULL,
  `option_id` int NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_item_variation_id`),
  UNIQUE KEY `unique_order_item_variation` (`order_item_id`, `variation_type_id`, `option_id`),
  KEY `idx_order_item_variations_order_item` (`order_item_id`),
  KEY `idx_order_item_variations_type` (`variation_type_id`),
  KEY `idx_order_item_variations_option` (`option_id`),
  CONSTRAINT `fk_order_item_variations_order_item` FOREIGN KEY (`order_item_id`) REFERENCES `sl_order_items` (`order_item_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_item_variations_type` FOREIGN KEY (`variation_type_id`) REFERENCES `sl_variation_types` (`variation_type_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_item_variations_option` FOREIGN KEY (`option_id`) REFERENCES `sl_variation_options` (`option_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- For now, just create the table structure
-- Manual data migration may be needed if there are existing cart/order items with variations
