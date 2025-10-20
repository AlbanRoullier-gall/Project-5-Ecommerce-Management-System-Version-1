"use client";

import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

/**
 * Page d'annulation de paiement
 */
export default function CheckoutCancelPage() {
  const router = useRouter();
  const { csid } = router.query;

  return (
    <>
      <Head>
        <title>Paiement annulé - Nature de Pierre</title>
        <meta name="description" content="Votre paiement a été annulé" />
      </Head>

      <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
        <Header />

        {/* Main Content */}
        <div
          style={{
            maxWidth: "800px",
            margin: "5rem auto",
            padding: "0 2rem",
            textAlign: "center",
          }}
        >
          {/* Icône d'annulation */}
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "5rem",
              margin: "0 auto 3rem",
              boxShadow: "0 8px 24px rgba(245, 158, 11, 0.3)",
            }}
          >
            <i className="fas fa-times"></i>
          </div>

          {/* Titre */}
          <h1
            style={{
              fontSize: "3.5rem",
              fontWeight: "700",
              color: "#333",
              marginBottom: "1.5rem",
            }}
          >
            Paiement annulé
          </h1>

          {/* Identifiant de session */}
          {/* csid && (
            <div
              style={{
                fontSize: "1.6rem",
                color: "#666",
                marginBottom: "3rem",
              }}
            >
              Session de paiement:{" "}
              <strong style={{ color: "#13686a" }}>#{csid}</strong>
            </div>
          ) */}

          {/* Message d'information */}
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "3rem",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              marginBottom: "3rem",
            }}
          >
            <div
              style={{
                fontSize: "1.4rem",
                color: "#666",
                lineHeight: "1.8",
                marginBottom: "2rem",
              }}
            >
              <p style={{ marginBottom: "1.5rem" }}>
                <i
                  className="fas fa-info-circle"
                  style={{ color: "#f59e0b", marginRight: "0.8rem" }}
                ></i>
                Votre paiement a été annulé
              </p>
              <p>
                Aucun montant n'a été débité de votre compte. Vos articles sont
                toujours dans votre panier.
              </p>
            </div>

            <div
              style={{
                padding: "2rem",
                background: "#fff7ed",
                borderRadius: "12px",
                border: "2px solid #fed7aa",
              }}
            >
              <h3
                style={{
                  fontSize: "1.6rem",
                  fontWeight: "600",
                  color: "#333",
                  marginBottom: "1rem",
                }}
              >
                Que puis-je faire ?
              </h3>
              <ul
                style={{
                  textAlign: "left",
                  fontSize: "1.3rem",
                  color: "#666",
                  lineHeight: "2",
                  paddingLeft: "2rem",
                }}
              >
                <li>Retourner à votre panier pour vérifier vos articles</li>
                <li>Réessayer le paiement avec une autre méthode</li>
                <li>
                  Contacter notre service client si vous rencontrez des
                  difficultés
                </li>
                <li>Continuer vos achats et finaliser plus tard</li>
              </ul>
            </div>
          </div>

          {/* Boutons d'action */}
          <div
            style={{
              display: "flex",
              gap: "2rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/cart"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "1rem",
                padding: "1.5rem 3rem",
                background: "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
                color: "white",
                textDecoration: "none",
                borderRadius: "12px",
                fontSize: "1.4rem",
                fontWeight: "600",
                boxShadow: "0 4px 12px rgba(19, 104, 106, 0.3)",
                transition: "transform 0.2s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <i className="fas fa-shopping-cart"></i>
              Retour au panier
            </Link>

            <Link
              href="/checkout"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "1rem",
                padding: "1.5rem 3rem",
                background: "white",
                color: "#13686a",
                textDecoration: "none",
                borderRadius: "12px",
                fontSize: "1.4rem",
                fontWeight: "600",
                border: "2px solid #13686a",
                transition: "all 0.3s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "#13686a";
                e.currentTarget.style.color = "white";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "white";
                e.currentTarget.style.color = "#13686a";
              }}
            >
              <i className="fas fa-redo"></i>
              Réessayer le paiement
            </Link>
          </div>

          {/* Aide supplémentaire */}
          <div
            style={{
              marginTop: "4rem",
              padding: "2rem",
              background: "white",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <h3
              style={{
                fontSize: "1.6rem",
                fontWeight: "600",
                color: "#333",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.8rem",
              }}
            >
              <i className="fas fa-headset" style={{ color: "#13686a" }}></i>
              Besoin d'aide ?
            </h3>
            <p
              style={{
                fontSize: "1.3rem",
                color: "#666",
                marginBottom: "1.5rem",
              }}
            >
              Notre équipe est disponible pour vous assister
            </p>
            <Link
              href="/contact"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.8rem",
                color: "#13686a",
                textDecoration: "none",
                fontSize: "1.4rem",
                fontWeight: "600",
              }}
            >
              <i className="fas fa-envelope"></i>
              Contacter le support
            </Link>
          </div>
        </div>

        <Footer />
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          h1 {
            font-size: 2.5rem !important;
          }
        }
      `}</style>
    </>
  );
}
