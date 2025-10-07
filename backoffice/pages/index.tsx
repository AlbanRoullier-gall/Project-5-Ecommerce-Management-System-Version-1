"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Vérifier si l'utilisateur est authentifié côté client
    const token = localStorage.getItem("auth_token");

    if (!token) {
      // Si pas de token, rediriger vers la page de connexion
      router.push("/login");
    } else {
      // Si authentifié, rediriger vers le dashboard
      router.push("/dashboard");
    }
  }, [router]);

  // Afficher un loader pendant la vérification
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
