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

    // Create website_pages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS website_pages (
        page_id SERIAL PRIMARY KEY,
        page_slug VARCHAR(100) UNIQUE NOT NULL,
        page_title VARCHAR(255) NOT NULL,
        markdown_content TEXT NOT NULL,
        html_content TEXT NOT NULL,
        version INTEGER NOT NULL DEFAULT 1,
        creation_timestamp TIMESTAMP DEFAULT NOW(),
        last_update_timestamp TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create website_page_versions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS website_page_versions (
        version_id SERIAL PRIMARY KEY,
        parent_page_id INTEGER REFERENCES website_pages(page_id) ON DELETE CASCADE,
        markdown_content TEXT NOT NULL,
        html_content TEXT NOT NULL,
        version INTEGER NOT NULL,
        creation_timestamp TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create indexes
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_website_pages_slug ON website_pages(page_slug)"
    );
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_website_pages_updated ON website_pages(last_update_timestamp)"
    );
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_website_page_versions_parent ON website_page_versions(parent_page_id)"
    );
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_website_page_versions_version ON website_page_versions(version)"
    );

    // Insert default pages
    await pool.query(`
      INSERT INTO website_pages (page_slug, page_title, markdown_content, html_content, version) VALUES 
      ('home', 'Accueil', '# Bienvenue sur notre site e-commerce', '<h1>Bienvenue sur notre site e-commerce</h1>', 1),
      ('about', 'À propos', '# À propos de nous', '<h1>À propos de nous</h1>', 1),
      ('contact', 'Contact', '# Contactez-nous', '<h1>Contactez-nous</h1>', 1)
      ON CONFLICT (page_slug) DO NOTHING
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
