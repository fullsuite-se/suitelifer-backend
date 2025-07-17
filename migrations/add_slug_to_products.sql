-- ============================================================================
-- MIGRATION: Add slug column to sl_products table
-- Date: 2025-07-17
-- Description: Add slug field to products table for SEO-friendly URLs
-- ============================================================================

-- Add slug column to products table
ALTER TABLE `sl_products` 
ADD COLUMN `slug` varchar(255) DEFAULT NULL AFTER `price_points`;

-- Add unique index for slug
ALTER TABLE `sl_products` 
ADD UNIQUE KEY `unique_product_slug` (`slug`);

-- Update existing products with auto-generated slugs
UPDATE `sl_products` 
SET `slug` = LOWER(
  REPLACE(
    REPLACE(
      REPLACE(
        REPLACE(
          REPLACE(
            REPLACE(name, ' ', '-'),
            '&', 'and'
          ),
          '.', ''
        ),
        ',', ''
      ),
      '(', ''
    ),
    ')', ''
  )
)
WHERE `slug` IS NULL;

-- Make slug not null after populating existing records
ALTER TABLE `sl_products` 
MODIFY COLUMN `slug` varchar(255) NOT NULL;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
