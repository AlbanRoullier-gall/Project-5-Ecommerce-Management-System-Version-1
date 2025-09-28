/**
 * JWT Payload Interface
 * Représente les données stockées dans les tokens JWT
 *
 * Architecture : Interface simple et claire
 * - Contient uniquement les informations essentielles
 * - Correspond aux données utilisateur nécessaires pour l'authentification
 */
export interface JWTPayload {
  userId: number;
  email: string;
  role: "admin" | "customer";
  firstName: string;
  lastName: string;
}
