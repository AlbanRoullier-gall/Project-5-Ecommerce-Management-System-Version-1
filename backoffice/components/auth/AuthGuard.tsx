"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { UserPublicDTO } from "../../dto";
import LoadingSpinner from "./ui/LoadingSpinner";

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
 * - Pas de token → /login
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
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("auth_token");
      const userStr = localStorage.getItem("user");

      if (!token) {
        // Pas de token, rediriger vers la page de connexion
        router.push("/login");
        return;
      }

      // Vérifier le statut d'approbation backoffice
      if (userStr) {
        try {
          const user = JSON.parse(userStr) as UserPublicDTO;

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
        } catch (error) {
          console.error(
            "Erreur lors de la lecture des données utilisateur:",
            error
          );
          // En cas d'erreur, rediriger vers login
          router.push("/login");
          return;
        }
      }

      // Token présent et utilisateur approuvé
      setIsAuthenticated(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

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
