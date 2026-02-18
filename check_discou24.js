import mysql from 'mysql2/promise';
import 'dotenv/config';

async function checkDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '203.171.240.118',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'project',
    password: process.env.DB_PASSWORD || 'Project@123',
    database: process.env.DB_NAME || 'FSD_db'
  });

  try {
    // Check if discou24 table exists
    const [tables] = await connection.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'discou24'", [process.env.DB_NAME || 'FSD_db']);
    
    if (tables.length === 0) {
      console.log('❌ discou24 table does NOT exist - Creating it...');
      
      // Create the table
      await connection.query(`
        CREATE TABLE discou24 (
          DiscountID bigint NOT NULL AUTO_INCREMENT,
          ItemID bigint NOT NULL,
          DiscountPercentage DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
          Description varchar(255) COLLATE utf8mb4_unicode_ci,
          IsActive tinyint(1) DEFAULT 1,
          CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (DiscountID),
          UNIQUE KEY uk_discount_item_24 (ItemID),
          KEY fk_discount_item_id_24 (ItemID),
          CONSTRAINT fk_discount_item_id_24 FOREIGN KEY (ItemID) REFERENCES Item_24 (ItemID) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ discou24 table created successfully');
    } else {
      console.log('✅ discou24 table EXISTS');
      
      // Check columns
      const [columns] = await connection.query('DESCRIBE discou24');
      console.log('Columns:', columns.map(c => c.Field).join(', '));
    }
    
    // Add initial discount data for existing items
    console.log('Adding initial discount data for items...');
    await connection.query(`
      INSERT INTO discou24 (item_id, discount_percent)
      SELECT ItemID, 0.00
      FROM Item_24
      WHERE ItemID NOT IN (SELECT item_id FROM discou24)
      ON DUPLICATE KEY UPDATE discount_percent = VALUES(discount_percent)
    `);
    
    console.log('✅ Discount data populated');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await connection.end();
  }
}

checkDatabase();
