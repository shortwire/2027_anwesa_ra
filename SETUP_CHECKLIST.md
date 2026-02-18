# Setup Checklist - Price & Discount System

## ✅ Files Created/Modified

### New Files Created:
- [x] `migrations/add_price_and_discount.sql` - Database migration script
- [x] `src/utils/discount.js` - Discount utility functions
- [x] `src/controllers/discount.controller.js` - Discount API controllers
- [x] `src/routes/discount.routes.js` - Discount API routes
- [x] `PRICE_DISCOUNT_DOCUMENTATION.md` - Complete documentation
- [x] `IMPLEMENTATION_SUMMARY.md` - Implementation summary
- [x] `API_TEST_EXAMPLES.sh` - Bash script with curl examples
- [x] `Postman_Collection.json` - Postman API collection
- [x] `SETUP_CHECKLIST.md` - This file

### Modified Files:
- [x] `src/services/item.service.js` - Added Price field handling
- [x] `src/services/order.service.js` - Added price calculation and discount logic
- [x] `src/app.js` - Added discount routes

## 🔧 Installation Steps

### Step 1: Database Migration
Execute the SQL migration script:

```bash
mysql -u your_user -p your_database < migrations/add_price_and_discount.sql
```

Or copy-paste the contents from `migrations/add_price_and_discount.sql` into MySQL Workbench.

**What this does:**
- ✅ Adds `Price` column to `Item_24` table
- ✅ Creates `HolidayDiscount_24` table
- ✅ Adds pricing columns to `Order_24` table
- ✅ Inserts sample data for testing

### Step 2: Verify Dependencies
Ensure all required npm packages are installed in your project:

```bash
npm install
```

Required packages should already be in your `package.json`:
- `express` - Web framework
- `mysql2` - Database driver
- `morgan` - HTTP request logger
- `dotenv` - Environment variables

### Step 3: Environment Configuration
Ensure your `.env` file has database credentials:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=FSD_db
```

### Step 4: Start the Server
```bash
npm start
# or
node src/server.js
```

Server should start on port 3000 (or as configured).

## 🧪 Testing the Implementation

### Test 1: Add Item with Price
```bash
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "itemDesc": "Laptop",
    "qty": 10,
    "price": 100000.00
  }'
```

✅ Expected: Item created with price field

### Test 2: Verify Item Has Price
```bash
curl http://localhost:3000/api/items/1
```

✅ Expected: Response includes `Price` field

### Test 3: Create Holiday Discount
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

✅ Expected: Discount created with ID

### Test 4: Check Discount Info
```bash
curl http://localhost:3000/api/discount/item/1
```

✅ Expected: Shows current and upcoming discounts (if applicable)

### Test 5: Create Order with Discount (if within holiday period)
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "CustomerID": 1,
    "ItemID": 1,
    "Qty": 2
  }'
```

✅ Expected: Order response includes:
- `Price` - Item price
- `Subtotal` - Qty × Price
- `AppliedDiscount` - Discount percentage (0 if not in holiday period)
- `DiscountAmount` - Amount discounted in currency
- `TotalPrice` - Final price after discount

### Test 6: Verify Order Details
```bash
curl http://localhost:3000/api/orders/1
```

✅ Expected: Response includes all pricing and discount fields

### Test 7: Calculate Total Preview
```bash
curl -X POST http://localhost:3000/api/discount/calculate-total \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"itemId": 1, "qty": 2, "price": 100000.00},
      {"itemId": 2, "qty": 1, "price": 50000.00}
    ]
  }'
```

✅ Expected: Detailed breakdown of subtotal, discounts, and final total

## 🐛 Troubleshooting

### Issue: "Column not found" error
**Solution:** Run the migration script to add the missing columns

### Issue: Discount not showing even during holiday period
**Solutions:**
1. Verify the discount date range is correct
2. Check that `IsActive = 1` for the discount
3. Verify item ID matches

### Issue: Routes not found (404)
**Solution:** Verify `discount.routes.js` is imported in `app.js` ✅ (Already done)

