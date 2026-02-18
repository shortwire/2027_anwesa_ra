import mysql from 'mysql2/promise';
import 'dotenv/config';

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '203.171.240.118',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'project',
    password: process.env.DB_PASSWORD || 'Project@123',
    database: process.env.DB_NAME || 'FSD_db'
  });

  try {
    console.log('Running migration...');

    // Add missing columns to Order_24 table (with error handling for existing columns)
    console.log('Adding TotalPrice column...');
    try {
      await connection.execute('ALTER TABLE Order_24 ADD COLUMN TotalPrice DECIMAL(10, 2) DEFAULT 0.00');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('  → TotalPrice column already exists');
      } else {
        throw err;
      }
    }

    console.log('Adding DiscountAmount column...');
    try {
      await connection.execute('ALTER TABLE Order_24 ADD COLUMN DiscountAmount DECIMAL(10, 2) DEFAULT 0.00');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('  → DiscountAmount column already exists');
      } else {
        throw err;
      }
    }

    console.log('Adding AppliedDiscount column...');
    try {
      await connection.execute('ALTER TABLE Order_24 ADD COLUMN AppliedDiscount DECIMAL(5, 2) DEFAULT 0.00');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('  → AppliedDiscount column already exists');
      } else {
        throw err;
      }
    }

    console.log('Adding OrderDate column...');
    try {
      await connection.execute('ALTER TABLE Order_24 ADD COLUMN OrderDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('  → OrderDate column already exists');
      } else {
        throw err;
      }
    }

    // Create discou24 table
    console.log('Creating discou24 table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS discou24 (
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

    // Add initial discount data for existing items
    console.log('Adding initial discount data for existing items...');
    try {
      await connection.execute(`
        INSERT INTO discou24 (ItemID, DiscountPercentage, Description, IsActive)
        SELECT ItemID, 0.00, CONCAT('Discount for ', ItemDesc), 1
        FROM Item_24
        WHERE ItemID NOT IN (SELECT ItemID FROM discou24)
        ON DUPLICATE KEY UPDATE IsActive = VALUES(IsActive)
      `);
    } catch (err) {
      console.log('  → Note: Could not insert initial discount data (may already exist)');
      console.log('  → Error:', err.message);
    }

    console.log('✅ Migration completed successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigration();
