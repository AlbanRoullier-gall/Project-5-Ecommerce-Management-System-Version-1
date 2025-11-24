"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthContext";
import { LoadingSpinner } from "../components/shared";

/**
 * Page racine du backoffice (/)
 *
 * Redirection simple :
 * - Si authentifié → Redirige vers /dashboard (AuthGuard gérera les cas rejeté/pending)
 * - Sinon → Redirige vers /auth/login
 *
 * Affiche un loader pendant la vérification
 * Cette page ne doit jamais être vue directement par l'utilisateur
 */
export default function Home() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    // Ne faire les redirections que lorsque le chargement est terminé
    if (isLoading) {
      return;
    }

    // Redirection simple : authentifié → dashboard, sinon → login
    // AuthGuard sur /dashboard gérera les cas rejeté/pending
    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/auth/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Afficher un loader pendant la vérification
  return <LoadingSpinner message="Vérification de l'authentification..." />;
}
