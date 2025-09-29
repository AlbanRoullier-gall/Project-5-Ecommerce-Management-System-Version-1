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

    // Create civilities table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS civilities (
        civility_id SERIAL PRIMARY KEY,
        abbreviation VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Insert default civilities
    await pool.query(`
      INSERT INTO civilities (abbreviation) VALUES 
      ('Mr'), ('Mme'), ('Mlle'), ('Dr'), ('Prof')
      ON CONFLICT DO NOTHING
    `);

    // Create countries table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS countries (
        country_id SERIAL PRIMARY KEY,
        country_name VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Insert default countries
    await pool.query(`
      INSERT INTO countries (country_name) VALUES 
      ('France'), ('Belgique'), ('Suisse'), ('Canada'), ('États-Unis')
      ON CONFLICT DO NOTHING
    `);

    // Create socio professional categories table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS socio_professional_categories (
        category_id SERIAL PRIMARY KEY,
        category_name VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Insert default categories
    await pool.query(`
      INSERT INTO socio_professional_categories (category_name) VALUES 
      ('Employé'), ('Cadre'), ('Dirigeant'), ('Artisan'), ('Commerçant'), 
      ('Profession libérale'), ('Retraité'), ('Étudiant'), ('Sans emploi')
      ON CONFLICT DO NOTHING
    `);

    // Create customers table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS customers (
        customer_id SERIAL PRIMARY KEY,
        civility_id INTEGER REFERENCES civilities(civility_id),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        socio_professional_category_id INTEGER REFERENCES socio_professional_categories(category_id),
        phone_number VARCHAR(20),
        birthday DATE,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create customer addresses table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS customer_addresses (
        address_id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(customer_id) ON DELETE CASCADE,
        address_type VARCHAR(50) NOT NULL CHECK (address_type IN ('shipping', 'billing')),
        address TEXT NOT NULL,
        postal_code VARCHAR(10) NOT NULL,
        city VARCHAR(100) NOT NULL,
        country_id INTEGER REFERENCES countries(country_id),
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create customer companies table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS customer_companies (
        company_id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(customer_id) ON DELETE CASCADE,
        company_name VARCHAR(255) NOT NULL,
        siret_number VARCHAR(20),
        vat_number VARCHAR(20),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create indexes
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email)"
    );
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_customers_active ON customers(is_active)"
    );
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer_id ON customer_addresses(customer_id)"
    );
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_customer_companies_customer_id ON customer_companies(customer_id)"
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

export { migrate as runMigrations };
export default migrate;
