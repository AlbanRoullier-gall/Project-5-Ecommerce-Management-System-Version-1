"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";

interface AuthRedirectGuardProps {
  children: React.ReactNode;
}

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

  // Si pas connecté, afficher le contenu de la page d'authentification
  if (shouldRender) {
    return <>{children}</>;
  }

  // Par défaut, ne rien afficher (redirection en cours)
  return null;
};

export default AuthRedirectGuard;
