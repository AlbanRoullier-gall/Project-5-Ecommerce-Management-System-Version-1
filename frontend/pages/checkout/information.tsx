"use client";

import {
  CheckoutPageLayout,
  CheckoutCustomerForm,
} from "../../components/checkout";
import { useCheckoutPageGuard } from "../../hooks";

/**
 * Page d'informations client du checkout
 * Première étape du processus de commande
 */
export default function CheckoutInformationPage() {
  const { isLoading } = useCheckoutPageGuard();

  return (
    <CheckoutPageLayout
      title="Informations - Checkout"
      description="Renseignez vos informations personnelles"
      isLoading={isLoading}
    >
      <CheckoutCustomerForm />
    </CheckoutPageLayout>
  );
}
