-- =====================================================
-- CAROUSEL SCHEMA VERIFICATION SCRIPT
-- =====================================================
-- This script checks what carousel schema components are already applied
-- and identifies what might be missing
-- =====================================================

-- =====================================================
-- 1. CHECK IF JSON COLUMN EXISTS
-- =====================================================

SELECT 
    'JSON Column Check' as check_type,
    CASE 
        WHEN COLUMN_NAME = 'images_json' THEN '✅ images_json column exists'
        ELSE '❌ images_json column missing'
    END as status
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'sl_products' 
AND COLUMN_NAME = 'images_json';

-- =====================================================
-- 2. CHECK IF PRODUCT IMAGES TABLE EXISTS
-- =====================================================

SELECT 
    'Product Images Table' as check_type,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ sl_product_images table exists'
        ELSE '❌ sl_product_images table missing'
    END as status
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'sl_product_images';

-- =====================================================
-- 3. CHECK TABLE STRUCTURE
-- =====================================================

SELECT 
    'Table Structure' as check_type,
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'sl_product_images'
ORDER BY ORDINAL_POSITION;

-- =====================================================
-- 4. CHECK INDEXES
-- =====================================================

SELECT 
    'Indexes' as check_type,
    INDEX_NAME,
    COLUMN_NAME,
    CASE 
        WHEN INDEX_NAME LIKE 'idx_product_images%' THEN '✅ Performance index'
        WHEN INDEX_NAME = 'PRIMARY' THEN '✅ Primary key'
        WHEN INDEX_NAME LIKE 'fk_%' THEN '✅ Foreign key'
        ELSE 'ℹ️ Other index'
    END as status
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'sl_product_images'
ORDER BY INDEX_NAME, SEQ_IN_INDEX;

-- =====================================================
-- 5. CHECK TRIGGERS
-- =====================================================

SELECT 
    'Triggers' as check_type,
    TRIGGER_NAME,
    EVENT_MANIPULATION,
    EVENT_OBJECT_TABLE,
    ACTION_TIMING,
    CASE 
        WHEN TRIGGER_NAME LIKE 'tr_product_images%' THEN '✅ Carousel trigger'
        ELSE 'ℹ️ Other trigger'
    END as status
FROM INFORMATION_SCHEMA.TRIGGERS 
WHERE EVENT_OBJECT_TABLE = 'sl_product_images'
ORDER BY TRIGGER_NAME;

-- =====================================================
-- 6. CHECK FOREIGN KEY CONSTRAINTS
-- =====================================================

SELECT 
    'Foreign Keys' as check_type,
    CONSTRAINT_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME,
    CASE 
        WHEN CONSTRAINT_NAME = 'fk_product_images_product_id' THEN '✅ Product FK exists'
        ELSE 'ℹ️ Other FK'
    END as status
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'sl_product_images'
AND REFERENCED_TABLE_NAME IS NOT NULL;

-- =====================================================
-- 7. CHECK SAMPLE DATA
-- =====================================================

SELECT 
    'Sample Data' as check_type,
    COUNT(*) as total_images,
    COUNT(DISTINCT product_id) as products_with_images,
    COUNT(CASE WHEN is_primary = 1 THEN 1 END) as primary_images
FROM sl_product_images;

-- =====================================================
-- 8. SUMMARY REPORT
-- =====================================================

SELECT 
    'SUMMARY' as check_type,
    'Carousel Schema Status' as description,
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
        ) AND EXISTS (
            SELECT 1 FROM INFORMATION_SCHEMA.TRIGGERS 
            WHERE EVENT_OBJECT_TABLE = 'sl_product_images'
            AND TRIGGER_NAME LIKE 'tr_product_images%'
        ) THEN '✅ COMPLETE - All carousel components are installed'
        ELSE '⚠️ INCOMPLETE - Some components are missing'
    END as overall_status;

-- =====================================================
-- 9. MISSING COMPONENTS CHECK
-- =====================================================

SELECT 'MISSING COMPONENTS' as check_type, 'Check the following:' as description;

-- Check for missing JSON column
SELECT 
    'Missing Component' as component,
    'images_json column in sl_products table' as description,
    'Run: ALTER TABLE sl_products ADD COLUMN images_json JSON DEFAULT NULL;' as fix_command
WHERE NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'sl_products' 
    AND COLUMN_NAME = 'images_json'
);

-- Check for missing table
SELECT 
    'Missing Component' as component,
    'sl_product_images table' as description,
    'Run the CREATE TABLE statement from carousel_schema_alter.sql' as fix_command
WHERE NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'sl_product_images'
);

-- Check for missing triggers
SELECT 
    'Missing Component' as component,
    'Auto sort order trigger' as description,
    'Run the CREATE TRIGGER statements from carousel_schema_alter.sql' as fix_command
WHERE NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.TRIGGERS 
    WHERE EVENT_OBJECT_TABLE = 'sl_product_images'
    AND TRIGGER_NAME = 'tr_product_images_before_insert'
);

-- Check for missing JSON update triggers
SELECT 
    'Missing Component' as component,
    'JSON cache update triggers' as description,
    'Run the CREATE TRIGGER statements for JSON updates' as fix_command
WHERE NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.TRIGGERS 
    WHERE EVENT_OBJECT_TABLE = 'sl_product_images'
    AND TRIGGER_NAME = 'tr_product_images_after_insert'
);

-- =====================================================
-- VERIFICATION COMPLETE
-- ===================================================== 