"use client";

import Head from "next/head";
import { useEffect } from "react";
import { useRouter } from "next/router";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useCart } from "../../contexts/CartContext";
import CheckoutCustomerForm from "../../components/checkout/CheckoutCustomerForm";
import CheckoutProgress from "../../components/checkout/CheckoutProgress";

/**
 * Page d'informations client du checkout
 * Première étape du processus de commande
 */
export default function CheckoutInformationPage() {
  const router = useRouter();
  const { cart, isLoading } = useCart();

  // Vérifier si le panier est vide
  useEffect(() => {
    if (!isLoading && (!cart || !cart.items || cart.items.length === 0)) {
      router.push("/cart");
    }
  }, [cart, isLoading, router]);

  if (isLoading) {
    return (
      <>
        <Head>
          <title>Chargement... - Nature de Pierre</title>
        </Head>
        <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
          <Header />
          <div
            style={{
              textAlign: "center",
              padding: "5rem 2rem",
            }}
          >
            <i
              className="fas fa-spinner fa-spin"
              style={{
                fontSize: "4rem",
                color: "#13686a",
                marginBottom: "2rem",
              }}
            ></i>
            <p style={{ fontSize: "1.4rem", color: "#666" }}>Chargement...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Informations - Checkout - Nature de Pierre</title>
        <meta
          name="description"
          content="Renseignez vos informations personnelles"
        />
      </Head>

      <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
        <Header />

        <div
          className="checkout-main-content"
          style={{
            maxWidth: "1200px",
            margin: "3rem auto",
            padding: "0 2rem",
            minHeight: "60vh",
          }}
        >
          {/* En-tête */}
          <div
            className="checkout-header"
            style={{ marginBottom: "3rem", textAlign: "center" }}
          >
            <h1
              className="checkout-title"
              style={{
                fontSize: "3rem",
                color: "#333",
                fontWeight: "700",
                marginBottom: "1rem",
              }}
            >
              Finaliser votre commande
            </h1>
            <p
              className="checkout-subtitle"
              style={{ fontSize: "1.4rem", color: "#666" }}
            >
              Complétez les étapes ci-dessous pour passer votre commande
            </p>
          </div>

          {/* Indicateur de progression */}
          <CheckoutProgress />

          <CheckoutCustomerForm />
        </div>

        <Footer />
      </div>

      <style jsx global>{`
        /* Responsive Design pour Checkout */

        /* Tablette */
        @media (max-width: 1024px) {
          .checkout-main-content {
            margin: 2rem auto !important;
            padding: 0 1.5rem !important;
          }

          .checkout-progress {
            padding: 0 1rem !important;
          }

          .checkout-step-label {
            font-size: 1.1rem !important;
          }

          .checkout-title {
            font-size: 2.5rem !important;
          }

          .checkout-subtitle {
            font-size: 1.2rem !important;
          }
        }

        /* Mobile */
        @media (max-width: 768px) {
          .checkout-main-content {
            margin: 1.5rem auto !important;
            padding: 0 1rem !important;
          }

          /* Masquer le titre et sous-titre sur mobile */
          .checkout-header {
            display: none !important;
          }

          /* Masquer l'indicateur de progression sur mobile */
          .checkout-progress {
            display: none !important;
          }
        }

        /* iPhone */
        @media (max-width: 480px) {
          .checkout-main-content {
            margin: 0.5rem auto !important;
            padding: 0 0.3rem !important;
            max-width: 100% !important;
          }

          .checkout-header {
            display: none !important;
          }

          .checkout-progress {
            display: none !important;
          }
        }

        /* Très petits écrans */
        @media (max-width: 360px) {
          .checkout-main-content {
            padding: 0 0.5rem !important;
          }

          .checkout-title {
            font-size: 1.6rem !important;
          }

          .checkout-progress > div {
            padding: 0.6rem !important;
          }

          .checkout-progress > div > div:first-child {
            width: 40px !important;
            height: 40px !important;
            font-size: 1.2rem !important;
          }

          .checkout-step-label {
            font-size: 0.8rem !important;
          }
        }
      `}</style>
    </>
  );
}
