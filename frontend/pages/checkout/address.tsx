"use client";

import {
  CheckoutPageLayout,
  CheckoutAddressForm,
} from "../../components/checkout";
import { useCheckoutPageGuard } from "../../hooks/useCheckoutPageGuard";

/**
 * Page d'adresses du checkout
 * Deuxième étape du processus de commande
 */
export default function CheckoutAddressPage() {
  const { isLoading } = useCheckoutPageGuard({
    requireCustomerData: true,
  });

  return (
    <CheckoutPageLayout
      title="Adresse de livraison - Checkout"
      description="Renseignez votre adresse de livraison"
      isLoading={isLoading}
    >
      <CheckoutAddressForm />
    </CheckoutPageLayout>
  );
}