### Issue: Database connection error
**Solution:** 
1. Verify `.env` file has correct credentials
2. Ensure MySQL server is running
3. Check database name is correct

## 📊 Database Schema Summary

### Modified: Item_24
```sql
+--------+----------+------+
| Field  | Type     | Key  |
+--------+----------+------+
| ItemID | bigint   | PK   |
| ItemDesc | varchar | null |
| Qty    | int      | null |
| Price  | decimal  | null | ← NEW
+--------+----------+------+
```

### Modified: Order_24
```sql
+------------------+-----------+-----+
| Field            | Type      | Key |
+------------------+-----------+-----+
| OrderID          | bigint    | PK  |
| CustomerID       | bigint    | FK  |
| ItemID           | bigint    | FK  |
| Qty              | int       | null |
| TotalPrice       | decimal   | null | ← NEW
| DiscountAmount   | decimal   | null | ← NEW
| AppliedDiscount  | decimal   | null | ← NEW
| OrderDate        | timestamp | null | ← NEW
+------------------+-----------+-----+
```

### New: HolidayDiscount_24
```sql
+---------------------+-----------+-----+
| Field               | Type      | Key |
+---------------------+-----------+-----+
| DiscountID          | bigint    | PK  |
| HolidayName         | varchar   | null |
| StartDate           | date      | null |
| EndDate             | date      | null |
| ItemID              | bigint    | FK  |
| DiscountPercentage  | decimal   | null |
| IsActive            | tinyint   | null |
| CreatedAt           | timestamp | null |
+---------------------+-----------+-----+
```

## 📚 Documentation Files

- **[PRICE_DISCOUNT_DOCUMENTATION.md](PRICE_DISCOUNT_DOCUMENTATION.md)** - Complete API documentation
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Technical implementation details
- **[Postman_Collection.json](Postman_Collection.json)** - API collection for Postman (Import this!)
- **[API_TEST_EXAMPLES.sh](API_TEST_EXAMPLES.sh)** - Bash script with curl examples

## 🎯 Key Features Summary

✅ **Price Attribute** - Items can have individual prices
✅ **Holiday Discounts** - Create discount periods with date ranges
✅ **Auto-Apply Discounts** - Discounts automatically applied during valid periods
✅ **Order Total Calculation** - Automatic calculation with discount amount tracking
✅ **Disable Discounts** - Easy on/off toggle for discount periods
✅ **Preview Calculation** - Calculate order totals before placing order
✅ **Full Audit Trail** - All pricing and discount info stored with orders

## 📝 Common Operations

### Create a Holiday Discount
```sql
INSERT INTO HolidayDiscount_24 (HolidayName, StartDate, EndDate, ItemID, DiscountPercentage)
VALUES ('Diwali Sale', '2025-10-20', '2025-11-10', 1, 15.00);
```

### View All Active Discounts
```sql
SELECT * FROM HolidayDiscount_24 WHERE IsActive = 1 ORDER BY StartDate;
```

### View Orders with Discounts Applied
```sql
SELECT OrderID, CustomerID, ItemID, Qty, AppliedDiscount, DiscountAmount, TotalPrice 
FROM Order_24 
WHERE AppliedDiscount > 0 
ORDER BY OrderDate DESC;
```

### Disable a Discount
```sql
UPDATE HolidayDiscount_24 SET IsActive = 0 WHERE DiscountID = 1;
```

## ✨ Next Steps

1. ✅ Run database migration (`migrations/add_price_and_discount.sql`)
2. ✅ Verify all files are in place
3. ✅ Start the server (`npm start`)
4. ✅ Test using provided examples
5. ✅ Import Postman collection for easier testing
6. ✅ Create your own holiday discounts

## 📞 Support

For any issues:
1. Check [PRICE_DISCOUNT_DOCUMENTATION.md](PRICE_DISCOUNT_DOCUMENTATION.md) for detailed API docs
2. Check [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) for technical details
3. Review [API_TEST_EXAMPLES.sh](API_TEST_EXAMPLES.sh) for example commands
4. Check database logs for SQL errors

---

**Status:** ✅ Implementation Complete and Ready to Use!
