"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";
import { UserPublicDTO } from "../dto";
import { LoadingSpinner } from "../components/shared";

/**
 * Page racine du backoffice (/)
 *
 * Gère la redirection automatique selon l'état d'authentification et d'approbation :
 * - Pas de token → Redirige vers /auth/login
 * - Token mais rejeté → Redirige vers /access-rejected
 * - Token mais pas approuvé → Redirige vers /pending-approval
 * - Token et approuvé → Redirige vers /dashboard
 *
 * Affiche un loader pendant la vérification
 * Cette page ne doit jamais être vue directement par l'utilisateur
 */
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("auth_token");
      const userStr = localStorage.getItem("user");

      if (!token) {
        // Pas de token, rediriger vers la page de connexion
        router.push("/auth/login");
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
          router.push("/auth/login");
          return;
        }
      }

      // Token présent et utilisateur approuvé, rediriger vers le dashboard
      router.push("/dashboard");
    };

    checkAuth();
  }, [router]);

  // Afficher un loader pendant la vérification
  return <LoadingSpinner message="Vérification de l'authentification..." />;
}
