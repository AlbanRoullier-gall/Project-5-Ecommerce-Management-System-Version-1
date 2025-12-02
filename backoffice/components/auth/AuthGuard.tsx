"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../contexts/AuthContext";
import { LoadingSpinner } from "../shared";

/**
 * Props du composant AuthGuard
 */
interface AuthGuardProps {
  /** Contenu à protéger (affiché uniquement si authentifié) */
  children: React.ReactNode;
}

/**
 * Composant de protection des routes
 *
 * Vérifie l'authentification de l'utilisateur avant d'afficher le contenu protégé.
 * L'authentification est vérifiée via un cookie httpOnly géré par le serveur.
 *
 * Note: La vérification de l'approbation backoffice est gérée par le service d'authentification
 * lors du login. Si un utilisateur est authentifié, c'est qu'il était approuvé au moment
 * de la connexion.
 *
 * Scénarios de redirection :
 * - Non authentifié → /auth/login
 * - Authentifié → Affiche le contenu protégé
 *
 * Affiche un loader pendant la vérification
 *
 * @example
 * <AuthGuard>
 *   <Dashboard />
 * </AuthGuard>
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    // Ne faire les redirections que lorsque le chargement est terminé
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      // Non authentifié, rediriger vers la page de connexion
      router.push("/auth/login");
      return;
    }
  }, [isLoading, isAuthenticated, router]);

  // Afficher un loader pendant la vérification
  if (isLoading) {
    return <LoadingSpinner message="Vérification de l'authentification..." />;
  }

  // Si authentifié, afficher le contenu protégé
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Par défaut, ne rien afficher (redirection en cours)
  return null;
};

export default AuthGuard;
