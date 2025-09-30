/**
 * SYSTÈME DE MIGRATION DE BASE DE DONNÉES
 *
 * Ce fichier gère automatiquement l'évolution du schéma de la base de données
 * en exécutant des fichiers SQL dans l'ordre et en gardant un historique.
 *
 * PRINCIPE :
 * - Lit tous les fichiers .sql dans le dossier migrations/
 * - Vérifie quelles migrations ont déjà été exécutées
 * - Exécute uniquement les nouvelles migrations
 * - Enregistre chaque migration exécutée dans une table de suivi
 */

// ===== IMPORTS =====
import { Pool } from "pg"; // Client PostgreSQL pour la connexion à la DB
import fs from "fs"; // Système de fichiers pour lire les fichiers SQL
import path from "path"; // Utilitaires pour les chemins de fichiers
import dotenv from "dotenv"; // Chargement des variables d'environnement

// Charger les variables d'environnement depuis le fichier .env
dotenv.config();

// ===== CONFIGURATION DE LA CONNEXION À LA BASE DE DONNÉES =====
const pool = new Pool({
  connectionString: process.env["DATABASE_URL"], // URL de connexion à la DB
  ssl:
    process.env["NODE_ENV"] === "production" // SSL en production uniquement
      ? { rejectUnauthorized: false }
      : false,
});

/**
 * FONCTION PRINCIPALE : Exécute toutes les migrations en attente
 *
 * Cette fonction :
 * 1. Se connecte à la base de données
 * 2. Crée la table de suivi des migrations si elle n'existe pas
 * 3. Lit tous les fichiers .sql dans le dossier migrations/
 * 4. Vérifie quelles migrations ont déjà été exécutées
 * 5. Exécute uniquement les nouvelles migrations
 * 6. Enregistre chaque migration exécutée
 */
export async function runMigrations(): Promise<void> {
  // Connexion à la base de données
  const client = await pool.connect();

  try {
    console.log("🚀 Démarrage des migrations pour website-content-service...");

    // ===== ÉTAPE 1 : CRÉER LA TABLE DE SUIVI DES MIGRATIONS =====
    // Cette table garde un historique de toutes les migrations exécutées
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,                                    -- ID unique de la migration
        filename VARCHAR(255) NOT NULL UNIQUE,                    -- Nom du fichier SQL
        executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP -- Date d'exécution
      )
    `);

    // ===== ÉTAPE 2 : LIRE TOUS LES FICHIERS DE MIGRATION =====
    // Récupère tous les fichiers .sql dans le dossier migrations/ et les trie alphabétiquement
    const migrationFiles = fs
      .readdirSync(__dirname) // Lire le contenu du dossier migrations/
      .filter((file) => file.endsWith(".sql")) // Filtrer uniquement les fichiers .sql
      .sort(); // Trier alphabétiquement (001_, 002_, etc.)

    // ===== ÉTAPE 3 : VÉRIFIER LES MIGRATIONS DÉJÀ EXÉCUTÉES =====
    // Récupère la liste des migrations qui ont déjà été exécutées
    const executedMigrations = await client.query(
      "SELECT filename FROM migrations ORDER BY executed_at"
    );
    const executedFilenames = executedMigrations.rows.map(
      (row) => row.filename
    );

    // ===== ÉTAPE 4 : EXÉCUTER LES MIGRATIONS EN ATTENTE =====
    // Parcourt tous les fichiers de migration et exécute ceux qui n'ont pas encore été traités
    for (const filename of migrationFiles) {
      if (!executedFilenames.includes(filename)) {
        // Cette migration n'a pas encore été exécutée
        console.log(`📝 Exécution de la migration : ${filename}`);

        // Lire le contenu du fichier SQL
        const migrationSQL = fs.readFileSync(
          path.join(__dirname, filename),
          "utf8"
        );

        // Exécuter le SQL de la migration
        await client.query(migrationSQL);

        // Enregistrer cette migration comme exécutée dans la table de suivi
        await client.query("INSERT INTO migrations (filename) VALUES ($1)", [
          filename,
        ]);

        console.log(`✅ Migration ${filename} terminée avec succès`);
      } else {
        // Cette migration a déjà été exécutée, on la passe
        console.log(`⏭️  Migration ${filename} déjà exécutée`);
      }
    }

    console.log("🎉 Toutes les migrations ont été exécutées avec succès !");
  } catch (error) {
    // En cas d'erreur, afficher le message et relancer l'erreur
    console.error("❌ Échec de la migration :", error);
    throw error;
  } finally {
    // Toujours libérer la connexion et fermer le pool
    client.release();
    await pool.end();
  }
}

// ===== EXÉCUTION AUTOMATIQUE SI LE FICHIER EST LANCÉ DIRECTEMENT =====
// Si ce fichier est exécuté directement (pas importé), lancer automatiquement les migrations
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log("Processus de migration terminé");
      process.exit(0); // Sortir avec succès
    })
    .catch((error) => {
      console.error("Échec du processus de migration :", error);
      process.exit(1); // Sortir avec erreur
    });
}

export default runMigrations;
