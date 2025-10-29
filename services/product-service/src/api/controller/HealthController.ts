/**
 * Contrôleur Santé
 * Points de terminaison de vérification de santé
 *
 * Architecture : Pattern Contrôleur
 * - Gestion des requêtes HTTP
 * - Orchestration des services
 * - Formatage des réponses
 */

import { Request, Response } from "express";
import { Pool } from "pg";
import { ResponseMapper } from "../mapper";

export class HealthController {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Vérification de santé basique
   */
  healthCheck(req: Request, res: Response): void {
    res.json(ResponseMapper.healthSuccess());
  }

  /**
   * Vérification de santé détaillée avec connexion à la base de données
   */
  async detailedHealthCheck(req: Request, res: Response): Promise<void> {
    try {
      // Tester la connexion à la base de données
      await this.pool.query("SELECT 1");

      res.json(ResponseMapper.healthSuccess());
    } catch (error) {
      console.error("Erreur lors de la vérification de santé:", error);
      res.status(500).json(ResponseMapper.healthError());
    }
  }
}
