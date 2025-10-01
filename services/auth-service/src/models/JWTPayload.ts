/**
 * JWT Payload Interface
 * Représente les données stockées dans les tokens JWT
 *
 * Architecture : Interface simple et claire
 * - Contient uniquement les informations essentielles
 * - Correspond aux données utilisateur nécessaires pour l'authentification
 * - Admin-only system: all authenticated users are admins
 */
export interface JWTPayload {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
}
