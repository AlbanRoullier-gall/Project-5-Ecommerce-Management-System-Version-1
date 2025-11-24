"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../contexts/AuthContext";
import { LoadingSpinner } from "../shared";

/**
 * Props du composant AuthGuard
 */
interface AuthGuardProps {
  /** Contenu à protéger (affiché uniquement si authentifié et approuvé) */
  children: React.ReactNode;
}

/**
 * Composant de protection des routes
 *
 * Vérifie l'authentification et l'approbation backoffice de l'utilisateur
 * avant d'afficher le contenu protégé
 *
 * Scénarios de redirection :
 * - Pas de token → /auth/login
 * - Token mais rejeté → /access-rejected
 * - Token mais pas approuvé → /pending-approval
 * - Token et approuvé → Affiche le contenu protégé
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
  const { isLoading, isAuthenticated, user } = useAuth();

  useEffect(() => {
    // Ne faire les redirections que lorsque le chargement est terminé
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      // Pas de token, rediriger vers la page de connexion
      router.push("/auth/login");
      return;
    }

    // Vérifier le statut d'approbation backoffice
    if (user) {
      // Rediriger si l'accès a été rejeté
      if (user.isBackofficeRejected) {
        router.push("/access-rejected");
        return;
      }

      // Rediriger si l'accès n'est pas encore approuvé
      if (!user.isBackofficeApproved) {
        router.push("/pending-approval");
        return;
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Afficher un loader pendant la vérification
  if (isLoading) {
    return <LoadingSpinner message="Vérification de l'authentification..." />;
  }

  // Si authentifié et approuvé, afficher le contenu protégé
  if (
    isAuthenticated &&
    user?.isBackofficeApproved &&
    !user?.isBackofficeRejected
  ) {
    return <>{children}</>;
  }

  // Par défaut, ne rien afficher (redirection en cours)
  return null;
};

export default AuthGuard;
