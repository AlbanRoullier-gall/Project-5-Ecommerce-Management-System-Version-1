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
import styles from "../../../styles/components/CartSummary.module.css";

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
    <div className={styles.wrapper}>
      <div className={styles.summary}>
        <h2 className={styles.title}>Résumé du panier</h2>

        {/* Indication du pays avec transparence */}
        <div className={styles.country}>Belgique</div>

        {/* Section des totaux */}
        <div className={styles.totals}>
          <SummaryRow label="Total HT" value={totals.totalHT} />
          <SummaryRow label="Total TVA" value={totals.vatAmount} />
          <SummaryRow label="Total TTC" value={cart.total} variant="total" />
        </div>

        {/* Boutons d'action */}
        <div className={styles.actions}>
          <Link
            href="/checkout/information"
            className={`${styles.checkoutButton} ${
              isLoading ? styles.checkoutDisabled : ""
            }`}
          >
            <i className="fas fa-credit-card"></i>
            Passer la commande
          </Link>
        </div>

        {/* Informations supplémentaires */}
        <div className={styles.info}>
          <div className={styles.infoItem}>
            <i className={`fas fa-lock ${styles.infoIcon}`}></i>
            <span>Paiement sécurisé</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSummaryWrapper;
