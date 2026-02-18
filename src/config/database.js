import mysql from 'mysql2/promise';
import 'dotenv/config';

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0 // waiting infinite connection 
});

export async function pingDatabase() {
  const conn = await pool.getConnection();
  try {
    await conn.ping(); // if there is a error then after that 
  } finally {
    conn.release(); //all cleanup are inside finally
  }
}
