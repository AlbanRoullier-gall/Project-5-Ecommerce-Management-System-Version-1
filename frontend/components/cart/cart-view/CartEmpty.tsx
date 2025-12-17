/**
 * Composant pour l'état vide du panier
 *
 * Affiche un message et un bouton pour retourner au catalogue
 * lorsque le panier est vide.
 */

import React from "react";
import Link from "next/link";
import styles from "../../../styles/components/CartEmpty.module.css";

/**
 * Props du composant CartEmpty
 */
interface CartEmptyProps {}

const CartEmpty: React.FC<CartEmptyProps> = () => {
  return (
    <div className={styles.card}>
      <i className={`fas fa-shopping-cart ${styles.icon}`}></i>
      <h2 className={styles.title}>Votre panier est vide</h2>
      <p className={styles.text}>
        Découvrez nos produits et ajoutez-les à votre panier
      </p>
      <Link href="/#catalog" className={styles.button}>
        <i className="fas fa-store"></i>
        Voir nos produits
      </Link>
    </div>
  );
};

export default CartEmpty;
