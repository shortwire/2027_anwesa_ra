-- Add Price column to Item_24 table
ALTER TABLE Item_24 ADD COLUMN Price DECIMAL(10, 2) DEFAULT 0.00;

-- Create discou24 table for managing item-specific discounts
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

-- Create HolidayDiscount_24 table for managing holiday discount periods (kept for reference)
CREATE TABLE IF NOT EXISTS HolidayDiscount_24 (
  DiscountID bigint NOT NULL AUTO_INCREMENT,
  HolidayName varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  StartDate DATE NOT NULL,
  EndDate DATE NOT NULL,
  ItemID bigint NOT NULL,
  DiscountPercentage DECIMAL(5, 2) NOT NULL,
  IsActive tinyint(1) DEFAULT 1,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (DiscountID),
  KEY fk_holiday_item_id_24 (ItemID),
  CONSTRAINT fk_holiday_item_id_24 FOREIGN KEY (ItemID) REFERENCES Item_24 (ItemID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add TotalPrice and DiscountAmount columns to Order_24 table
ALTER TABLE Order_24 ADD COLUMN TotalPrice DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE Order_24 ADD COLUMN DiscountAmount DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE Order_24 ADD COLUMN AppliedDiscount DECIMAL(5, 2) DEFAULT 0.00;
ALTER TABLE Order_24 ADD COLUMN OrderDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Sample data for testing
-- First update Item_24 with prices
UPDATE Item_24 SET Price = 100.00 WHERE ItemID = 1;
UPDATE Item_24 SET Price = 250.00 WHERE ItemID = 2;

-- Insert discount data into discou24 table for each item
INSERT INTO discou24 (ItemID, DiscountPercentage, Description, IsActive)
VALUES 
(1, 15.00, 'Standard discount for Item 1', 1),
(2, 10.00, 'Standard discount for Item 2', 1)
ON DUPLICATE KEY UPDATE 
DiscountPercentage = VALUES(DiscountPercentage),
Description = VALUES(Description),
UpdatedAt = CURRENT_TIMESTAMP;

-- SQL Query to add new items to discount table:
-- Use this query when new items are added to Item_24 table
-- INSERT INTO discou24 (ItemID, DiscountPercentage, Description, IsActive)
-- SELECT ItemID, 0.00, CONCAT('Discount for ', ItemDesc), 1
-- FROM Item_24
-- WHERE ItemID NOT IN (SELECT ItemID FROM discou24)
-- ON DUPLICATE KEY UPDATE IsActive = VALUES(IsActive);

-- Sample holiday discount (optional - for date-specific discounts)
INSERT INTO HolidayDiscount_24 (HolidayName, StartDate, EndDate, ItemID, DiscountPercentage, IsActive)
VALUES 
('Diwali Sale', '2025-10-20', '2025-11-10', 1, 15.00, 1),
('Diwali Sale', '2025-10-20', '2025-11-10', 2, 10.00, 1),
('New Year Sale', '2026-01-01', '2026-01-15', 1, 20.00, 1),
('New Year Sale', '2026-01-01', '2026-01-15', 2, 12.00, 1);
