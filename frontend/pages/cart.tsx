/**
 * Page du panier
 *
 * Cette page affiche le contenu du panier de l'utilisateur.
 * Elle utilise plusieurs composants modulaires pour une meilleure organisation :
 * - CartHeader : En-tête avec titre et bouton retour
 * - CartItem : Affichage de chaque article du panier
 * - CartSummaryWrapper : Résumé avec totaux et bouton de commande
 * - CartEmpty : Message lorsque le panier est vide
 */

"use client";

import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useCart } from "../contexts/CartContext";
import {
  CartItem,
  CartHeader,
  CartSummaryWrapper,
  CartEmpty,
} from "../components/cart";

export default function CartPage() {
  const { cart, isLoading, error } = useCart();

  return (
    <>
      <Head>
        <title>Votre Panier - Nature de Pierre</title>
        <meta name="description" content="Consultez votre panier d'achat" />
      </Head>

      <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
        <Header />

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
          {/* En-tête avec titre et bouton retour */}
          <CartHeader />

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
            <CartEmpty />
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
              <CartSummaryWrapper />
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
