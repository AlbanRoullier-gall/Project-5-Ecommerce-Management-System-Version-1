/**
 * Composant wrapper pour le résumé du panier
 *
 * Affiche le résumé complet du panier avec les totaux (HT, TVA, TTC),
 * le bouton pour passer à la commande et les informations de sécurité.
 * Version améliorée avec le style de la page cart.tsx.
 */

import React from "react";
import Link from "next/link";
import { useCart } from "../../../contexts/CartContext";
import { SummaryRow } from "../../shared";

/**
 * Props du composant CartSummaryWrapper
 */
interface CartSummaryWrapperProps {
  // Aucune prop nécessaire, utilise le contexte directement
}

const CartSummaryWrapper: React.FC<CartSummaryWrapperProps> = () => {
  const { cart, isLoading, totals } = useCart();

  // Ne rien afficher si le panier est vide
  if (!cart || !cart.items || cart.items.length === 0) {
    return null;
  }

  return (
    <div className="cart-summary-wrapper" style={{ alignSelf: "center" }}>
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
            textAlign: "center",
          }}
        >
          Résumé du panier
        </h2>

        {/* Indication du pays avec transparence */}
        <div
          style={{
            fontSize: "0.95rem",
            color: "#64748b",
            opacity: 0.7,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginTop: "-1.2rem",
            marginBottom: "1.2rem",
          }}
        >
          Belgique
        </div>

        {/* Section des totaux */}
        <div style={{ marginBottom: "2rem" }}>
          <SummaryRow label="Total HT" value={totals.totalHT} />
          <SummaryRow label="Total TVA" value={totals.vatAmount} />
          <SummaryRow label="Total TTC" value={cart.total} variant="total" />
        </div>

        {/* Boutons d'action */}
        <div style={{ marginBottom: "2rem" }}>
          <Link
            href="/checkout/information"
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
            textAlign: "center",
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
              justifyContent: "center",
            }}
          >
            <i
              className="fas fa-lock"
              style={{ color: "#13686a", fontSize: "1.4rem" }}
            ></i>
            <span>Paiement sécurisé</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSummaryWrapper;
