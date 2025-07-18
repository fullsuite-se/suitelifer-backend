-- =====================================================
-- FIX MISSING CAROUSEL COMPONENTS
-- =====================================================
-- This script adds any missing carousel schema components
-- Run this if the verification script shows missing components
-- =====================================================

-- =====================================================
-- 1. ADD JSON COLUMN (if missing)
-- =====================================================

-- Check if images_json column exists, if not add it
SET @json_column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'sl_products' 
    AND COLUMN_NAME = 'images_json'
);

SET @sql = IF(@json_column_exists = 0,
    'ALTER TABLE `sl_products` ADD COLUMN `images_json` JSON DEFAULT NULL COMMENT \'Array of image URLs for quick access\';',
    'SELECT \'images_json column already exists\' as status;'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 2. CREATE PRODUCT IMAGES TABLE (if missing)
-- =====================================================

-- Check if table exists, if not create it
SET @table_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'sl_product_images'
);

SET @create_table_sql = IF(@table_exists = 0,
    'CREATE TABLE `sl_product_images` (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;',
    'SELECT \'sl_product_images table already exists\' as status;'
);

PREPARE stmt FROM @create_table_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 3. CREATE INDEXES (if missing)
-- =====================================================

-- Check and create performance indexes
SET @index1_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'sl_product_images'
    AND INDEX_NAME = 'idx_product_images_product_active'
);

SET @index2_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'sl_product_images'
    AND INDEX_NAME = 'idx_product_images_primary'
);

-- Create missing indexes
SET @create_index1_sql = IF(@index1_exists = 0,
    'CREATE INDEX `idx_product_images_product_active` ON `sl_product_images` (`product_id`, `is_active`);',
    'SELECT \'idx_product_images_product_active index already exists\' as status;'
);

SET @create_index2_sql = IF(@index2_exists = 0,
    'CREATE INDEX `idx_product_images_primary` ON `sl_product_images` (`product_id`, `is_primary`);',
    'SELECT \'idx_product_images_primary index already exists\' as status;'
);

PREPARE stmt FROM @create_index1_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

PREPARE stmt FROM @create_index2_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 4. CREATE TRIGGERS (if missing)
-- =====================================================

-- Check if auto sort order trigger exists
SET @trigger1_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.TRIGGERS 
    WHERE EVENT_OBJECT_TABLE = 'sl_product_images'
    AND TRIGGER_NAME = 'tr_product_images_before_insert'
);

-- Create auto sort order trigger if missing
SET @create_trigger1_sql = IF(@trigger1_exists = 0,
    'DELIMITER //
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
        
        -- Set as primary if it\'s the first image for this product
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
    DELIMITER ;',
    'SELECT \'tr_product_images_before_insert trigger already exists\' as status;'
);

-- Note: We can\'t use PREPARE for DELIMITER statements, so we\'ll check and provide manual instructions
SELECT 
    CASE 
        WHEN @trigger1_exists = 0 THEN '⚠️ Please manually run the CREATE TRIGGER statement for tr_product_images_before_insert'
        ELSE '✅ Auto sort order trigger exists'
    END as trigger_status;

-- Check if JSON update triggers exist
SET @trigger2_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.TRIGGERS 
    WHERE EVENT_OBJECT_TABLE = 'sl_product_images'
    AND TRIGGER_NAME = 'tr_product_images_after_insert'
);

SET @trigger3_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.TRIGGERS 
    WHERE EVENT_OBJECT_TABLE = 'sl_product_images'
    AND TRIGGER_NAME = 'tr_product_images_after_update'
);

SET @trigger4_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.TRIGGERS 
    WHERE EVENT_OBJECT_TABLE = 'sl_product_images'
    AND TRIGGER_NAME = 'tr_product_images_after_delete'
);

SELECT 
    CASE 
        WHEN @trigger2_exists = 0 THEN '⚠️ Missing: tr_product_images_after_insert trigger'
        ELSE '✅ tr_product_images_after_insert trigger exists'
    END as trigger2_status,
    CASE 
        WHEN @trigger3_exists = 0 THEN '⚠️ Missing: tr_product_images_after_update trigger'
        ELSE '✅ tr_product_images_after_update trigger exists'
    END as trigger3_status,
    CASE 
        WHEN @trigger4_exists = 0 THEN '⚠️ Missing: tr_product_images_after_delete trigger'
        ELSE '✅ tr_product_images_after_delete trigger exists'
    END as trigger4_status;

-- =====================================================
-- 5. FINAL STATUS CHECK
-- =====================================================

SELECT 
    'FINAL STATUS' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'sl_products' 
            AND COLUMN_NAME = 'images_json'
        ) AND EXISTS (
            SELECT 1 FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'sl_product_images'
        ) THEN '✅ Core components are ready'
        ELSE '❌ Core components are missing'
    END as status;

-- =====================================================
-- 6. MANUAL TRIGGER CREATION INSTRUCTIONS
-- =====================================================

SELECT 
    'MANUAL STEPS' as instruction_type,
    'If any triggers are missing, run these manually:' as description;

SELECT 
    'Missing Trigger' as trigger_name,
    'CREATE TRIGGER statement from carousel_schema_alter.sql' as action
WHERE @trigger1_exists = 0 OR @trigger2_exists = 0 OR @trigger3_exists = 0 OR @trigger4_exists = 0;

-- =====================================================
-- FIX COMPLETE
-- ===================================================== 