"use client";

import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useCart } from "../../contexts/CartContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020";

/**
 * Page de confirmation de commande réussie
 */
export default function CheckoutSuccessPage() {
  const router = useRouter();
  const { csid } = router.query;
  const { clearCart, cart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const hasFinalized = useRef(false);

  // Finaliser le paiement : créer la commande, envoyer l'email de confirmation et vider le panier
  // Cette finalisation se fait depuis cette page après la redirection Stripe
  useEffect(() => {
    // Attendre que le router soit prêt pour accéder aux query params
    if (!router.isReady) {
      return;
    }

    // Stripe ajoute session_id dans les query params, pas csid
    const sessionId =
      (router.query.session_id as string) || (router.query.csid as string);

    // Éviter les appels multiples
    if (!sessionId || isProcessing || hasFinalized.current) {
      return;
    }

    const cartSessionId =
      typeof window !== "undefined"
        ? window.localStorage.getItem("cart_session_id")
        : null;

    if (!cartSessionId) {
      console.error("No cart session ID found");
      return;
    }

    // Note: On ne vérifie pas si le cart est vide car après un paiement réussi,
    // le cart peut être vide. La finalisation utilise le cartSessionId et session_id.

    setIsProcessing(true);
    hasFinalized.current = true;

    const finalize = async () => {
      try {
        // Récupérer les données checkout depuis sessionStorage
        const checkoutDataKey = "checkout_data";
        const storedCheckoutData = sessionStorage.getItem(checkoutDataKey);

        if (!storedCheckoutData) {
          throw new Error("Données de checkout introuvables");
        }

        const checkoutData = JSON.parse(storedCheckoutData);

        console.log("Finalizing payment with:", {
          csid: sessionId,
          cartSessionId,
        });
        const response = await fetch(`${API_URL}/api/payment/finalize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            csid: sessionId,
            cartSessionId,
            checkoutData,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Finalize payment error:", errorData);
          throw new Error(errorData.message || "Failed to finalize payment");
        }

        const result = await response.json();
        console.log("Payment finalized successfully:", result);
        return result;
      } catch (e) {
        console.error("Finalize payment exception:", e);
        // Réinitialiser hasFinalized en cas d'erreur pour permettre un retry
        hasFinalized.current = false;
        throw e;
      }
    };

    Promise.resolve()
      .then(finalize)
      .then(() => {
        console.log("Clearing cart after successful payment");
        clearCart();
      })
      .catch((error) => {
        console.error("Failed to finalize payment:", error);
        // Ne pas vider le panier si la finalisation échoue
      })
      .finally(() => setIsProcessing(false));
  }, [router.isReady, router.query.session_id, router.query.csid, clearCart]);

  return (
    <>
      <Head>
        <title>Commande réussie - Nature de Pierre</title>
        <meta name="description" content="Votre commande a été confirmée" />
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
          {/* Icône de succès */}
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "5rem",
              margin: "0 auto 3rem",
              boxShadow: "0 8px 24px rgba(16, 185, 129, 0.3)",
            }}
          >
            <i className="fas fa-check"></i>
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
            Commande confirmée !
          </h1>

          {/* Message de confirmation */}
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
                  className="fas fa-check-circle"
                  style={{ color: "#10b981", marginRight: "0.8rem" }}
                ></i>
                Votre paiement a été traité avec succès
              </p>
              <p style={{ marginBottom: "1.5rem" }}>
                <i
                  className="fas fa-envelope"
                  style={{ color: "#13686a", marginRight: "0.8rem" }}
                ></i>
                Un email de confirmation vous a été envoyé
              </p>
              <p>
                <i
                  className="fas fa-truck"
                  style={{ color: "#13686a", marginRight: "0.8rem" }}
                ></i>
                Votre commande sera traitée dans les plus brefs délais
              </p>
            </div>

            <div
              style={{
                padding: "2rem",
                background: "#f8f9fa",
                borderRadius: "12px",
                border: "2px solid #e0e0e0",
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
                Que se passe-t-il maintenant ?
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
                <li>Nous préparons votre commande avec soin</li>
                <li>Vous recevrez un email avec les détails de livraison</li>
                <li>Vous pourrez suivre votre colis en temps réel</li>
                <li>
                  Notre équipe reste à votre disposition pour toute question
                </li>
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
              href="/"
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
              <i className="fas fa-home"></i>
              Retour à l'accueil
            </Link>

            <Link
              href="/#catalog"
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
              <i className="fas fa-shopping-bag"></i>
              Continuer mes achats
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

          .success-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
}
