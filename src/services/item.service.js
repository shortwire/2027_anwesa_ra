import { pool } from '../config/database.js';

export async function getAllItems() {
  const [rows] = await pool.query('SELECT * FROM Item_24');
  return rows;
}

export async function getItemById(id) {
  const [rows] = await pool.query('SELECT * FROM Item_24 WHERE ItemID = ?', [id]); //for prevention sql injection '?'=binding
  return rows[0] || null;
}

export async function createItem(data) {  //data is nothing but a json
  const { ItemDesc, Qty = 0, Price = null } = data; //if quantity is not available so then we assign it to 0
  const [result] = await pool.query(
    'INSERT INTO Item_24 (ItemDesc, Qty, Price) VALUES (?, ?, ?)',
    [ItemDesc, Qty, Price]
  );
  return { ItemID: result.insertId, ItemDesc, Qty, Price };
}

export async function updateItem(id, data) {
  const { ItemDesc, Qty = 0, Price = null } = data;
  const [result] = await pool.query(
    'UPDATE Item_24 SET ItemDesc = ?, Qty = ?, Price = ? WHERE ItemID = ?',
    [ItemDesc, Qty, Price, id]
  );
  return result.affectedRows > 0; //check rows are updated or not if not return false
}
//extra function for patch
//extra function for patch
export async function PatchItem(id, updates) {
  // Build dynamic UPDATE query for only provided fields
  const fields = Object.keys(updates);
  const values = fields.map(field => updates[field]);
  values.push(id); // Add ID at the end for WHERE clause
  
  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const query = `UPDATE Item_24 SET ${setClause} WHERE ItemID = ?`;
  
  const [result] = await pool.query(query, values);
  return result.affectedRows > 0;
}


export async function deleteItem(id) {
  const [result] = await pool.query('DELETE FROM Item_24 WHERE ItemID = ?', [id]);
  return result.affectedRows > 0;
}

export async function getAllDiscounts() {
  const [rows] = await pool.query('SELECT item_id AS ItemID, discount_percent AS DiscountPercentage FROM discou24');
  return rows;
}
