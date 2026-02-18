#!/bin/bash

# Rest Assignment API Testing - Price & Discount System
# This file contains example curl commands to test the new price and discount features

BASE_URL="http://localhost:3000"

echo "================================"
echo "REST API Testing Examples"
echo "================================"
echo ""

# ================ ITEMS API ================
echo "1. CREATE ITEM WITH PRICE"
echo "POST $BASE_URL/api/items"
echo '
{
  "itemDesc": "Laptop",
  "qty": 10,
  "price": 100000.00
}
'
curl -X POST $BASE_URL/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "itemDesc": "Laptop",
    "qty": 10,
    "price": 100000.00
  }'
echo ""
echo ""

echo "2. CREATE ANOTHER ITEM"
echo "POST $BASE_URL/api/items"
curl -X POST $BASE_URL/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "itemDesc": "Smartphone",
    "qty": 20,
    "price": 50000.00
  }'
echo ""
echo ""

echo "3. GET ALL ITEMS (with prices)"
echo "GET $BASE_URL/api/items"
curl -X GET $BASE_URL/api/items
echo ""
echo ""

# ================ DISCOUNT API ================
echo "4. CREATE DIWALI DISCOUNT FOR ITEM 1"
echo "POST $BASE_URL/api/discount"
curl -X POST $BASE_URL/api/discount \
  -H "Content-Type: application/json" \
  -d '{
    "holidayName": "Diwali Sale",
    "startDate": "2025-10-20",
    "endDate": "2025-11-10",
    "itemId": 1,
    "discountPercentage": 15.00
  }'
echo ""
echo ""

echo "5. CREATE NEW YEAR DISCOUNT FOR ITEM 2"
echo "POST $BASE_URL/api/discount"
curl -X POST $BASE_URL/api/discount \
  -H "Content-Type: application/json" \
  -d '{
    "holidayName": "New Year Sale",
    "startDate": "2026-01-01",
    "endDate": "2026-01-15",
    "itemId": 2,
    "discountPercentage": 12.00
  }'
echo ""
echo ""

echo "6. CHECK HOLIDAY INFO FOR ITEM 1"
echo "GET $BASE_URL/api/discount/item/1"
curl -X GET $BASE_URL/api/discount/item/1
echo ""
echo ""

echo "7. GET DISCOUNT FOR ITEM 1 (Today)"
echo "GET $BASE_URL/api/discount?itemId=1"
curl -X GET "$BASE_URL/api/discount?itemId=1"
echo ""
echo ""

echo "8. GET DISCOUNT FOR ITEM 1 (Specific Date - During Diwali)"
echo "GET $BASE_URL/api/discount?itemId=1&date=2025-10-25"
curl -X GET "$BASE_URL/api/discount?itemId=1&date=2025-10-25"
echo ""
echo ""

# ================ CUSTOMER API ================
echo "9. CREATE CUSTOMER"
echo "POST $BASE_URL/api/customers"
curl -X POST $BASE_URL/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "John Doe"
  }'
echo ""
echo ""

# ================ ORDER API ================
echo "10. CREATE ORDER (Will apply discount if today is in holiday period)"
echo "POST $BASE_URL/api/orders"
curl -X POST $BASE_URL/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "CustomerID": 1,
    "ItemID": 1,
    "Qty": 2
  }'
echo ""
echo ""

echo "11. GET ALL ORDERS (with price and discount info)"
echo "GET $BASE_URL/api/orders"
curl -X GET $BASE_URL/api/orders
echo ""
echo ""

echo "12. GET SPECIFIC ORDER"
echo "GET $BASE_URL/api/orders/1"
curl -X GET $BASE_URL/api/orders/1
echo ""
echo ""

echo "13. UPDATE ORDER"
echo "PUT $BASE_URL/api/orders/1"
curl -X PUT $BASE_URL/api/orders/1 \
  -H "Content-Type: application/json" \
  -d '{
    "CustomerID": 1,
    "ItemID": 1,
    "Qty": 3
  }'
echo ""
echo ""

echo "14. CALCULATE ORDER TOTAL (Preview)"
echo "POST $BASE_URL/api/discount/calculate-total"
curl -X POST $BASE_URL/api/discount/calculate-total \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"itemId": 1, "qty": 2, "price": 100000.00},
      {"itemId": 2, "qty": 1, "price": 50000.00}
    ]
  }'
echo ""
echo ""

echo "15. DELETE DISCOUNT"
echo "DELETE $BASE_URL/api/discount/1"
curl -X DELETE $BASE_URL/api/discount/1
echo ""
echo ""

echo "================================"
echo "Testing Complete!"
echo "================================"
