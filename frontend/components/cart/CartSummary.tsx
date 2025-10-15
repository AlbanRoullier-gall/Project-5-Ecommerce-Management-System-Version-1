import React from "react";
import { useCart } from "../../contexts/CartContext";
import { useRouter } from "next/router";

/**
 * Composant résumé du panier
 * Affiche le sous-total, taxes et total
 * Bouton pour passer à la commande
 */
const CartSummary: React.FC = () => {
  const { cart, isLoading } = useCart();
  const router = useRouter();

  if (!cart || !cart.items || cart.items.length === 0) {
    return null;
  }

  /**
   * Passer à la commande (à implémenter)
   */
  const handleCheckout = () => {
    // TODO: Implémenter la page de commande
    router.push("/checkout");
  };

  return (
    <div className="cart-summary">
      <h2 className="cart-summary-title">Résumé</h2>

      <div className="cart-summary-details">
        <div className="summary-row summary-total">
          <span>Total TTC</span>
          <span>{cart.total.toFixed(2)} €</span>
        </div>
      </div>

      <div className="cart-summary-actions">
        <button
          onClick={handleCheckout}
          disabled={isLoading}
          className="btn btn-primary btn-checkout"
        >
          <i className="fas fa-credit-card"></i>
          Passer la commande
        </button>
      </div>

      <div className="cart-summary-info">
        <p>
          <i className="fas fa-lock"></i>
          Paiement sécurisé
        </p>
        <p>
          <i className="fas fa-truck"></i>
          Livraison gratuite dès 50 €
        </p>
      </div>
    </div>
  );
};

export default CartSummary;
