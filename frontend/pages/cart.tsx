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
import { useCart, CartItemPublicDTO } from "../contexts/CartContext";
import {
  CartItem,
  CartHeader,
  CartSummaryWrapper,
  CartEmpty,
} from "../components/cart";
import styles from "../styles/components/CartPage.module.css";

export default function CartPage() {
  const { cart, isLoading, error } = useCart();

  return (
    <>
      <Head>
        <title>Votre Panier - Nature de Pierre</title>
        <meta name="description" content="Consultez votre panier d'achat" />
      </Head>

      <div className={styles.page}>
        <Header />

        {/* Main Content */}
        <div className={styles.container}>
          {/* En-tête avec titre et bouton retour */}
          <CartHeader />

          {/* Message d'erreur */}
          {error && (
            <div className={styles.error}>
              <i className="fas fa-exclamation-triangle"></i>
              {error}
            </div>
          )}

          {/* Chargement */}
          {isLoading && !cart && (
            <div className={styles.loading}>
              <i className={`fas fa-spinner fa-spin ${styles.loadingIcon}`}></i>
              <p className={styles.loadingText}>Chargement du panier...</p>
            </div>
          )}

          {/* Panier vide */}
          {!isLoading && (!cart || !cart.items || cart.items.length === 0) && (
            <CartEmpty />
          )}

          {/* Panier avec articles */}
          {cart && cart.items && cart.items.length > 0 && (
            <div className={styles.grid}>
              {/* Liste des articles */}
              <div>
                {cart.items.map((item: CartItemPublicDTO) => (
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
    </>
  );
}
