import { pool } from '../config/database.js';
import { getItemDiscount } from '../utils/discount.js';

export async function getAllOrders() {
  const [rows] = await pool.query(`
    SELECT o.OrderID, o.CustomerID, c.CustomerName, o.ItemID, i.ItemDesc, o.Qty,
       o.totalprice, o.AppliedDiscount, i.Price AS Price
    FROM Order_24 o
    JOIN Customer_24 c ON o.CustomerID = c.CustomerID 
    JOIN Item_24 i ON o.ItemID = i.ItemID
    ORDER BY o.OrderID DESC
  `);
  return rows;
}

export async function getOrderById(id) {
  const [rows] = await pool.query(`
    SELECT o.OrderID, o.CustomerID, c.CustomerName, o.ItemID, i.ItemDesc, o.Qty,
       o.totalprice, o.AppliedDiscount
    FROM \`Order_24\` o
    JOIN Customer_24 c ON o.CustomerID = c.CustomerID
    JOIN Item_24 i ON o.ItemID = i.ItemID
    WHERE o.OrderID = ?
  `, [id]);
  return rows[0] || null;
}

export async function createOrder(data) {
  console.log('Received Order Data:', data);
  const { CustomerID, ItemID, Qty = 1, ApplyDiscount = false } = data;
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // 1. Check stock and read item price (if present)
    const [itemRows] = await connection.query('SELECT Qty, Price FROM Item_24 WHERE ItemID = ? FOR UPDATE', [ItemID]);
    if (itemRows.length === 0) throw new Error('Item not found');
    if (itemRows[0].Qty < Qty) throw new Error(`Insufficient stock. Available: ${itemRows[0].Qty}`);

    const itemprice = itemRows[0].Price != null ? parseFloat(itemRows[0].Price) : (itemRows[0].price != null ? parseFloat(itemRows[0].price) : 0);

    // 2. Get discount from discou24 table
    let discount = 0;
    let discountAmount = 0;
    
    if (ApplyDiscount === true) {
      discount = await getItemDiscount(ItemID);
    }

    // 3. Calculate total price with discount
    const subtotal = itemprice * Qty;
    discountAmount = parseFloat((subtotal * (discount / 100)).toFixed(2));
    const totalprice = parseFloat((subtotal - discountAmount).toFixed(2));

    // 4. Create Order with pricing and discount
    const [orderResult] = await connection.query(
        'INSERT INTO `Order_24` (CustomerID, ItemID, Qty, totalprice, AppliedDiscount, DiscountAmount) VALUES (?, ?, ?, ?, ?, ?)',
        [CustomerID, ItemID, Qty, totalprice, discount, discountAmount]
    );
    const OrderID = orderResult.insertId;

    // 5. Deduct stock for the item
    await connection.query('UPDATE Item_24 SET Qty = Qty - ? WHERE ItemID = ?', [Qty, ItemID]);

    // 6. Update Priority status
    const [orderCountRows] = await connection.query(
      'SELECT COUNT(*) as total FROM \`Order_24\` WHERE CustomerID = ? FOR UPDATE',
      [CustomerID]
    );
    if (orderCountRows[0].total > 3) {
      await connection.query('UPDATE Customer_24 SET Priority = 1 WHERE CustomerID = ?', [CustomerID]);
    }

    await connection.commit();
    return { 
      OrderID, 
      CustomerID, 
      ItemID, 
      Qty,
      AppliedDiscount: discount,
      DiscountAmount: discountAmount,
      totalprice
    };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}
export async function deleteOrder(id) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // Get order info before deleting to update priority and return stock
    const [orderRows] = await connection.query('SELECT CustomerID, ItemID, Qty FROM \`Order_24\` WHERE OrderID = ?', [id]);
    if (orderRows.length === 0) {
      await connection.rollback();
      return false;
    }
    const { CustomerID, ItemID, Qty } = orderRows[0];

    // 1. Delete Order
    const [deleteResult] = await connection.query('DELETE FROM \`Order_24\` WHERE OrderID = ?', [id]);
    
    // 2. Return Qty to Item table
    await connection.query('UPDATE Item_24 SET Qty = Qty + ? WHERE ItemID = ?', [Qty, ItemID]);

    // 3. Update Priority status if it falls to 3 or below
    const [orderCountRows] = await connection.query(
      'SELECT COUNT(*) as total FROM \`Order_24\` WHERE CustomerID = ?',
      [CustomerID]
    );
    if (orderCountRows[0].total <= 3) {
      await connection.query('UPDATE Customer_24 SET Priority = 0 WHERE CustomerID = ?', [CustomerID]);
    }

    await connection.commit();
    return deleteResult.affectedRows > 0;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

