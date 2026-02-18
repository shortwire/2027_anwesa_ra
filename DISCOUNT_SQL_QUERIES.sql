-- ====================================
-- DISCOUNT MANAGEMENT SQL QUERIES
-- For discou24 Table
-- ====================================

-- ====================================
-- 1. VIEW ALL ITEM DISCOUNTS
-- ====================================

-- View all discounts with item details
SELECT 
  d.DiscountID,
  d.ItemID,
  i.ItemDesc,
  i.Price,
  d.DiscountPercentage,
  d.Description,
  d.IsActive,
  d.CreatedAt,
  d.UpdatedAt
FROM discou24 d
LEFT JOIN Item_24 i ON d.ItemID = i.ItemID
ORDER BY d.DiscountPercentage DESC, d.ItemID;

-- ====================================
-- 2. ADD NEW ITEMS TO DISCOUNT TABLE
-- ====================================

-- Add items that don't have discount records yet (default to 0%)
INSERT INTO discou24 (ItemID, DiscountPercentage, Description, IsActive)
SELECT ItemID, 0.00, CONCAT('Discount for ', ItemDesc), 1
FROM Item_24
WHERE ItemID NOT IN (SELECT ItemID FROM discou24)
ON DUPLICATE KEY UPDATE IsActive = VALUES(IsActive);

-- ====================================
-- 3. UPDATE DISCOUNTS FOR SPECIFIC ITEMS
-- ====================================

-- Update discount for a single item
UPDATE discou24 
SET DiscountPercentage = 15.00, 
    Description = 'Special discount - updated today'
WHERE ItemID = 1;

-- Update discounts for multiple specific items
UPDATE discou24 
SET DiscountPercentage = 10.00
WHERE ItemID IN (1, 2, 3);

-- Update all active discounts to a specific percentage
UPDATE discou24 
SET DiscountPercentage = 12.00 
WHERE IsActive = 1;

-- Update discount with timestamp
UPDATE discou24 
SET DiscountPercentage = 20.00, 
    UpdatedAt = CURRENT_TIMESTAMP
WHERE ItemID = 1;

-- ====================================
-- 4. BULK INSERT DISCOUNTS
-- ====================================

-- Insert multiple discounts at once
INSERT INTO discou24 (ItemID, DiscountPercentage, Description, IsActive)
VALUES 
(3, 12.50, 'Standard discount for Item 3', 1),
(4, 8.75, 'Clearance discount for Item 4', 1),
(5, 15.00, 'Premium member discount for Item 5', 1),
(6, 5.00, 'New item introduction discount', 1)
ON DUPLICATE KEY UPDATE 
  DiscountPercentage = VALUES(DiscountPercentage),
  Description = VALUES(Description),
  IsActive = 1;

-- ====================================
-- 5. DISABLE/ENABLE DISCOUNTS
-- ====================================

-- Deactivate a specific item's discount
UPDATE discou24 
SET IsActive = 0 
WHERE ItemID = 1;

-- Reactivate a specific item's discount
UPDATE discou24 
SET IsActive = 1 
WHERE ItemID = 1;

-- Deactivate all discounts above a certain percentage
UPDATE discou24 
SET IsActive = 0 
WHERE DiscountPercentage > 20;

-- Deactivate all discounts for discontinued items
UPDATE discou24 d
SET d.IsActive = 0
WHERE d.ItemID IN (
  SELECT ItemID FROM Item_24 WHERE Qty = 0
);

-- Enable all discounts that were previously active
UPDATE discou24 
SET IsActive = 1 
WHERE IsActive = 0;

-- ====================================
-- 6. DELETE DISCOUNT RECORDS
-- ====================================

-- Delete discount for a specific item
DELETE FROM discou24 WHERE ItemID = 1;

-- Delete all 0% discounts
DELETE FROM discou24 WHERE DiscountPercentage = 0.00;

-- Delete discounts for items that no longer exist
DELETE FROM discou24 
WHERE ItemID NOT IN (SELECT ItemID FROM Item_24);

-- ====================================
-- 7. FIND ITEMS WITHOUT DISCOUNTS
-- ====================================

-- Find items that don't have discount records
SELECT i.ItemID, i.ItemDesc, i.Price, i.Qty
FROM Item_24 i
WHERE i.ItemID NOT IN (SELECT ItemID FROM discou24)
ORDER BY i.ItemID;

-- Find items with no discount (0%)
SELECT d.ItemID, i.ItemDesc, i.Price, d.DiscountPercentage
FROM discou24 d
JOIN Item_24 i ON d.ItemID = i.ItemID
WHERE d.DiscountPercentage = 0.00
ORDER BY i.ItemID;

-- Find inactive discounts
SELECT d.ItemID, i.ItemDesc, d.DiscountPercentage, d.IsActive
FROM discou24 d
LEFT JOIN Item_24 i ON d.ItemID = i.ItemID
WHERE d.IsActive = 0;

-- ====================================
-- 8. VIEW ORDERS WITH DISCOUNT DETAILS
-- ====================================

-- View all orders with applied discounts
SELECT 
  o.OrderID,
  o.CustomerID,
  c.CustomerName,
  o.ItemID,
  i.ItemDesc,
  o.Qty,
  i.Price,
  (i.Price * o.Qty) AS Subtotal,
  o.AppliedDiscount,
  o.DiscountAmount,
  o.totalprice,
  o.OrderDate
FROM Order_24 o
JOIN Customer_24 c ON o.CustomerID = c.CustomerID
JOIN Item_24 i ON o.ItemID = i.ItemID
WHERE o.AppliedDiscount > 0
ORDER BY o.OrderID DESC;

