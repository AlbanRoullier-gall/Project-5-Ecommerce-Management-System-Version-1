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

    // Create categories table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create products table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price NUMERIC(10,2) NOT NULL,
        vat_rate NUMERIC(5,2) NOT NULL DEFAULT 20.00,
        category_id INTEGER REFERENCES categories(id),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create product_images table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_images (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        filename VARCHAR(255) NOT NULL,
        file_path VARCHAR(255) NOT NULL,
        file_size INTEGER NOT NULL,
        mime_type VARCHAR(50) NOT NULL,
        width INTEGER,
        height INTEGER,
        alt_text VARCHAR(255),
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create product_image_variants table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_image_variants (
        id SERIAL PRIMARY KEY,
        image_id INTEGER REFERENCES product_images(id) ON DELETE CASCADE,
        variant_type VARCHAR(50) NOT NULL,
        file_path VARCHAR(255) NOT NULL,
        width INTEGER,
        height INTEGER,
        file_size INTEGER,
        quality INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create indexes
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id)"
    );
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active)"
    );
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id)"
    );
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_product_images_active ON product_images(is_active)"
    );
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_product_image_variants_image_id ON product_image_variants(image_id)"
    );

    // Insert default categories
    await pool.query(`
      INSERT INTO categories (name, description) VALUES 
      ('Électronique', 'Appareils électroniques et gadgets'),
      ('Vêtements', 'Mode et accessoires'),
      ('Maison & Jardin', 'Décoration et aménagement'),
      ('Sports & Loisirs', 'Équipements sportifs et loisirs'),
      ('Livres', 'Livres et publications')
      ON CONFLICT DO NOTHING
    `);

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
