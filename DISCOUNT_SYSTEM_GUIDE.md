# Discount Management System Guide

## Overview

The discount system has been restructured to use a dedicated `discou24` table for managing item-specific discounts. Each item in the `Item_24` table has a corresponding discount record in the `discou24` table.

## Key Changes

### 1. New Database Table: `discou24`

The `discou24` table manages item-level discounts:

```sql
CREATE TABLE discou24 (
  DiscountID bigint NOT NULL AUTO_INCREMENT,
  ItemID bigint NOT NULL,
  DiscountPercentage DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  Description varchar(255),
  IsActive tinyint(1) DEFAULT 1,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (DiscountID),
  UNIQUE KEY uk_discount_item_24 (ItemID),
  FOREIGN KEY (ItemID) REFERENCES Item_24 (ItemID) ON DELETE CASCADE
)
```

**Columns:**
- `DiscountID`: Unique identifier for the discount record
- `ItemID`: Foreign key linking to Item_24 table (unique constraint ensures one discount per item)
- `DiscountPercentage`: The discount percentage to apply (0-100)
- `Description`: Optional description of the discount
- `IsActive`: Flag to enable/disable the discount
- `CreatedAt`: Timestamp when the discount was created
- `UpdatedAt`: Timestamp when the discount was last updated

### 2. Updated Discount Utility (`src/utils/discount.js`)

#### `getItemDiscount(itemId)`
Fetches the discount percentage for a specific item from the `discou24` table.

```javascript
import { getItemDiscount } from '../utils/discount.js';

const discount = await getItemDiscount(1); // Returns discount percentage (e.g., 15)
```

#### `getItemHolidayInfo(itemId)`
Retrieves full discount information for an item.

```javascript
const discountInfo = await getItemHolidayInfo(1);
// Returns: { hasDiscount: true, discountInfo: {...} }
```

#### `createItemDiscount(discountData)`
Creates or updates a discount for an item. Uses `ON DUPLICATE KEY UPDATE` for safe upserts.

```javascript
await createItemDiscount({
  itemId: 1,
  discountPercentage: 15.00,
  description: 'Standard discount for Item 1'
});
```

#### `deactivateItemDiscount(itemId)`
Marks a discount as inactive without deleting it.

```javascript
await deactivateItemDiscount(1);
```

### 3. Updated Order Service (`src/services/order.service.js`)

The `createOrder()` function now:
1. Fetches the discount from the `discou24` table based on `ItemID`
2. Only applies the discount when `ApplyDiscount = true`
3. Stores both `AppliedDiscount` percentage and `DiscountAmount` in the order

```javascript
// Create order with discount
await createOrder({
  CustomerID: 1,
  ItemID: 1,
  Qty: 5,
  ApplyDiscount: true  // Applies discount from discou24 table
});

// Creates/Updates discount entry automatically
```

### 4. Updated Item Controller (`src/controllers/item.controller.js`)

When creating or updating items:
- A discount entry is automatically created in the `discou24` table
- Can optionally specify `discountPercentage` in the request body
- If not provided, defaults to 0%

```javascript
// Create item with discount
POST /api/items
{
  "ItemDesc": "New Product",
  "Qty": 100,
  "Price": 500.00,
  "discountPercentage": 10.00
}

// Update item and its discount
PATCH /api/items/1
{
  "ItemDesc": "Updated Product",
  "discountPercentage": 15.00
}
```

## Adding New Items with Discounts

### Method 1: Automatic via API
When you create a new item, a discount record is automatically created:

```bash
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "ItemDesc": "Laptop",
    "Qty": 50,
    "Price": 50000.00,
    "discountPercentage": 5.00
  }'
```

### Method 2: SQL Query for Existing Items
To add items that already exist but don't have discount records:

```sql
-- Add new items to discount table with default 0% discount
INSERT INTO discou24 (ItemID, DiscountPercentage, Description, IsActive)
SELECT ItemID, 0.00, CONCAT('Discount for ', ItemDesc), 1
FROM Item_24
WHERE ItemID NOT IN (SELECT ItemID FROM discou24)
ON DUPLICATE KEY UPDATE IsActive = VALUES(IsActive);
```

### Method 3: SQL Query to Update Discounts for All Items
Update discount percentages for specific items:

```sql
-- Update discount for Item ID 1
UPDATE discou24 
SET DiscountPercentage = 20.00, 
    Description = 'New Year Sale - 20% off'
WHERE ItemID = 1;

-- Update discounts for multiple items
UPDATE discou24 
SET DiscountPercentage = 15.00 
WHERE ItemID IN (1, 2, 3, 4, 5);

-- Update all discounts at once
UPDATE discou24 
SET DiscountPercentage = 12.00 
WHERE IsActive = 1;
```

