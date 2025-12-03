/**
 * Hook pour gérer la protection des pages checkout
 * Vérifie que le panier n'est pas vide et redirige si nécessaire
 */

import { useEffect } from "react";
import { useRouter } from "next/router";
import { useCart } from "../contexts/CartContext";
import { useCheckout } from "../contexts/CheckoutContext";

interface UseCheckoutPageGuardOptions {
  /** Rediriger vers l'étape information si les données client ne sont pas remplies */
  requireCustomerData?: boolean;
  /** Rediriger vers l'étape adresse si l'adresse de livraison n'est pas remplie */
  requireShippingAddress?: boolean;
}

/**
 * Hook pour protéger les pages checkout
 * Vérifie que le panier n'est pas vide et redirige si nécessaire
 */
export function useCheckoutPageGuard(
  options: UseCheckoutPageGuardOptions = {}
): { isLoading: boolean } {
  const router = useRouter();
  const { cart, isLoading: cartLoading } = useCart();
  const { customerData, addressData } = useCheckout();

  const isLoading = cartLoading;

  useEffect(() => {
    if (isLoading) return;

    // Vérifier si le panier est vide
    if (!cart || !cart.items || cart.items.length === 0) {
      router.push("/cart");
      return;
    }

    // Vérifier si les données client sont requises
    if (
      options.requireCustomerData &&
      (!customerData.firstName || !customerData.lastName || !customerData.email)
    ) {
      router.push("/checkout/information");
      return;
    }

    // Vérifier si l'adresse de livraison est requise
    if (
      options.requireShippingAddress &&
      addressData.shipping &&
      (!addressData.shipping.address ||
        !addressData.shipping.city ||
        !addressData.shipping.postalCode)
    ) {
      router.push("/checkout/address");
      return;
    }
  }, [
    cart,
    isLoading,
    customerData,
    addressData,
    router,
    options.requireCustomerData,
    options.requireShippingAddress,
  ]);

  return { isLoading };
}
