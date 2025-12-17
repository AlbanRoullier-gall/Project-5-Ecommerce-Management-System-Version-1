/**
 * Composant en-tête de la page panier
 *
 * Affiche le titre de la page et un bouton pour continuer les achats.
 */

import React from "react";
import Link from "next/link";
import styles from "../../../styles/components/CartHeader.module.css";

/**
 * Props du composant CartHeader
 */
interface CartHeaderProps {}

const CartHeader: React.FC<CartHeaderProps> = () => {
  return (
    <div className={styles.header}>
      <h1 className={styles.title}>Votre Panier</h1>

      <Link href="/#catalog" className={styles.backButton}>
        <i className="fas fa-arrow-left"></i>
        Continuer mes achats
      </Link>
    </div>
  );
};

export default CartHeader;
