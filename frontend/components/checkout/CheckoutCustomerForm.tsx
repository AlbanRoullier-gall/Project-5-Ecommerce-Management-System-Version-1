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

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useCheckout } from "../../contexts/CheckoutContext";

/**
 * Composant formulaire informations client
 * Utilise CheckoutContext pour gérer l'état du formulaire
 */
export default function CheckoutCustomerForm() {
  const router = useRouter();
  const { customerData, updateCustomerData } = useCheckout();
  // État local du composant
  const [isLoading, setIsLoading] = useState(false); // Indicateur de chargement
  const [error, setError] = useState<string | null>(null); // Message d'erreur éventuel

  /**
   * Effet au montage du composant
   * Réinitialise les erreurs éventuelles
   */
  useEffect(() => {
    // No reference data to load anymore
    setError(null);
  }, []);

  /**
   * Gère les changements dans les champs du formulaire
   * Met à jour le contexte checkout
   * @param e - Événement de changement sur un input ou select
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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
    <div
      className="checkout-form-container"
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "3rem",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      <div
        className="checkout-form-header"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "2.5rem",
        }}
      >
        <div
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.8rem",
            fontWeight: "700",
          }}
        >
          1
        </div>
        <h2
          className="checkout-form-title"
          style={{
            fontSize: "2.2rem",
            fontWeight: "700",
            color: "#333",
          }}
        >
          Vos informations personnelles
        </h2>
      </div>

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
          <div className="checkout-form-group">
            <label
              style={{
                display: "block",
                marginBottom: "0.8rem",
                fontSize: "1.3rem",
                fontWeight: "600",
                color: "#333",
              }}
            >
              Prénom <span style={{ color: "#c33" }}>*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={customerData.firstName || ""}
              onChange={handleChange}
              required
              placeholder="Votre prénom"
              style={{
                width: "100%",
                padding: "1.2rem",
                fontSize: "1.3rem",
                border: "2px solid #ddd",
                borderRadius: "8px",
                transition: "border-color 0.3s ease",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#13686a")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#ddd")}
            />
          </div>

          {/* Champ nom */}
          <div className="checkout-form-group">
            <label
              style={{
                display: "block",
                marginBottom: "0.8rem",
                fontSize: "1.3rem",
                fontWeight: "600",
                color: "#333",
              }}
            >
              Nom <span style={{ color: "#c33" }}>*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={customerData.lastName || ""}
              onChange={handleChange}
              required
              placeholder="Votre nom"
              style={{
                width: "100%",
                padding: "1.2rem",
                fontSize: "1.3rem",
                border: "2px solid #ddd",
                borderRadius: "8px",
                transition: "border-color 0.3s ease",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#13686a")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#ddd")}
            />
          </div>

          {/* Champ email */}
          <div className="checkout-form-group">
            <label
              style={{
                display: "block",
                marginBottom: "0.8rem",
                fontSize: "1.3rem",
                fontWeight: "600",
                color: "#333",
              }}
            >
              Email <span style={{ color: "#c33" }}>*</span>
            </label>
            <input
              type="email"
              name="email"
              value={customerData.email || ""}
              onChange={handleChange}
              required
              placeholder="votre.email@exemple.com"
              style={{
                width: "100%",
                padding: "1.2rem",
                fontSize: "1.3rem",
                border: "2px solid #ddd",
                borderRadius: "8px",
                transition: "border-color 0.3s ease",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#13686a")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#ddd")}
            />
          </div>

          {/* Champ téléphone (optionnel) */}
          <div className="checkout-form-group">
            <label
              style={{
                display: "block",
                marginBottom: "0.8rem",
                fontSize: "1.3rem",
                fontWeight: "600",
                color: "#333",
              }}
            >
              Téléphone
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={customerData.phoneNumber || ""}
              onChange={handleChange}
              placeholder="+32 123 45 67 89"
              style={{
                width: "100%",
                padding: "1.2rem",
                fontSize: "1.3rem",
                border: "2px solid #ddd",
                borderRadius: "8px",
                transition: "border-color 0.3s ease",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#13686a")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#ddd")}
            />
          </div>

          {/* Date de naissance supprimée */}
        </div>

        {/* Affichage des erreurs éventuelles */}
        {error && (
          <div
            style={{
              background: "#fee",
              border: "2px solid #fcc",
              color: "#c33",
              padding: "1rem",
              borderRadius: "8px",
              marginBottom: "1rem",
              fontSize: "1.2rem",
            }}
          >
            {error}
          </div>
        )}

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
          <button
            type="submit"
            style={{
              padding: "1.2rem 3rem",
              fontSize: "1.4rem",
              fontWeight: "600",
              border: "none",
              background: "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
              color: "white",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "transform 0.2s ease",
              boxShadow: "0 4px 12px rgba(19, 104, 106, 0.3)",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
            }}
            disabled={isLoading}
          >
            Continuer
            <i
              className="fas fa-arrow-right"
              style={{ marginLeft: "0.8rem" }}
            ></i>
          </button>
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
    </div>
  );
}
