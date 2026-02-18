import { pool } from '../config/database.js';

export async function getAllCustomers() {
  const [rows] = await pool.query('SELECT * FROM Customer_24');
  return rows;
}

export async function getCustomerById(id) {
  const [rows] = await pool.query('SELECT * FROM Customer_24 WHERE CustomerID = ?', [id]);
  return rows[0] || null;
}

export async function createCustomer(data) {
  const { CustomerName, Priority = 0 } = data;
  const [result] = await pool.query(
    'INSERT INTO Customer_24 (CustomerName, Priority) VALUES (?, ?)',
    [CustomerName, Priority]
  );
  return { CustomerID: result.insertId, CustomerName, Priority };
}

export async function updateCustomer(id, data) {
  const { CustomerName, Priority } = data;
  const [result] = await pool.query(
    'UPDATE Customer_24 SET CustomerName = ?, Priority = ? WHERE CustomerID = ?',
    [CustomerName, Priority, id]
  );
  return result.affectedRows > 0;
}
//extra function for patch
export async function patchCustomer(id, updates) {
  // Build dynamic UPDATE query for only provided fields
  const fields = Object.keys(updates);
  const values = fields.map(field => updates[field]);
  values.push(id); // Add ID at the end for WHERE clause
  
  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const query = `UPDATE Customer_24 SET ${setClause} WHERE CustomerID = ?`;
  
  const [result] = await pool.query(query, values);
  return result.affectedRows > 0;
}
export async function deleteCustomer(id) {
  const [result] = await pool.query('DELETE FROM Customer_24 WHERE CustomerID = ?', [id]);
  return result.affectedRows > 0;
}
