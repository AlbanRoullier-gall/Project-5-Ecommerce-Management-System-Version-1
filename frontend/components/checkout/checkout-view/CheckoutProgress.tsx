import { useRouter } from "next/router";
import { StepIndicator, Step } from "../../shared";

/**
 * Composant indicateur de progression du checkout
 * Affiche les 3 étapes : Informations, Adresses, Paiement
 */
export default function CheckoutProgress() {
  const router = useRouter();
  const currentPath = router.pathname;

  // Déterminer l'étape courante selon la route
  let currentStep = 1;
  if (currentPath.includes("/checkout/address")) {
    currentStep = 2;
  } else if (currentPath.includes("/checkout/summary")) {
    currentStep = 3;
  }

  const steps: Step[] = [
    {
      number: 1,
      label: "Informations",
      icon: "fa-user",
      path: "/checkout/information",
    },
    {
      number: 2,
      label: "Adresses",
      icon: "fa-map-marker-alt",
      path: "/checkout/address",
    },
    {
      number: 3,
      label: "Paiement",
      icon: "fa-credit-card",
      path: "/checkout/summary",
    },
  ];

  return <StepIndicator steps={steps} currentStep={currentStep} />;
}
