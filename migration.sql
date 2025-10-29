-- Add Stellar fields to existing tables

-- Add Stellar wallet fields to site table
ALTER TABLE `site`
  ADD COLUMN IF NOT EXISTS `stellar_public_key` varchar(56) NULL,
  ADD COLUMN IF NOT EXISTS `stellar_secret_key` varchar(100) NULL;

-- Add email and Stellar public key to customer table
ALTER TABLE `customer`
  ADD COLUMN IF NOT EXISTS `email` varchar(255) NULL,
  ADD COLUMN IF NOT EXISTS `stellar_public_key` varchar(56) NULL;

-- Create debt table if it doesn't exist
CREATE TABLE IF NOT EXISTS `debt` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `created_by` varchar(255) NULL COMMENT 'usuario que creó el registro',
  `updated_by` varchar(255) NULL COMMENT 'usuario que actualizó el registro',
  `created_at` timestamp NULL COMMENT 'Fecha de creación' DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL COMMENT 'Fecha de última actualización' DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp(6) NULL COMMENT 'Logical deletion date',
  `site_id` int UNSIGNED NOT NULL,
  `customer_id` int UNSIGNED NOT NULL,
  `created_by_user_id` int UNSIGNED NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `paid_amount` decimal(10,2) NOT NULL DEFAULT 0,
  `pending_amount` decimal(10,2) NOT NULL,
  `description` text NULL,
  `status` enum('pending', 'partial', 'paid', 'cancelled') NOT NULL DEFAULT 'pending',
  `payment_type` enum('stripe', 'cash', 'transfer', 'stellar') NULL,
  `payment_reference` varchar(255) NULL,
  `stellar_tx_hash` varchar(64) NULL,
  `notes` text NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_site_id` (`site_id`),
  INDEX `idx_customer_id` (`customer_id`),
  INDEX `idx_created_by_user_id` (`created_by_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
