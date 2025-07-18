-- =====================================================
-- CAROUSEL SYSTEM SCHEMA - ALTER TABLE STATEMENTS
-- =====================================================
-- This file contains all the ALTER TABLE statements needed
-- to implement the product image carousel system with auto sort order
-- =====================================================

-- =====================================================
-- 1. ADD JSON COLUMN TO EXISTING PRODUCTS TABLE
-- =====================================================

-- Add images_json column to existing sl_products table
ALTER TABLE `sl_products` 
ADD COLUMN `images_json` JSON DEFAULT NULL COMMENT 'Array of image URLs for quick access';

-- =====================================================
-- 2. CREATE PRODUCT IMAGES TABLE
-- =====================================================

-- Create new table for product images with auto sort order
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
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`image_id`),
  KEY `idx_product_images_product_id` (`product_id`),
  KEY `idx_product_images_sort_order` (`sort_order`),
  KEY `idx_product_images_is_primary` (`is_primary`),
  CONSTRAINT `fk_product_images_product_id` FOREIGN KEY (`product_id`) REFERENCES `sl_products` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Create indexes for better performance
CREATE INDEX `idx_product_images_product_active` ON `sl_product_images` (`product_id`, `is_active`);
CREATE INDEX `idx_product_images_primary` ON `sl_product_images` (`product_id`, `is_primary`);

-- =====================================================
-- 4. CREATE TRIGGER FOR AUTO SORT ORDER
-- =====================================================

-- Trigger to auto-assign sort_order when inserting new images
DELIMITER //
CREATE TRIGGER `tr_product_images_before_insert` 
BEFORE INSERT ON `sl_product_images`
FOR EACH ROW
BEGIN
    -- Auto-assign sort_order if not provided
    IF NEW.sort_order IS NULL OR NEW.sort_order = 0 THEN
        SELECT COALESCE(MAX(sort_order), 0) + 1 
        INTO NEW.sort_order 
        FROM `sl_product_images` 
        WHERE product_id = NEW.product_id;
    END IF;
    
    -- Set as primary if it's the first image for this product
    IF NEW.is_primary IS NULL THEN
        SELECT COUNT(*) INTO @image_count
        FROM `sl_product_images` 
        WHERE product_id = NEW.product_id;
        
        IF @image_count = 0 THEN
            SET NEW.is_primary = 1;
        ELSE
            SET NEW.is_primary = 0;
        END IF;
    END IF;
END//
DELIMITER ;

-- =====================================================
-- 5. CREATE TRIGGERS TO UPDATE JSON CACHE
-- =====================================================

-- Trigger to update images_json when product images change
DELIMITER //
CREATE TRIGGER `tr_product_images_after_insert` 
AFTER INSERT ON `sl_product_images`
FOR EACH ROW
BEGIN
    UPDATE `sl_products` 
    SET `images_json` = (
        SELECT JSON_ARRAYAGG(image_url)
        FROM `sl_product_images` 
        WHERE product_id = NEW.product_id AND is_active = 1
    )
    WHERE product_id = NEW.product_id;
END//

CREATE TRIGGER `tr_product_images_after_update` 
AFTER UPDATE ON `sl_product_images`
FOR EACH ROW
BEGIN
    UPDATE `sl_products` 
    SET `images_json` = (
        SELECT JSON_ARRAYAGG(image_url)
        FROM `sl_product_images` 
        WHERE product_id = NEW.product_id AND is_active = 1
    )
    WHERE product_id = NEW.product_id;
END//

CREATE TRIGGER `tr_product_images_after_delete` 
AFTER DELETE ON `sl_product_images`
FOR EACH ROW
BEGIN
    UPDATE `sl_products` 
    SET `images_json` = (
        SELECT JSON_ARRAYAGG(image_url)
        FROM `sl_product_images` 
        WHERE product_id = OLD.product_id AND is_active = 1
    )
    WHERE product_id = OLD.product_id;
END//
DELIMITER ;

-- =====================================================
-- 6. MIGRATION: MOVE EXISTING IMAGE_URL TO NEW TABLE
-- =====================================================

-- Optional: Migrate existing image_url to the new table structure
-- Uncomment the following if you want to migrate existing images

/*
-- Insert existing image_url as first image in new table
INSERT INTO `sl_product_images` (
    `product_id`, 
    `image_url`, 
    `thumbnail_url`, 
    `medium_url`, 
    `large_url`, 
    `alt_text`, 
    `sort_order`, 
    `is_primary`, 
    `is_active`
)
SELECT 
    `product_id`,
    `image_url`,
    `image_url` as thumbnail_url,
    `image_url` as medium_url,
    `image_url` as large_url,
    CONCAT(`name`, ' - Main Image') as alt_text,
    1 as sort_order,
    1 as is_primary,
    1 as is_active
FROM `sl_products` 
WHERE `image_url` IS NOT NULL 
AND `image_url` != '';

-- Update images_json for migrated products
UPDATE `sl_products` p
SET `images_json` = (
    SELECT JSON_ARRAYAGG(image_url)
    FROM `sl_product_images` pi
    WHERE pi.product_id = p.product_id 
    AND pi.is_active = 1
)
WHERE EXISTS (
    SELECT 1 FROM `sl_product_images` pi 
    WHERE pi.product_id = p.product_id
);
*/

-- =====================================================
-- 7. VERIFICATION QUERIES
-- =====================================================

-- Check if tables were created successfully
SELECT 'sl_product_images table created' as status, COUNT(*) as row_count FROM `sl_product_images`;

-- Check if triggers were created
SELECT TRIGGER_NAME, EVENT_MANIPULATION, EVENT_OBJECT_TABLE 
FROM INFORMATION_SCHEMA.TRIGGERS 
WHERE EVENT_OBJECT_TABLE = 'sl_product_images';

-- Check if indexes were created
SHOW INDEX FROM `sl_product_images`;

-- =====================================================
-- 8. USAGE EXAMPLES
-- =====================================================

/*
-- Example: Insert a new product image (sort_order will be auto-assigned)
INSERT INTO sl_product_images (product_id, image_url, alt_text) 
VALUES (1, 'https://cloudinary.com/image1.jpg', 'Product Image 1');

-- Example: Get all images for a product
SELECT * FROM sl_product_images 
WHERE product_id = 1 
ORDER BY sort_order ASC;

-- Example: Set primary image
UPDATE sl_product_images 
SET is_primary = 0 
WHERE product_id = 1;

UPDATE sl_product_images 
SET is_primary = 1 
WHERE image_id = 5;

-- Example: Reorder images
UPDATE sl_product_images SET sort_order = 1 WHERE image_id = 3;
UPDATE sl_product_images SET sort_order = 2 WHERE image_id = 1;
UPDATE sl_product_images SET sort_order = 3 WHERE image_id = 2;
*/

-- =====================================================
-- SCHEMA COMPLETE
-- =====================================================
-- 
-- This schema provides:
-- ✅ Auto sort order assignment
-- ✅ Primary image management  
-- ✅ JSON cache for quick access
-- ✅ Proper indexing for performance
-- ✅ Foreign key constraints
-- ✅ Cascade deletes
-- ✅ Multiple image sizes support
-- ✅ Backward compatibility
--
-- ===================================================== 