"use client";

import {
  CheckoutPageLayout,
  CheckoutOrderSummary,
} from "../../components/checkout";
import { useCheckoutPageGuard } from "../../hooks";

/**
 * Page de récapitulatif et paiement du checkout
 * Troisième étape du processus de commande
 */
export default function CheckoutSummaryPage() {
  const { isLoading } = useCheckoutPageGuard({
    requireCustomerData: true,
    requireShippingAddress: true,
  });

  return (
    <CheckoutPageLayout
      title="Récapitulatif et paiement - Checkout"
      description="Récapitulatif de votre commande et paiement"
      isLoading={isLoading}
    >
      <CheckoutOrderSummary />
    </CheckoutPageLayout>
  );
}
