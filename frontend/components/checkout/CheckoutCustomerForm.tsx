/**
 * Composant formulaire informations client
 *
 * Ce composant gère la première étape du processus de checkout.
 * Il permet de saisir les informations personnelles du client :
 * - Prénom (obligatoire)
 * - Nom (obligatoire)
 * - Email (obligatoire)
 * - Téléphone (optionnel)
 *
 * Le formulaire valide que tous les champs obligatoires sont remplis avant de passer à l'étape suivante.
 */

import React, { useState } from "react";
import { useRouter } from "next/router";
import { useCheckout } from "../../contexts/CheckoutContext";
import { FormInput, FormContainer, Button, FormHeader } from "../shared";

/**
 * Composant formulaire informations client
 * Utilise CheckoutContext pour gérer l'état du formulaire
 */
export default function CheckoutCustomerForm() {
  const router = useRouter();
  const { customerData, updateCustomerData } = useCheckout();
  // État local du composant
  const [isLoading, setIsLoading] = useState(false); // Indicateur de chargement

  /**
   * Gère les changements dans les champs du formulaire
   * Met à jour le contexte checkout
   * @param e - Événement de changement sur un input
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateCustomerData({
      ...customerData,
      [name]: value,
    });
  };

  /**
   * Gère la soumission du formulaire
   * Valide que tous les champs obligatoires (prénom, nom, email) sont remplis
   * @param e - Événement de soumission du formulaire
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation des champs obligatoires
    if (
      !customerData.firstName ||
      !customerData.lastName ||
      !customerData.email
    ) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    // Rediriger vers la page d'adresse si la validation réussit
    router.push("/checkout/address");
  };

  return (
    <FormContainer>
      <FormHeader stepNumber={1} title="Vos informations personnelles" />

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
          <FormInput
            name="firstName"
            label="Prénom"
            value={customerData.firstName || ""}
            onChange={handleChange}
            required
            placeholder="Votre prénom"
          />

          {/* Champ nom */}
          <FormInput
            name="lastName"
            label="Nom"
            value={customerData.lastName || ""}
            onChange={handleChange}
            required
            placeholder="Votre nom"
          />

          {/* Champ email */}
          <FormInput
            name="email"
            label="Email"
            type="email"
            value={customerData.email || ""}
            onChange={handleChange}
            required
            placeholder="votre.email@exemple.com"
          />

          {/* Champ téléphone (optionnel) */}
          <FormInput
            name="phoneNumber"
            label="Téléphone"
            type="tel"
            value={customerData.phoneNumber || ""}
            onChange={handleChange}
            placeholder="+32 123 45 67 89"
          />

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
          {false && (
            <button
              type="button"
              onClick={() => router.push("/checkout/information")}
              style={{
                padding: "1.2rem 3rem",
                fontSize: "1.4rem",
                fontWeight: "600",
                border: "2px solid #ddd",
                background: "white",
                color: "#666",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = "#13686a";
                e.currentTarget.style.color = "#13686a";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = "#ddd";
                e.currentTarget.style.color = "#666";
              }}
            >
              <i
                className="fas fa-arrow-left"
                style={{ marginRight: "0.8rem" }}
              ></i>
              Retour
            </button>
          )}
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
