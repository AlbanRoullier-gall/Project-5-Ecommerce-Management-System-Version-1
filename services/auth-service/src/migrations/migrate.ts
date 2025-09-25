import { Pool } from "pg";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env["DATABASE_URL"],
  ssl:
    process.env["NODE_ENV"] === "production"
      ? { rejectUnauthorized: false }
      : false,
});

export async function runMigrations(): Promise<void> {
  const client = await pool.connect();

  try {
    console.log("🚀 Starting migrations for auth-service...");

    // Create migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get list of migration files
    const migrationFiles = fs
      .readdirSync(__dirname)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    // Check which migrations have already been executed
    const executedMigrations = await client.query(
      "SELECT filename FROM migrations ORDER BY executed_at"
    );
    const executedFilenames = executedMigrations.rows.map(
      (row) => row.filename
    );

    // Run pending migrations
    for (const filename of migrationFiles) {
      if (!executedFilenames.includes(filename)) {
        console.log(`📝 Executing migration: ${filename}`);

        const migrationSQL = fs.readFileSync(
          path.join(__dirname, filename),
          "utf8"
        );

        await client.query(migrationSQL);

        // Record migration as executed
        await client.query("INSERT INTO migrations (filename) VALUES ($1)", [
          filename,
        ]);

        console.log(`✅ Migration ${filename} completed`);
      } else {
        console.log(`⏭️  Migration ${filename} already executed`);
      }
    }

    console.log("🎉 All migrations completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log("Migration process completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration process failed:", error);
      process.exit(1);
    });
}
