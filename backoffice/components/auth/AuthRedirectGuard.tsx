"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import LoadingSpinner from "./ui/LoadingSpinner";

/**
 * Props du composant AuthRedirectGuard
 */
interface AuthRedirectGuardProps {
  /** Contenu à afficher (page d'authentification) */
  children: React.ReactNode;
}

/**
 * Composant de redirection pour les pages d'authentification
 *
 * Empêche les utilisateurs déjà connectés d'accéder aux pages d'auth
 * (login, register, reset-password)
 *
 * Scénarios :
 * - Token présent → Redirige vers /dashboard
 * - Pas de token → Affiche la page d'authentification
 *
 * Affiche un loader pendant la vérification
 *
 * @example
 * <AuthRedirectGuard>
 *   <LoginPage />
 * </AuthRedirectGuard>
 */
const AuthRedirectGuard: React.FC<AuthRedirectGuardProps> = ({ children }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("auth_token");

      if (token) {
        // Utilisateur déjà connecté, rediriger vers le dashboard
        router.push("/dashboard");
        return;
      }

      // Pas de token, afficher la page d'authentification
      setShouldRender(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  // Afficher un loader pendant la vérification
  if (isLoading) {
    return <LoadingSpinner message="Vérification de l'authentification..." />;
  }

  // Si pas connecté, afficher le contenu de la page d'authentification
  if (shouldRender) {
    return <>{children}</>;
  }

  // Par défaut, ne rien afficher (redirection en cours)
  return null;
};

export default AuthRedirectGuard;
