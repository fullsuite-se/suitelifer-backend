-- Migration: Add cancelled_at column to sl_orders table
-- Date: 2025-07-28
-- Description: Adds cancelled_at timestamp column to track when orders are cancelled

ALTER TABLE `sl_orders` 
ADD COLUMN `cancelled_at` timestamp NULL DEFAULT NULL 
AFTER `completed_at`;

-- Add index for better performance when querying cancelled orders
CREATE INDEX `idx_orders_cancelled_at` ON `sl_orders` (`cancelled_at`); 