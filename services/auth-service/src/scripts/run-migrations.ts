/**
 * Script pour exécuter les migrations de base de données
 */

import { Pool } from "pg";
import fs from "fs";
import path from "path";

async function runMigrations(): Promise<void> {
  const pool = new Pool({
    host: process.env["DB_HOST"] || "localhost",
    port: parseInt(process.env["DB_PORT"] || "5432"),
    database: process.env["DB_NAME"] || "auth_service_db",
    user: process.env["DB_USER"] || "auth_user",
    password: process.env["DB_PASSWORD"] || "auth_password",
  });

  try {
    console.log("🔄 Exécution des migrations...");

    // Migration 1: Créer la table users
    const migration1 = fs.readFileSync(
      path.join(__dirname, "../migrations/001_create_users_table.sql"),
      "utf8"
    );
    await pool.query(migration1);
    console.log("✅ Migration 1: Table users créée");

    // Migration 2: Ajouter le champ is_backoffice_approved
    const migration2 = fs.readFileSync(
      path.join(__dirname, "../migrations/002_add_backoffice_approval.sql"),
      "utf8"
    );
    await pool.query(migration2);
    console.log("✅ Migration 2: Champ is_backoffice_approved ajouté");

    console.log("🎉 Toutes les migrations ont été exécutées avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors de l'exécution des migrations:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Exécuter les migrations si ce script est appelé directement
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log("✅ Migrations terminées");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Erreur:", error);
      process.exit(1);
    });
}

export { runMigrations };
