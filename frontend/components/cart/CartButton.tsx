import React from "react";
import Link from "next/link";
import { useCart } from "../../contexts/CartContext";

/**
 * Bouton du panier affiché dans le header
 * Affiche le nombre d'articles et redirige vers la page panier
 */
const CartButton: React.FC = () => {
  const { itemCount } = useCart();

  return (
    <Link href="/cart" className="cart-button">
      <i className="fas fa-shopping-cart"></i>
      {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
    </Link>
  );
};

export default CartButton;
