-- Migration: Create join table for product variations and options
CREATE TABLE IF NOT EXISTS sl_product_variation_options (
  id INT AUTO_INCREMENT PRIMARY KEY,
  variation_id INT NOT NULL,
  option_id INT NOT NULL,
  FOREIGN KEY (variation_id) REFERENCES sl_product_variations(variation_id) ON DELETE CASCADE,
  FOREIGN KEY (option_id) REFERENCES sl_variation_options(option_id) ON DELETE CASCADE
); 