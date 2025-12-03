/**
 * Hook pour gérer le récapitulatif et la finalisation de commande
 */

import { useState, useCallback } from "react";
import { useRouter } from "next/router";
import { useCart } from "../contexts/CartContext";
import { useCheckout } from "../contexts/CheckoutContext";
import { CartItemPublicDTO } from "../contexts/CartContext";

interface UseCheckoutOrderSummaryResult {
  cart: { items: CartItemPublicDTO[]; total: number } | null;
  totals: {
    totalHT: number;
    totalTTC: number;
    vatAmount: number;
    breakdown: { rate: number; amount: number }[];
  };
  customerData: any;
  addressData: {
    useSameBillingAddress?: boolean;
  };
  shippingAddress: any;
  billingAddress: any;
  isProcessing: boolean;
  error: string | null;
  handleCompleteOrder: () => Promise<void>;
  handleBack: () => void;
  clearError: () => void;
}

/**
 * Hook pour gérer l'état et la logique du récapitulatif de commande
 */
export function useCheckoutOrderSummary(): UseCheckoutOrderSummaryResult {
  const router = useRouter();
  const { cart, totals } = useCart();
  const { customerData, addressData, completeOrder } = useCheckout();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Utiliser les adresses depuis le contexte
  const shippingAddress = addressData.shipping;
  const billingAddress = addressData.useSameBillingAddress
    ? addressData.shipping
    : addressData.billing;

  const handleCompleteOrder = useCallback(async () => {
    setIsProcessing(true);
    setError(null);

    const result = await completeOrder(cart);

    if (result.success && result.paymentUrl) {
      // Rediriger vers la page de paiement Stripe
      window.location.href = result.paymentUrl;
    } else {
      // Afficher l'erreur
      setError(result.error || "Une erreur est survenue");
      setIsProcessing(false);
    }
  }, [completeOrder, cart]);

  const handleBack = useCallback(() => {
    router.push("/checkout/address");
  }, [router]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    cart,
    totals,
    customerData,
    addressData,
    shippingAddress,
    billingAddress,
    isProcessing,
    error,
    handleCompleteOrder,
    handleBack,
    clearError,
  };
}
