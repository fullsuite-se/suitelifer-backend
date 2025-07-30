-- Migration: Add indexes for deleted_at field in sl_orders table
-- The deleted_at field already exists, we just need to add indexes for performance

-- Add index for better performance when filtering out soft-deleted orders
CREATE INDEX `idx_orders_deleted_at` ON `sl_orders` (`deleted_at`);

-- Update the existing index to include deleted_at for better query performance
DROP INDEX `idx_orders_user_status_date` ON `sl_orders`;
CREATE INDEX `idx_orders_user_status_date_deleted` ON `sl_orders` (`user_id`, `status`, `ordered_at`, `deleted_at`);

-- Update the existing index to include deleted_at for better query performance
DROP INDEX `idx_orders_status_date` ON `sl_orders`;
CREATE INDEX `idx_orders_status_date_deleted` ON `sl_orders` (`status`, `ordered_at`, `deleted_at`); 