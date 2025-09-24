const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

async function migrate() {
  try {
    console.log("Starting database migration...");

    // Create payment_intents table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payment_intents (
        id SERIAL PRIMARY KEY,
        stripe_payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
        customer_id INTEGER NOT NULL,
        order_id INTEGER NOT NULL,
        amount NUMERIC(10,2) NOT NULL,
        currency VARCHAR(3) NOT NULL DEFAULT 'eur',
        status VARCHAR(50) NOT NULL DEFAULT 'requires_payment_method',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create payment_methods table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payment_methods (
        id SERIAL PRIMARY KEY,
        stripe_payment_method_id VARCHAR(255) UNIQUE NOT NULL,
        customer_id INTEGER NOT NULL,
        type VARCHAR(50) NOT NULL,
        card_last4 VARCHAR(4),
        card_brand VARCHAR(50),
        card_exp_month INTEGER,
        card_exp_year INTEGER,
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create refunds table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS refunds (
        id SERIAL PRIMARY KEY,
        stripe_refund_id VARCHAR(255) UNIQUE NOT NULL,
        payment_intent_id INTEGER REFERENCES payment_intents(id),
        amount NUMERIC(10,2) NOT NULL,
        currency VARCHAR(3) NOT NULL,
        reason VARCHAR(50),
        status VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create indexes
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_payment_intents_customer_id ON payment_intents(customer_id)"
    );
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_payment_intents_order_id ON payment_intents(order_id)"
    );
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_payment_intents_status ON payment_intents(status)"
    );
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_payment_methods_customer_id ON payment_methods(customer_id)"
    );
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_refunds_payment_intent_id ON refunds(payment_intent_id)"
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

module.exports = migrate;
