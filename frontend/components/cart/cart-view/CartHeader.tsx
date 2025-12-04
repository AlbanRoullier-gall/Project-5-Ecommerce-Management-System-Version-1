/**
 * Composant en-tête de la page panier
 *
 * Affiche le titre de la page et un bouton pour continuer les achats.
 */

import React from "react";
import Link from "next/link";

/**
 * Props du composant CartHeader
 */
interface CartHeaderProps {}

const CartHeader: React.FC<CartHeaderProps> = () => {
  return (
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
  );
};

export default CartHeader;
