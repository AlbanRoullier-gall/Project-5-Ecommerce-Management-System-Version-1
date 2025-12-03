/**
 * Hook pour déterminer l'étape actuelle du checkout
 * Extrait la logique de routing du checkout
 */

import { useRouter } from "next/router";
import { useMemo } from "react";

interface CheckoutStep {
  number: number;
  label: string;
  icon: string;
}

interface UseCheckoutStepResult {
  currentStep: number;
  steps: CheckoutStep[];
}

/**
 * Hook pour déterminer l'étape actuelle du checkout
 */
export function useCheckoutStep(): UseCheckoutStepResult {
  const router = useRouter();

  const steps: CheckoutStep[] = useMemo(
    () => [
      { number: 1, label: "Informations", icon: "fa-user" },
      { number: 2, label: "Adresses", icon: "fa-map-marker-alt" },
      { number: 3, label: "Paiement", icon: "fa-credit-card" },
    ],
    []
  );

  const currentStep = useMemo(() => {
    const currentPath = router.pathname;
    if (currentPath.includes("/checkout/address")) {
      return 2;
    } else if (currentPath.includes("/checkout/summary")) {
      return 3;
    }
    return 1;
  }, [router.pathname]);

  return {
    currentStep,
    steps,
  };
}