### Method 4: Bulk Insert for Multiple Items

```sql
-- Insert multiple items with their discounts
INSERT INTO discou24 (ItemID, DiscountPercentage, Description, IsActive)
VALUES 
(3, 12.50, 'Standard discount for Item 3', 1),
(4, 8.75, 'Clearance discount for Item 4', 1),
(5, 15.00, 'Premium member discount for Item 5', 1)
ON DUPLICATE KEY UPDATE 
  DiscountPercentage = VALUES(DiscountPercentage),
  Description = VALUES(Description);
```

## Applying Discounts to Orders

### Creating an Order with Discount

```javascript
// Discount applied from discou24 table
const order = await createOrder({
  CustomerID: 1,
  ItemID: 1,
  Qty: 2,
  ApplyDiscount: true  // Enables discount
});

// Response:
{
  OrderID: 101,
  CustomerID: 1,
  ItemID: 1,
  Qty: 2,
  AppliedDiscount: 15,          // 15% from discou24
  DiscountAmount: 75.00,         // Calculated discount
  totalprice: 425.00             // Final price after discount
}
```

### Creating an Order Without Discount

```javascript
const order = await createOrder({
  CustomerID: 1,
  ItemID: 1,
  Qty: 2,
  ApplyDiscount: false  // No discount applied
});

// Response includes AppliedDiscount: 0
```

## Disable/Enable Discounts for Items

### Deactivate a Discount
```sql
UPDATE discou24 
SET IsActive = 0 
WHERE ItemID = 1;
```

### Reactivate a Discount
```sql
UPDATE discou24 
SET IsActive = 1 
WHERE ItemID = 1;
```

### Deactivate All Discounts
```sql
UPDATE discou24 
SET IsActive = 0 
WHERE DiscountPercentage > 0;
```

## Query Examples

### View All Item Discounts
```sql
SELECT 
  d.DiscountID,
  d.ItemID,
  i.ItemDesc,
  d.DiscountPercentage,
  d.Description,
  d.IsActive,
  d.UpdatedAt
FROM discou24 d
JOIN Item_24 i ON d.ItemID = i.ItemID
ORDER BY d.DiscountPercentage DESC;
```

### Find Items Without Discounts
```sql
SELECT i.ItemID, i.ItemDesc, i.Price
FROM Item_24 i
WHERE i.ItemID NOT IN (SELECT ItemID FROM discou24);
```

### View Orders with Discount Details
```sql
SELECT 
  o.OrderID,
  o.CustomerID,
  o.ItemID,
  i.ItemDesc,
  o.Qty,
  i.Price,
  o.AppliedDiscount,
  o.DiscountAmount,
  o.totalprice
FROM Order_24 o
JOIN Item_24 i ON o.ItemID = i.ItemID
WHERE o.AppliedDiscount > 0
ORDER BY o.OrderID DESC;
```

## Migration Notes

1. The `HolidayDiscount_24` table is still present in the database for reference (backward compatibility)
2. All new discount operations use the `discou24` table
3. When migrating existing data, use the bulk insert queries mentioned above
4. Existing orders are not affected by this change

## Best Practices

1. **Always use the API** to create items when possible - this ensures discount records are created automatically
2. **Use ON DUPLICATE KEY UPDATE** when inserting discounts to avoid conflicts
3. **Keep IsActive flag updated** for temporarily disabling discounts
4. **Validate discount percentages** - ensure values are between 0-100
5. **Test discounts** before applying to production orders

## Troubleshooting

### New item created but no discount entry
- Check if the item creation succeeded first
- Verify the discount utility is properly imported in the controller
- Check application logs for discount creation errors

### Discount not applied to orders
- Verify `ApplyDiscount = true` in the order request
- Check if discount record exists in `discou24` table for the ItemID
- Confirm `IsActive = 1` for the discount

### Duplicate key error
- Use `ON DUPLICATE KEY UPDATE` instead of regular INSERT
- This handles cases where an item already has a discount

## Example Workflow

1. **Create a new item:**
   ```bash
   POST /api/items - automatically creates discount entry (0% by default)
   ```

2. **Set discount for the item:**
   ```sql
   UPDATE discou24 SET DiscountPercentage = 15.00 WHERE ItemID = 6;
   ```

3. **Create order with discount:**
   ```bash
   POST /api/orders with ApplyDiscount: true
   ```

4. **View order results:**
   ```bash
   GET /api/orders/123 - shows AppliedDiscount and DiscountAmount
   ```
