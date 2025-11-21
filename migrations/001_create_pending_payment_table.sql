-- Migration: Create pending_payment table
-- Description: Stores pending payments waiting for admin approval
-- Date: 2025-01-21

CREATE TABLE IF NOT EXISTS `pending_payment` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `debt_id` INT UNSIGNED NOT NULL,
  `customer_id` INT UNSIGNED NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `payment_type` ENUM('cash', 'transfer', 'stripe', 'stellar') NOT NULL,
  `reference` VARCHAR(255) DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  `stellar_tx_hash` VARCHAR(64) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_debt_id` (`debt_id`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_pending_payment_debt`
    FOREIGN KEY (`debt_id`) REFERENCES `debt` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pending_payment_customer`
    FOREIGN KEY (`customer_id`) REFERENCES `customer` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add indexes for better query performance
CREATE INDEX idx_pending_payment_status_created ON pending_payment(status, created_at DESC);
CREATE INDEX idx_pending_payment_customer_status ON pending_payment(customer_id, status);