-- View orders without discounts
SELECT 
  o.OrderID,
  o.CustomerID,
  c.CustomerName,
  o.ItemID,
  i.ItemDesc,
  o.Qty,
  o.totalprice
FROM Order_24 o
JOIN Customer_24 c ON o.CustomerID = c.CustomerID
JOIN Item_24 i ON o.ItemID = i.ItemID
WHERE o.AppliedDiscount = 0
ORDER BY o.OrderID DESC;

-- ====================================
-- 9. DISCOUNT ANALYTICS
-- ====================================

-- Total discount given per item
SELECT 
  d.ItemID,
  i.ItemDesc,
  d.DiscountPercentage,
  COUNT(o.OrderID) AS OrdersWithDiscount,
  ROUND(SUM(o.DiscountAmount), 2) AS TotalDiscountGiven
FROM discou24 d
LEFT JOIN Item_24 i ON d.ItemID = i.ItemID
LEFT JOIN Order_24 o ON d.ItemID = o.ItemID AND o.AppliedDiscount > 0
GROUP BY d.ItemID, i.ItemDesc, d.DiscountPercentage
ORDER BY TotalDiscountGiven DESC;

-- Average discount percentage in use
SELECT 
  AVG(DiscountPercentage) AS AvgDiscountPercentage,
  MIN(DiscountPercentage) AS MinDiscount,
  MAX(DiscountPercentage) AS MaxDiscount,
  COUNT(*) AS TotalItemsWithDiscount
FROM discou24
WHERE IsActive = 1;

-- Items with highest discounts
SELECT 
  d.ItemID,
  i.ItemDesc,
  d.DiscountPercentage,
  i.Price,
  ROUND(i.Price * (d.DiscountPercentage / 100), 2) AS DiscountAmount
FROM discou24 d
JOIN Item_24 i ON d.ItemID = i.ItemID
WHERE d.IsActive = 1
ORDER BY d.DiscountPercentage DESC
LIMIT 10;

-- Revenue impact of discounts
SELECT 
  DATE(o.OrderDate) AS OrderDate,
  COUNT(DISTINCT o.OrderID) AS TotalOrders,
  SUM(o.totalprice) AS TotalRevenue,
  ROUND(SUM(o.DiscountAmount), 2) AS TotalDiscountGiven,
  ROUND(SUM(o.totalprice) + SUM(o.DiscountAmount), 2) AS RevenueWithoutDiscount,
  ROUND((SUM(o.DiscountAmount) / (SUM(o.totalprice) + SUM(o.DiscountAmount)) * 100), 2) AS DiscountPercentageOfRevenue
FROM Order_24 o
WHERE o.AppliedDiscount > 0
GROUP BY DATE(o.OrderDate)
ORDER BY OrderDate DESC;

-- ====================================
-- 10. INTEGRITY CHECKS
-- ====================================

-- Find orphaned discount records (items that don't exist)
SELECT d.ItemID, d.DiscountPercentage, d.Description
FROM discou24 d
WHERE d.ItemID NOT IN (SELECT ItemID FROM Item_24);

-- Check for duplicate item discounts (should not happen with UNIQUE constraint)
SELECT ItemID, COUNT(*) as DuplicateCount
FROM discou24
GROUP BY ItemID
HAVING COUNT(*) > 1;

-- List all discount records in order
SELECT * FROM discou24
ORDER BY ItemID;

-- ====================================
-- 11. MAINTENANCE QUERIES
-- ====================================

-- Reset all discounts to 0% (disable all)
UPDATE discou24 SET DiscountPercentage = 0.00 WHERE IsActive = 1;

-- Mark all discounts as inactive
UPDATE discou24 SET IsActive = 0;

-- Rebuild discount table (delete and recreate from items)
DELETE FROM discou24;
INSERT INTO discou24 (ItemID, DiscountPercentage, Description, IsActive)
SELECT ItemID, 0.00, CONCAT('Discount for ', ItemDesc), 1
FROM Item_24;

-- Update descriptions for all items
UPDATE discou24 d
SET d.Description = CONCAT('Item: ', (SELECT ItemDesc FROM Item_24 WHERE ItemID = d.ItemID))
WHERE d.Description IS NULL OR d.Description = '';

-- ====================================
-- 12. SEASONAL/PROMOTIONAL UPDATES
-- ====================================

-- Apply 15% discount for New Year sale (items 1-5)
UPDATE discou24
SET DiscountPercentage = 15.00,
    Description = 'New Year Sale 2026 - 15% off',
    UpdatedAt = CURRENT_TIMESTAMP
WHERE ItemID IN (1, 2, 3, 4, 5);

-- Clear all discounts after sale
UPDATE discou24
SET DiscountPercentage = 0.00,
    Description = 'Discount cleared - sale ended',
    UpdatedAt = CURRENT_TIMESTAMP
WHERE DiscountPercentage > 0;

-- Tiered discounts based on item price
UPDATE discou24 d
JOIN Item_24 i ON d.ItemID = i.ItemID
SET d.DiscountPercentage = 
  CASE 
    WHEN i.Price >= 10000 THEN 20.00
    WHEN i.Price >= 5000 THEN 15.00
    WHEN i.Price >= 1000 THEN 10.00
    ELSE 5.00
  END
WHERE d.IsActive = 1;

-- ====================================
-- 13. QUICK DISCOUNT RETRIEVAL
-- ====================================

-- Get discount for a specific item (e.g., ItemID = 1)
SELECT DiscountPercentage FROM discou24 WHERE ItemID = 1 AND IsActive = 1;

-- Get all active discounts with item info
SELECT 
  d.ItemID,
  i.ItemDesc,
  d.DiscountPercentage
FROM discou24 d
JOIN Item_24 i ON d.ItemID = i.ItemID
WHERE d.IsActive = 1;
