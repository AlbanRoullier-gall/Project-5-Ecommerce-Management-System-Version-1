/**
 * Composant formulaire informations client
 *
 * Composant de présentation pur pour la première étape du processus de checkout.
 * Il permet de saisir les informations personnelles du client :
 * - Prénom (obligatoire)
 * - Nom (obligatoire)
 * - Email (obligatoire)
 * - Téléphone (optionnel)
 */

import { FormInput, FormContainer, Button, FormHeader, Alert } from "../shared";
import { useCheckoutCustomerForm } from "../../hooks/useCheckoutCustomerForm";

/**
 * Props du composant CheckoutCustomerForm
 */
interface CheckoutCustomerFormProps {
  // Toutes les props sont gérées par le hook, pas besoin de props externes
}

/**
 * Composant de présentation pur pour le formulaire informations client
 */
export default function CheckoutCustomerForm() {
  const {
    customerData,
    isLoading,
    errors,
    generalError,
    handleChange,
    handleSubmit,
    clearError,
  } = useCheckoutCustomerForm();

  return (
    <FormContainer>
      <FormHeader stepNumber={1} title="Vos informations personnelles" />

      {/* Affichage de l'erreur générale */}
      {generalError && (
        <Alert type="error" message={generalError} onClose={clearError} />
      )}

      <form onSubmit={handleSubmit}>
        {/* Grille de champs du formulaire */}
        <div
          className="checkout-form-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem",
            marginBottom: "2rem",
          }}
        >
          {/* Civilité supprimée */}

          {/* Champ prénom */}
          <div>
            <FormInput
              name="firstName"
              label="Prénom"
              value={customerData.firstName || ""}
              onChange={handleChange}
              required
              placeholder="Votre prénom"
            />
            {errors.firstName && (
              <p
                style={{
                  color: "#ef4444",
                  fontSize: "1.2rem",
                  marginTop: "0.5rem",
                  marginBottom: 0,
                }}
              >
                {errors.firstName}
              </p>
            )}
          </div>

          {/* Champ nom */}
          <div>
            <FormInput
              name="lastName"
              label="Nom"
              value={customerData.lastName || ""}
              onChange={handleChange}
              required
              placeholder="Votre nom"
            />
            {errors.lastName && (
              <p
                style={{
                  color: "#ef4444",
                  fontSize: "1.2rem",
                  marginTop: "0.5rem",
                  marginBottom: 0,
                }}
              >
                {errors.lastName}
              </p>
            )}
          </div>

          {/* Champ email */}
          <div>
            <FormInput
              name="email"
              label="Email"
              type="email"
              value={customerData.email || ""}
              onChange={handleChange}
              required
              placeholder="votre.email@exemple.com"
            />
            {errors.email && (
              <p
                style={{
                  color: "#ef4444",
                  fontSize: "1.2rem",
                  marginTop: "0.5rem",
                  marginBottom: 0,
                }}
              >
                {errors.email}
              </p>
            )}
          </div>

          {/* Champ téléphone (optionnel) */}
          <div>
            <FormInput
              name="phoneNumber"
              label="Téléphone"
              type="tel"
              value={customerData.phoneNumber || ""}
              onChange={handleChange}
              placeholder="+32 123 45 67 89"
            />
            {errors.phoneNumber && (
              <p
                style={{
                  color: "#ef4444",
                  fontSize: "1.2rem",
                  marginTop: "0.5rem",
                  marginBottom: 0,
                }}
              >
                {errors.phoneNumber}
              </p>
            )}
          </div>

          {/* Date de naissance supprimée */}
        </div>

        {/* Boutons de navigation */}
        <div
          className="checkout-form-actions"
          style={{
            display: "flex",
            gap: "1.5rem",
            justifyContent: "flex-end",
            paddingTop: "2rem",
            borderTop: "2px solid #e0e0e0",
          }}
        >
          {/* Pas de bouton retour sur la première étape */}
          {/* Bouton continuer */}
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            isLoading={isLoading}
          >
            Continuer
            <i
              className="fas fa-arrow-right"
              style={{ marginLeft: "0.8rem" }}
            ></i>
          </Button>
        </div>
      </form>

      {/* Styles CSS pour le responsive design */}
      <style jsx>{`
        /* Responsive Design pour CheckoutCustomerForm */

        /* Tablette */
        @media (max-width: 1024px) {
          .checkout-form-container {
            padding: 2.5rem !important;
          }

          .checkout-form-title {
            font-size: 2rem !important;
          }

          .checkout-form-grid {
            gap: 1.5rem !important;
          }
        }

        /* Mobile */
        @media (max-width: 768px) {
          .checkout-form-container {
            padding: 2rem !important;
            margin: 0 1rem !important;
          }

          .checkout-form-header {
            flex-direction: column !important;
            text-align: center !important;
            gap: 1rem !important;
            margin-bottom: 2rem !important;
          }

          .checkout-form-title {
            font-size: 1.8rem !important;
            line-height: 1.3 !important;
          }

          .checkout-form-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }

          .checkout-form-group label {
            font-size: 1.2rem !important;
            margin-bottom: 0.6rem !important;
          }

          .checkout-form-group input {
            padding: 1rem !important;
            font-size: 1.2rem !important;
          }

          .checkout-form-actions {
            flex-direction: column !important;
            gap: 1rem !important;
            align-items: stretch !important;
          }

          .checkout-form-actions button {
            width: 100% !important;
            padding: 1rem 2rem !important;
            font-size: 1.3rem !important;
            justify-content: center !important;
          }
        }

        /* iPhone */
        @media (max-width: 480px) {
          .checkout-form-container {
            padding: 1.5rem !important;
            margin: 0 0.5rem !important;
            border-radius: 12px !important;
          }

          .checkout-form-header {
            margin-bottom: 1.5rem !important;
          }

          .checkout-form-title {
            font-size: 1.6rem !important;
          }

          .checkout-form-grid {
            gap: 1.2rem !important;
          }

          .checkout-form-group label {
            font-size: 1.1rem !important;
            margin-bottom: 0.5rem !important;
          }

          .checkout-form-group input {
            padding: 0.8rem !important;
            font-size: 1.1rem !important;
            border-radius: 6px !important;
          }

          .checkout-form-actions {
            padding-top: 1.5rem !important;
          }

          .checkout-form-actions button {
            padding: 0.8rem 1.5rem !important;
            font-size: 1.2rem !important;
            border-radius: 6px !important;
          }
        }

        /* Très petits écrans */
        @media (max-width: 360px) {
          .checkout-form-container {
            padding: 1rem !important;
            margin: 0 0.3rem !important;
          }

          .checkout-form-title {
            font-size: 1.4rem !important;
          }

          .checkout-form-group label {
            font-size: 1rem !important;
          }

          .checkout-form-group input {
            padding: 0.7rem !important;
            font-size: 1rem !important;
          }

          .checkout-form-actions button {
            padding: 0.7rem 1.2rem !important;
            font-size: 1.1rem !important;
          }
        }
      `}</style>
    </FormContainer>
  );
}
