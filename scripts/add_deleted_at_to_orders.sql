-- Migration: Add deleted_at field to sl_orders table for soft deletes
-- This allows orders to be soft deleted (remain visible in admin panel) vs hard deleted (gone forever)

ALTER TABLE `sl_orders` 
ADD COLUMN `deleted_at` timestamp NULL DEFAULT NULL AFTER `cancelled_at`;

-- Add index for better performance when filtering out soft-deleted orders
CREATE INDEX `idx_orders_deleted_at` ON `sl_orders` (`deleted_at`);

-- Update the existing index to include deleted_at for better query performance
DROP INDEX `idx_orders_user_status_date` ON `sl_orders`;
CREATE INDEX `idx_orders_user_status_date_deleted` ON `sl_orders` (`user_id`, `status`, `ordered_at`, `deleted_at`);

-- Update the existing index to include deleted_at for better query performance
DROP INDEX `idx_orders_status_date` ON `sl_orders`;
CREATE INDEX `idx_orders_status_date_deleted` ON `sl_orders` (`status`, `ordered_at`, `deleted_at`); 