export async function updateOrder(id, data) {
  const { CustomerID, ItemID, Qty, ApplyDiscount = false } = data;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Get existing Order details
    const [oldOrderRows] = await connection.query(
      'SELECT ItemID, Qty FROM \`Order_24\` WHERE OrderID = ? FOR UPDATE',
      [id]
    );
    if (oldOrderRows.length === 0) throw new Error('Order not found');

    const oldItemID = oldOrderRows[0].ItemID;
    const oldQty = oldOrderRows[0].Qty;

    // 2. Handle Stock Adjustment
    if (oldItemID === ItemID) {
      // Same item, adjust difference
      const qtyDiff = Qty - oldQty; // Positive means we need more stock
      if (qtyDiff > 0) {
        const [itemRows] = await connection.query('SELECT Qty FROM Item_24 WHERE ItemID = ? FOR UPDATE', [ItemID]);
        if (itemRows[0].Qty < qtyDiff) throw new Error(`Insufficient stock. Available: ${itemRows[0].Qty}`);
      }
      await connection.query('UPDATE Item_24 SET Qty = Qty - ? WHERE ItemID = ?', [qtyDiff, ItemID]);
    } else {
      // Different item
      // Return old item stock
      await connection.query('UPDATE Item_24 SET Qty = Qty + ? WHERE ItemID = ?', [oldQty, oldItemID]);
      // Deduct new item stock
      const [newItemRows] = await connection.query('SELECT Qty, Price FROM Item_24 WHERE ItemID = ? FOR UPDATE', [ItemID]);
      if (newItemRows.length === 0) throw new Error('New item not found');
      if (newItemRows[0].Qty < Qty) throw new Error(`Insufficient stock for new item. Available: ${newItemRows[0].Qty}`);
      await connection.query('UPDATE Item_24 SET Qty = Qty - ? WHERE ItemID = ?', [Qty, ItemID]);
    }

    // 3. Get new item price and check discount period
    const [newItemData] = await connection.query('SELECT Price FROM Item_24 WHERE ItemID = ?', [ItemID]);
    const itemprice = newItemData[0].Price != null ? parseFloat(newItemData[0].Price) : (newItemData[0].price != null ? parseFloat(newItemData[0].price) : 0);
    
    // Check if current date falls between Feb 22 - March 6, 2026 for discount
    const currentDate = new Date();
    const discountStartDate = new Date(2026, 1, 22); // Feb 22, 2026
    const discountEndDate = new Date(2026, 2, 6); // March 6, 2026
    let discount = 0;
    let discountAmount = 0;

    if (ApplyDiscount === true || (currentDate >= discountStartDate && currentDate <= discountEndDate)) {
      discount = 25; // 25% discount during holiday period or when requested
    }

    // 4. Calculate total price with discount
    const subtotal = itemprice * Qty;
    discountAmount = parseFloat((subtotal * (discount / 100)).toFixed(2));
    const totalprice = parseFloat((subtotal - discountAmount).toFixed(2));

    // 5. Update the Order record
    const [result] = await connection.query(
      'UPDATE `Order_24` SET CustomerID = ?, ItemID = ?, Qty = ?, totalprice = ? WHERE OrderID = ?',
      [CustomerID, ItemID, Qty, totalprice, id]
    );

    await connection.commit();
    return result.affectedRows > 0;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// extra function for patch
export async function PatchOrder(id, updates) {
  // Build dynamic UPDATE query for only provided fields
  const fields = Object.keys(updates);
  const values = fields.map(field => updates[field]);
  values.push(id); // Add ID at the end for WHERE clause
  
  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const query = `UPDATE Order_24 SET ${setClause} WHERE OrderID = ?`;
  
  const [result] = await pool.query(query, values);
  return result.affectedRows > 0;
}
