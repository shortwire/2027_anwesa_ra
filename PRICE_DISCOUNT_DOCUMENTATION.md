# Price Attribute & Discount System Documentation

## Overview
This document explains the new price attribute for items and the dynamic discount system based on holiday date ranges.

## Database Schema Changes

### 1. Item_24 Table
**New Column Added:**
- `Price` (DECIMAL(10, 2)) - The price of each item

```sql
ALTER TABLE Item_24 ADD COLUMN Price DECIMAL(10, 2) DEFAULT 0.00;
```

### 2. Order_24 Table
**New Columns Added:**
- `TotalPrice` (DECIMAL(10, 2)) - Final order total after discount
- `DiscountAmount` (DECIMAL(10, 2)) - Total discount amount in currency
- `AppliedDiscount` (DECIMAL(5, 2)) - Discount percentage applied
- `OrderDate` (TIMESTAMP) - When the order was created

```sql
ALTER TABLE Order_24 ADD COLUMN TotalPrice DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE Order_24 ADD COLUMN DiscountAmount DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE Order_24 ADD COLUMN AppliedDiscount DECIMAL(5, 2) DEFAULT 0.00;
ALTER TABLE Order_24 ADD COLUMN OrderDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
```

### 3. HolidayDiscount_24 Table (NEW)
**Purpose:** Manages holiday discount periods for specific items

**Columns:**
- `DiscountID` - Primary key
- `HolidayName` - Name of the holiday/event (e.g., "Diwali Sale")
- `StartDate` - Start date of the discount period (DATE format)
- `EndDate` - End date of the discount period (DATE format)
- `ItemID` - Foreign key referencing Item_24
- `DiscountPercentage` - Discount percentage (0-100)
- `IsActive` - Enable/disable discount (1 = active, 0 = inactive)
- `CreatedAt` - Timestamp when discount was created

```sql
CREATE TABLE HolidayDiscount_24 (
  DiscountID bigint NOT NULL AUTO_INCREMENT,
  HolidayName varchar(255) NOT NULL,
  StartDate DATE NOT NULL,
  EndDate DATE NOT NULL,
  ItemID bigint NOT NULL,
  DiscountPercentage DECIMAL(5, 2) NOT NULL,
  IsActive tinyint(1) DEFAULT 1,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (DiscountID),
  KEY fk_holiday_item_id_24 (ItemID),
  CONSTRAINT fk_holiday_item_id_24 FOREIGN KEY (ItemID) REFERENCES Item_24 (ItemID) ON DELETE CASCADE
);
```

## New API Endpoints

### 1. Get Item Holiday Information
**Endpoint:** `GET /api/discount/item/:itemId`

**Description:** Get current and upcoming holiday discounts for a specific item

**Response:**
```json
{
  "currentDiscount": {
    "discountId": 1,
    "holidayName": "Diwali Sale",
    "startDate": "2025-10-20",
    "endDate": "2025-11-10",
    "discountPercentage": 15.00
  },
  "upcomingDiscounts": [
    {
      "holidayName": "New Year Sale",
      "startDate": "2026-01-01",
      "endDate": "2026-01-15",
      "discountPercentage": 20.00
    }
  ]
}
```

### 2. Get Discount for Specific Date
**Endpoint:** `GET /api/discount?itemId=1&date=2025-10-25`

**Query Parameters:**
- `itemId` (required) - The item ID
- `date` (optional) - Date in YYYY-MM-DD format (defaults to today)

**Response:**
```json
{
  "itemId": 1,
  "date": "2025-10-25",
  "discountPercentage": 15.00,
  "hasDiscount": true
}
```

### 3. Create Holiday Discount
**Endpoint:** `POST /api/discount`

**Body:**
```json
{
  "holidayName": "Diwali Sale",
  "startDate": "2025-10-20",
  "endDate": "2025-11-10",
  "itemId": 1,
  "discountPercentage": 15.00
}
```

**Response:**
```json
{
  "message": "Holiday discount created successfully",
  "discountId": 1,
  "holidayName": "Diwali Sale",
  "startDate": "2025-10-20",
  "endDate": "2025-11-10",
  "itemId": 1,
  "discountPercentage": 15.00
}
```

### 4. Deactivate Holiday Discount
**Endpoint:** `DELETE /api/discount/:discountId`

**Response:**
```json
{
  "message": "Holiday discount deactivated successfully"
}
```

### 5. Calculate Order Total (Preview)
**Endpoint:** `POST /api/discount/calculate-total`

**Body:**
```json
{
  "items": [
    {
      "itemId": 1,
      "qty": 2,
      "price": 100.00
    },
    {
      "itemId": 2,
      "qty": 1,
      "price": 250.00
    }
  ]
}
```

