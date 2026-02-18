-- Add missing columns to Order_24 table
ALTER TABLE Order_24 ADD COLUMN IF NOT EXISTS TotalPrice DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE Order_24 ADD COLUMN IF NOT EXISTS DiscountAmount DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE Order_24 ADD COLUMN IF NOT EXISTS AppliedDiscount DECIMAL(5, 2) DEFAULT 0.00;
ALTER TABLE Order_24 ADD COLUMN IF NOT EXISTS OrderDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create discou24 table if it doesn't exist
CREATE TABLE IF NOT EXISTS discou24 (
  DiscountID bigint NOT NULL AUTO_INCREMENT,
  ItemID bigint NOT NULL,
  DiscountPercentage DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  Description varchar(255) COLLATE utf8mb4_unicode_ci,
  IsActive tinyint(1) DEFAULT 1,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (DiscountID),
  UNIQUE KEY uk_discount_item_24 (ItemID),
  KEY fk_discount_item_id_24 (ItemID),
  CONSTRAINT fk_discount_item_id_24 FOREIGN KEY (ItemID) REFERENCES Item_24 (ItemID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add initial discount data for existing items
INSERT INTO discou24 (ItemID, DiscountPercentage, Description, IsActive)
SELECT ItemID, 0.00, CONCAT('Discount for ', ItemDesc), 1
FROM Item_24
WHERE ItemID NOT IN (SELECT ItemID FROM discou24)
ON DUPLICATE KEY UPDATE IsActive = VALUES(IsActive);
