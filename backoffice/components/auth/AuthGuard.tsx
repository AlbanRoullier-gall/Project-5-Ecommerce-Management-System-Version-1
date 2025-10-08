"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { UserPublicDTO } from "../../dto";

interface AuthGuardProps {
  children: React.ReactNode;
}

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
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "linear-gradient(135deg, #13686a 0%, #0d4f51 100%)",
          color: "white",
          fontSize: "1.2rem",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid rgba(255,255,255,0.3)",
              borderTop: "4px solid white",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 1rem",
            }}
          ></div>
          <p>Vérification de l'authentification...</p>
          <style jsx>{`
            @keyframes spin {
              0% {
                transform: rotate(0deg);
              }
              100% {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // Si authentifié, afficher le contenu protégé
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Par défaut, ne rien afficher (redirection en cours)
  return null;
};

export default AuthGuard;
