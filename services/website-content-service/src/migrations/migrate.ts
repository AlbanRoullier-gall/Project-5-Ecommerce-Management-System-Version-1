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

    // Create website_pages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS website_pages (
        id SERIAL PRIMARY KEY,
        page_slug VARCHAR(100) UNIQUE NOT NULL,
        page_title VARCHAR(255) NOT NULL,
        markdown_content TEXT NOT NULL,
        html_content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create website_page_versions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS website_page_versions (
        id SERIAL PRIMARY KEY,
        page_id INTEGER REFERENCES website_pages(id) ON DELETE CASCADE,
        version_number INTEGER NOT NULL,
        markdown_content TEXT NOT NULL,
        html_content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create indexes
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_website_pages_slug ON website_pages(page_slug)"
    );
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_website_pages_updated ON website_pages(updated_at)"
    );
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_website_page_versions_page ON website_page_versions(page_id)"
    );
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_website_page_versions_version ON website_page_versions(version_number)"
    );

    // Insert default pages
    await pool.query(`
      INSERT INTO website_pages (page_slug, page_title, markdown_content, html_content) VALUES 
      ('home', 'Accueil', '# Bienvenue sur notre site e-commerce', '<h1>Bienvenue sur notre site e-commerce</h1>'),
      ('about', 'À propos', '# À propos de nous', '<h1>À propos de nous</h1>'),
      ('contact', 'Contact', '# Contactez-nous', '<h1>Contactez-nous</h1>')
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

export default migrate;
