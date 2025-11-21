import { useRouter } from "next/router";

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

  const steps = [
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

  return (
    <div
      className="checkout-progress"
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "4rem",
        padding: "0 2rem",
      }}
    >
      {steps.map((step, index) => (
        <div
          key={step.number}
          style={{
            flex: 1,
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Ligne de connexion */}
          {index < steps.length - 1 && (
            <div
              style={{
                position: "absolute",
                top: "25px",
                left: "50%",
                right: "-50%",
                height: "4px",
                background:
                  currentStep > step.number
                    ? "linear-gradient(90deg, #13686a 0%, #0dd3d1 100%)"
                    : "#e0e0e0",
                zIndex: 0,
              }}
            />
          )}

          {/* Icône étape */}
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background:
                currentStep >= step.number
                  ? "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)"
                  : "#e0e0e0",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.8rem",
              fontWeight: "700",
              position: "relative",
              zIndex: 1,
              marginBottom: "1rem",
              boxShadow:
                currentStep >= step.number
                  ? "0 4px 12px rgba(19, 104, 106, 0.3)"
                  : "none",
              transition: "all 0.3s ease",
            }}
          >
            {currentStep > step.number ? (
              <i className="fas fa-check"></i>
            ) : (
              <i className={`fas ${step.icon}`}></i>
            )}
          </div>

          {/* Label étape */}
          <div
            className="checkout-step-label"
            style={{
              fontSize: "1.3rem",
              fontWeight: currentStep === step.number ? "700" : "500",
              color: currentStep >= step.number ? "#13686a" : "#999",
              textAlign: "center",
            }}
          >
            {step.label}
          </div>
        </div>
      ))}
    </div>
  );
}
