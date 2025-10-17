"use client";

import Head from "next/head";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useCart } from "../contexts/CartContext";
import CartItem from "../components/cart/CartItem";
import { useMemo } from "react";

/**
 * Page du panier
 * Design moderne avec styles inline
 */
export default function CartPage() {
  const { cart, isLoading, error } = useCart();

  const totals = useMemo(() => {
    if (!cart || !cart.items || cart.items.length === 0) {
      return {
        totalHT: 0,
        totalTTC: cart?.total || 0,
        vatAmount: 0,
        breakdown: [] as { rate: number; amount: number }[],
      };
    }

    let totalHT = 0;
    const vatByRate = new Map<number, number>();

    for (const item of cart.items) {
      const rate = item.vatRate ?? 0;
      const multiplier = 1 + rate / 100;
      const lineTotalTTC = item.price * item.quantity;
      const lineTotalHT = lineTotalTTC / multiplier;
      const vat = lineTotalTTC - lineTotalHT;

      totalHT += lineTotalHT;
      vatByRate.set(rate, (vatByRate.get(rate) || 0) + vat);
    }

    const totalTTC = cart.total;
    const vatAmount = totalTTC - totalHT;
    const breakdown = Array.from(vatByRate.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([rate, amount]) => ({ rate, amount }));

    return { totalHT, totalTTC, vatAmount, breakdown };
  }, [cart]);

  return (
    <>
      <Head>
        <title>Votre Panier - Nature de Pierre</title>
        <meta name="description" content="Consultez votre panier d'achat" />
      </Head>

      <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
        <Header />

        {/* Breadcrumb */}
        <div
          style={{
            background: "#fff",
            padding: "1.5rem 2rem",
            borderBottom: "2px solid #e0e0e0",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              fontSize: "1.2rem",
              color: "#666",
            }}
          >
            <Link
              href="/"
              style={{
                color: "#13686a",
                textDecoration: "none",
                fontWeight: "500",
              }}
            >
              <i className="fas fa-home" style={{ marginRight: "0.5rem" }}></i>
              Accueil
            </Link>
            <span style={{ margin: "0 1rem", color: "#ccc" }}>/</span>
            <span style={{ color: "#333", fontWeight: "600" }}>Panier</span>
          </div>
        </div>

        {/* Main Content */}
        <div
          className="cart-container"
          style={{
            maxWidth: "1200px",
            margin: "3rem auto",
            padding: "0 2rem",
            minHeight: "60vh",
          }}
        >
          {/* Header avec titre et bouton retour */}
          <div
            className="cart-header cart-header-flex"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "3rem",
            }}
          >
            <h1
              className="cart-title"
              style={{
                fontSize: "3rem",
                color: "#333",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              Votre Panier
            </h1>

            <Link
              href="/#catalog"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.8rem",
                padding: "1rem 2rem",
                background: "white",
                color: "#13686a",
                textDecoration: "none",
                borderRadius: "8px",
                fontWeight: "600",
                fontSize: "1.1rem",
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
              <i className="fas fa-arrow-left"></i>
              Continuer mes achats
            </Link>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div
              style={{
                background: "#fee",
                border: "2px solid #fcc",
                color: "#c33",
                padding: "1.5rem",
                borderRadius: "12px",
                marginBottom: "2rem",
                fontSize: "1.2rem",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <i className="fas fa-exclamation-triangle"></i>
              {error}
            </div>
          )}

          {/* Chargement */}
          {isLoading && !cart && (
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
              <p style={{ fontSize: "1.4rem", color: "#666" }}>
                Chargement du panier...
              </p>
            </div>
          )}

          {/* Panier vide */}
          {!isLoading && (!cart || !cart.items || cart.items.length === 0) && (
            <div
              style={{
                textAlign: "center",
                padding: "5rem 2rem",
                background: "white",
                borderRadius: "16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <i
                className="fas fa-shopping-cart cart-empty-icon"
                style={{
                  fontSize: "6rem",
                  color: "#ddd",
                  marginBottom: "2rem",
                }}
              ></i>
              <h2
                className="cart-empty-title"
                style={{
                  fontSize: "2.5rem",
                  marginBottom: "1rem",
                  color: "#333",
                  fontWeight: "600",
                }}
              >
                Votre panier est vide
              </h2>
              <p
                className="cart-empty-text"
                style={{
                  fontSize: "1.3rem",
                  color: "#666",
                  marginBottom: "3rem",
                }}
              >
                Découvrez nos produits et ajoutez-les à votre panier
              </p>
              <Link
                href="/#catalog"
                className="cart-empty-button"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1.2rem 3rem",
                  background:
                    "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "12px",
                  fontSize: "1.3rem",
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
                <i className="fas fa-store"></i>
                Voir nos produits
              </Link>
            </div>
          )}

          {/* Panier avec articles */}
          {cart && cart.items && cart.items.length > 0 && (
            <div
              className="cart-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 400px",
                gap: "3rem",
                alignItems: "start",
              }}
            >
              {/* Liste des articles */}
              <div>
                {cart.items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
              {/* Résumé du panier */}
              <div
                className="cart-summary-wrapper"
                style={{ alignSelf: "center" }}
              >
                <div
                  className="cart-summary"
                  style={{
                    background: "white",
                    borderRadius: "16px",
                    padding: "2.5rem",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    position: "sticky",
                    top: "2rem",
                    border: "3px solid #13686a",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "2rem",
                      marginBottom: "2rem",
                      color: "#333",
                      fontWeight: "700",
                      paddingBottom: "1.5rem",
                      borderBottom: "2px solid #e0e0e0",
                    }}
                  >
                    Résumé de la commande
                  </h2>

                  <div style={{ marginBottom: "2rem" }}>
                    <div
                      className="cart-summary-row"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "0.6rem 0",
                        fontSize: "1.4rem",
                        color: "#555",
                      }}
                    >
                      <span>Total HT</span>
                      <span>{totals.totalHT.toFixed(2)} €</span>
                    </div>

                    {totals.breakdown.map((b) => (
                      <div
                        key={b.rate}
                        className="cart-summary-row"
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "0.4rem 0",
                          fontSize: "1.3rem",
                          color: "#777",
                        }}
                      >
                        <span>TVA ({b.rate}%)</span>
                        <span>{b.amount.toFixed(2)} €</span>
                      </div>
                    ))}

                    <div
                      className="cart-summary-row cart-summary-total"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "1.5rem 0",
                        fontSize: "1.8rem",
                        color: "#13686a",
                        fontWeight: "700",
                        borderTop: "2px solid #e0e0e0",
                        marginTop: "1rem",
                      }}
                    >
                      <span>Total TTC</span>
                      <span>{cart.total.toFixed(2)} €</span>
                    </div>
                  </div>

                  {/* Boutons d'action */}
                  <div style={{ marginBottom: "2rem" }}>
                    <Link
                      href="/checkout"
                      className="cart-checkout-button"
                      style={{
                        width: "100%",
                        padding: "1.5rem",
                        background: isLoading
                          ? "#ccc"
                          : "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: "12px",
                        fontSize: "1.5rem",
                        fontWeight: "700",
                        cursor: isLoading ? "not-allowed" : "pointer",
                        marginBottom: "1rem",
                        boxShadow: "0 4px 12px rgba(19, 104, 106, 0.3)",
                        transition: "transform 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "1rem",
                        textDecoration: "none",
                        pointerEvents: isLoading ? "none" : "auto",
                      }}
                      onMouseOver={(e) => {
                        if (!isLoading) {
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <i className="fas fa-credit-card"></i>
                      Passer la commande
                    </Link>
                  </div>

                  {/* Informations supplémentaires */}
                  <div
                    style={{
                      paddingTop: "2rem",
                      borderTop: "2px solid #e0e0e0",
                    }}
                  >
                    <div
                      className="cart-info-item"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        marginBottom: "1rem",
                        fontSize: "1.2rem",
                        color: "#666",
                      }}
                    >
                      <i
                        className="fas fa-lock"
                        style={{ color: "#13686a", fontSize: "1.4rem" }}
                      ></i>
                      <span>Paiement sécurisé</span>
                    </div>
                    <div
                      className="cart-info-item"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        fontSize: "1.2rem",
                        color: "#666",
                      }}
                    >
                      <i
                        className="fas fa-truck"
                        style={{ color: "#13686a", fontSize: "1.4rem" }}
                      ></i>
                      <span>Livraison gratuite dès 50 €</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <Footer />
      </div>

      <style jsx global>{`
        @media (max-width: 1024px) {
          /* Tablette - passer en une colonne */
          .cart-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }

          /* Supprimer le sticky sur tablette */
          .cart-summary-wrapper {
            position: static !important;
          }

          /* Conteneur principal */
          .cart-container {
            padding: 2rem 1.5rem !important;
          }

          /* Titre */
          .cart-header h1 {
            font-size: 2.5rem !important;
          }

          /* Badge compteur */
          .cart-item-count-badge {
            font-size: 1.1rem !important;
            padding: 0.6rem 1.2rem !important;
          }
        }

        @media (max-width: 768px) {
          /* Mobile - une colonne */
          .cart-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }

          /* Conteneur principal avec moins de padding */
          .cart-container {
            padding: 1.5rem 1rem !important;
            margin: 1.5rem auto !important;
          }

          /* Header du panier */
          .cart-header-flex {
            flex-direction: column !important;
            gap: 1rem !important;
            align-items: flex-start !important;
          }

          .cart-title {
            font-size: 2rem !important;
          }

          /* Badge compteur */
          .cart-item-count-badge {
            font-size: 1rem !important;
            padding: 0.5rem 1rem !important;
          }

          /* Items du panier - grille en colonne */
          .cart-item-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }

          /* Image du produit */
          .cart-item-image-wrapper {
            width: 100% !important;
            height: 200px !important;
            margin: 0 auto !important;
          }

          /* Section prix et contrôles */
          .cart-item-price-section {
            display: flex !important;
            flex-direction: column !important;
            gap: 1rem !important;
            width: 100% !important;
          }

          /* Contrôles de quantité */
          .cart-item-quantity-controls {
            width: 100% !important;
            justify-content: center !important;
          }

          /* Boutons de quantité */
          .cart-quantity-button {
            width: 45px !important;
            height: 45px !important;
            font-size: 1.3rem !important;
          }

          .cart-quantity-display {
            min-width: 60px !important;
            font-size: 1.4rem !important;
            padding: 0.8rem !important;
          }

          /* Bouton supprimer */
          .cart-remove-button {
            width: 100% !important;
            padding: 1rem !important;
            font-size: 1.2rem !important;
          }

          /* Résumé du panier */
          .cart-summary {
            position: static !important;
            padding: 2rem 1.5rem !important;
          }

          .cart-summary h2 {
            font-size: 1.8rem !important;
          }

          /* Lignes de résumé */
          .cart-summary-row {
            font-size: 1.2rem !important;
          }

          .cart-summary-total {
            font-size: 1.4rem !important;
          }

          /* Bouton commander */
          .cart-checkout-button {
            padding: 1.2rem !important;
            font-size: 1.4rem !important;
          }

          /* Informations supplémentaires */
          .cart-info-item {
            font-size: 1.1rem !important;
          }

          /* Panier vide */
          .cart-empty-icon {
            font-size: 4rem !important;
          }

          .cart-empty-title {
            font-size: 2rem !important;
          }

          .cart-empty-text {
            font-size: 1.2rem !important;
          }

          .cart-empty-button {
            padding: 1rem 2rem !important;
            font-size: 1.2rem !important;
          }
        }

        @media (max-width: 480px) {
          /* Très petits écrans */
          .cart-container {
            padding: 1rem 0.5rem !important;
            margin: 1rem auto !important;
          }

          .cart-title {
            font-size: 1.8rem !important;
          }

          .cart-item-image-wrapper {
            height: 180px !important;
          }

          .cart-summary h2 {
            font-size: 1.6rem !important;
          }

          .cart-checkout-button {
            font-size: 1.3rem !important;
          }

          .cart-quantity-button {
            width: 40px !important;
            height: 40px !important;
            font-size: 1.2rem !important;
          }
        }
      `}</style>
    </>
  );
}
