/**
 * Composant pour l'état vide du panier
 *
 * Affiche un message et un bouton pour retourner au catalogue
 * lorsque le panier est vide.
 */

import React from "react";
import Link from "next/link";

/**
 * Props du composant CartEmpty
 */
interface CartEmptyProps {}

const CartEmpty: React.FC<CartEmptyProps> = () => {
  return (
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
          background: "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
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
  );
};

export default CartEmpty;
