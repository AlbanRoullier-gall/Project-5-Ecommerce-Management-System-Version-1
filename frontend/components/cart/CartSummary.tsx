import React, { useMemo } from "react";
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

  const totals = useMemo(() => {
    if (!cart || !cart.items || cart.items.length === 0) {
      return {
        totalHT: 0,
        totalTTC: cart?.total || 0,
        vatAmount: 0,
        breakdown: [] as { rate: number; amount: number }[],
      };
    }

    let totalHT = 0;
    const vatByRate = new Map<number, number>();

    for (const item of cart.items) {
      const rate = item.vatRate ?? 0;
      const multiplier = 1 + rate / 100;
      const lineTotalTTC = item.price * item.quantity;
      const lineTotalHT = lineTotalTTC / multiplier;
      const vat = lineTotalTTC - lineTotalHT;

      totalHT += lineTotalHT;
      vatByRate.set(rate, (vatByRate.get(rate) || 0) + vat);
    }

    const totalTTC = cart.total;
    const vatAmount = totalTTC - totalHT;
    const breakdown = Array.from(vatByRate.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([rate, amount]) => ({ rate, amount }));

    return { totalHT, totalTTC, vatAmount, breakdown };
  }, [cart]);

  return (
    <div className="cart-summary">
      <h2 className="cart-summary-title" style={{ textAlign: "center" }}>
        Résumé
      </h2>

      <div className="cart-summary-details">
        <div className="summary-row" style={{ fontWeight: 700 }}>
          <span>Total HT</span>
          <span>{totals.totalHT.toFixed(2)} €</span>
        </div>
        {totals.breakdown.map((b) => (
          <div key={b.rate} className="summary-row">
            <span>TVA (Belgique) ({b.rate}%)</span>
            <span>{b.amount.toFixed(2)} €</span>
          </div>
        ))}
        <div className="summary-row" style={{ fontWeight: 400 }}>
          <span>Total TVA</span>
          <span>{totals.vatAmount.toFixed(2)} €</span>
        </div>
        <div className="summary-row summary-total">
          <span>Total TTC (Belgique)</span>
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
        <div
          style={{
            marginTop: "0.4rem",
            fontSize: "0.95rem",
            color: "#94a3b8",
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          TVA recalculée selon le pays de livraison dans l’UE
        </div>
      </div>

      <div className="cart-summary-info" style={{ textAlign: "center" }}>
        <p>
          <i className="fas fa-lock"></i>
          Paiement sécurisé
        </p>
      </div>
    </div>
  );
};

export default CartSummary;