**Response:**
```json
{
  "subtotal": 450.00,
  "totalDiscount": 45.00,
  "finalTotal": 405.00,
  "itemBreakdown": [
    {
      "itemId": 1,
      "quantity": 2,
      "price": 100.00,
      "itemTotal": 200.00,
      "appliedDiscount": 15.00,
      "discountAmount": 30.00,
      "finalTotal": 170.00
    },
    {
      "itemId": 2,
      "quantity": 1,
      "price": 250.00,
      "itemTotal": 250.00,
      "appliedDiscount": 0.00,
      "discountAmount": 0.00,
      "finalTotal": 250.00
    }
  ]
}
```

## Modified Item API Endpoints

### 1. Create Item (Updated)
**Endpoint:** `POST /api/items`

**Body:**
```json
{
  "itemDesc": "Laptop",
  "qty": 5,
  "price": 100000.00
}
```

**Response:**
```json
{
  "itemId": 1,
  "itemDesc": "Laptop",
  "qty": 5,
  "price": 100000.00
}
```

### 2. Update Item (Updated)
**Endpoint:** `PUT /api/items/:itemId`

**Body:**
```json
{
  "itemDesc": "Laptop Pro",
  "qty": 4,
  "price": 120000.00
}
```

## Modified Order API Response

### Get Order Details (Updated Response)
Response now includes:
- `Price` - Item price at time of order
- `TotalPrice` - Final order total after discount
- `DiscountAmount` - Total discount in currency
- `AppliedDiscount` - Discount percentage applied
- `OrderDate` - When order was placed

**Example Response:**
```json
{
  "OrderID": 1,
  "CustomerID": 1,
  "CustomerName": "John Doe",
  "ItemID": 1,
  "ItemDesc": "Laptop",
  "Price": 100000.00,
  "Qty": 1,
  "TotalPrice": 85000.00,
  "DiscountAmount": 15000.00,
  "AppliedDiscount": 15.00,
  "OrderDate": "2025-10-25T10:30:00.000Z"
}
```

## How Discounts Work

### 1. Automatic Discount Application
When an order is created:
1. System checks if today's date falls within any holiday discount period for the item
2. If a discount is found, it's automatically applied to the order
3. `TotalPrice` = (ItemPrice × Quantity) - (ItemPrice × Quantity × DiscountPercentage / 100)
4. Discount information is stored with the order

### 2. Date-Based Logic
- **During Holiday Period:** Discount is automatically applied when creating/updating orders
- **After Holiday Period:** No discount is applied; full price is charged
- **Multiple Discounts:** If multiple discounts exist for the same item, the system uses the first active one found

### 3. Discount Calculation Example
```
Item Price: $100
Item Quantity: 2
Discount Period: Active (Holiday Discount: 15%)

Calculation:
- Subtotal: $100 × 2 = $200
- Discount Amount: $200 × 15% = $30
- Total Price: $200 - $30 = $170
```

## Usage Examples

### Example 1: Create a Diwali Sale Discount
```bash
curl -X POST http://localhost:3000/api/discount \
  -H "Content-Type: application/json" \
  -d '{
    "holidayName": "Diwali Sale",
    "startDate": "2025-10-20",
    "endDate": "2025-11-10",
    "itemId": 1,
    "discountPercentage": 15.00
  }'
```

### Example 2: Check Current Discount for Item
```bash
curl http://localhost:3000/api/discount/item/1
```

### Example 3: Create Order with Automatic Discount
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "CustomerID": 1,
    "ItemID": 1,
    "Qty": 2
  }'
```

If today is within a holiday period, the order response will include:
```json
{
  "OrderID": 5,
  "CustomerID": 1,
  "ItemID": 1,
  "Qty": 2,
  "Price": 100.00,
  "Subtotal": 200.00,
  "AppliedDiscount": 15.00,
  "DiscountAmount": 30.00,
  "TotalPrice": 170.00
}
```

## Migration Steps

1. **Backup your database:**
   ```sql
   CREATE TABLE Item_24_backup AS SELECT * FROM Item_24;
   CREATE TABLE Order_24_backup AS SELECT * FROM Order_24;
   ```

2. **Run the migration SQL:**
   Execute all queries from `migrations/add_price_and_discount.sql`

3. **Update sample data:**
   ```sql
   UPDATE Item_24 SET Price = 100.00 WHERE ItemID = 1;
   UPDATE Item_24 SET Price = 250.00 WHERE ItemID = 2;
   ```

4. **Create test discounts:**
   Use the API endpoint to create holiday discount periods

## Notes

- Discounts are item-specific; different items can have different discount percentages for the same holiday
- The system checks the current date each time an order is created/updated
- Once a holiday period ends, no discounts are applied even if the record exists
- Use `IsActive = 0` to temporarily disable a discount without deleting it
- All prices are stored as DECIMAL to avoid floating-point precision issues
