import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

async function migrate(): Promise<void> {
  try {
    console.log("Starting database migration...");

    // Create orders table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL,
        customer_snapshot JSONB NOT NULL,
        total_amount_ht NUMERIC(10,2) NOT NULL,
        total_amount_ttc NUMERIC(10,2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create order_items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price_ht NUMERIC(10,2) NOT NULL,
        unit_price_ttc NUMERIC(10,2) NOT NULL,
        vat_rate NUMERIC(5,2) NOT NULL,
        total_price_ht NUMERIC(10,2) NOT NULL,
        total_price_ttc NUMERIC(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create credit_notes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS credit_notes (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        total_amount_ht NUMERIC(10,2) NOT NULL,
        total_amount_ttc NUMERIC(10,2) NOT NULL,
        reason TEXT NOT NULL,
        description TEXT,
        issue_date DATE NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create credit_note_items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS credit_note_items (
        id SERIAL PRIMARY KEY,
        credit_note_id INTEGER REFERENCES credit_notes(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price_ht NUMERIC(10,2) NOT NULL,
        unit_price_ttc NUMERIC(10,2) NOT NULL,
        vat_rate NUMERIC(5,2) NOT NULL,
        total_price_ht NUMERIC(10,2) NOT NULL,
        total_price_ttc NUMERIC(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create order_addresses table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_addresses (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        type VARCHAR(20) NOT NULL CHECK (type IN ('shipping', 'billing')),
        address_snapshot JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create indexes
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id)"
    );
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)"
    );
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)"
    );
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id)"
    );
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_credit_notes_customer_id ON credit_notes(customer_id)"
    );
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_credit_notes_order_id ON credit_notes(order_id)"
    );
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_credit_note_items_credit_note_id ON credit_note_items(credit_note_id)"
    );
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_order_addresses_order_id ON order_addresses(order_id)"
    );

    console.log("Database migration completed successfully!");
  } catch (error) {
    console.error("Migration error:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  migrate().catch(console.error);
}

export default migrate;
