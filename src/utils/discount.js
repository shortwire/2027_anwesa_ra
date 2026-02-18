import { pool } from '../config/database.js';

/**
 * Get applicable discount percentage for an item
 * Fetches from the discou24 table which contains item-specific discounts
 * @param {number} itemId - The item ID
 * @returns {number} Discount percentage (0 if no discount)
 */
export async function getItemDiscount(itemId) {
  try {
    const [rows] = await pool.query(`
      SELECT discount_percent 
      FROM discou24 
      WHERE item_id = ?
      LIMIT 1
    `, [itemId]);

    if (rows.length > 0) return parseFloat(rows[0].discount_percent);
  } catch (err) {
    console.error('Error fetching discount from discou24:', err);
  }

  // Return 0 if no discount found
  return 0;
}

/**
 * Get discount information for an item
 * @param {number} itemId - The item ID
 * @returns {object} Discount details from discou24 table
 */
export async function getItemHolidayInfo(itemId) {
  try {
    const [discountData] = await pool.query(`
      SELECT discount_id AS DiscountID, item_id AS ItemID, discount_percent AS DiscountPercentage
      FROM discou24 
      WHERE item_id = ?
    `, [itemId]);
    
    return {
      hasDiscount: discountData.length > 0,
      discountInfo: discountData.length > 0 ? discountData[0] : null
    };
  } catch (err) {
    console.error('Error fetching discount info:', err);
    return { hasDiscount: false, discountInfo: null };
  }
}

/**
 * Add or update item discount in discou24 table
 * @param {object} discountData - Discount details {itemId, discountPercentage}
 */
export async function createItemDiscount(discountData) {
  const { itemId, discountPercentage } = discountData;
  
  try {
    const [result] = await pool.query(`
      INSERT INTO discou24 (item_id, discount_percent)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE discount_percent = VALUES(discount_percent)
    `, [itemId, discountPercentage]);
    
    return result.insertId;
  } catch (err) {
    console.error('Error creating/updating discount:', err);
    throw err;
  }
}

/**
 * Remove a discount for an item (delete record)
 * @param {number} itemId - The item ID
 */
export async function deactivateItemDiscount(itemId) {
  try {
    const [result] = await pool.query(`
      DELETE FROM discou24 
      WHERE item_id = ?
    `, [itemId]);
    
    return result.affectedRows > 0;
  } catch (err) {
    console.error('Error removing discount:', err);
    throw err;
  }
}

/**
 * Calculate order total with discounts
 * @param {array} items - Array of {itemId, qty, price}
 * @returns {object} {subtotal, totalDiscount, finalTotal, itemBreakdown}
 */
export async function calculateOrderTotal(items) {
  let subtotal = 0;
  let totalDiscount = 0;
  const itemBreakdown = [];
  
  for (const item of items) {
    const itemTotal = item.price * item.qty;
    const discount = await getItemDiscount(item.itemId);
    const discountAmount = itemTotal * (discount / 100);
    const itemFinalTotal = itemTotal - discountAmount;
    
    subtotal += itemTotal;
    totalDiscount += discountAmount;
    
    itemBreakdown.push({
      itemId: item.itemId,
      quantity: item.qty,
      price: item.price,
      itemTotal: itemTotal,
      appliedDiscount: discount,
      discountAmount: discountAmount,
      finalTotal: itemFinalTotal
    });
  }
  
  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    totalDiscount: parseFloat(totalDiscount.toFixed(2)),
    finalTotal: parseFloat((subtotal - totalDiscount).toFixed(2)),
    itemBreakdown
  };
}
