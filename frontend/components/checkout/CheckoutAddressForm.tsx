/**
 * Composant formulaire adresses de livraison et facturation
 *
 * Ce composant gère la saisie de l'adresse de livraison lors du processus de checkout.
 */

import React, { useState } from "react";
import { useRouter } from "next/router";
import { AddressCreateDTO } from "../../dto";
import { useCheckout } from "../../contexts/CheckoutContext";

/**
 * Styles partagés pour les champs de formulaire
 */
const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "0.8rem",
  fontSize: "1.3rem",
  fontWeight: "600",
  color: "#333",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "1.2rem",
  fontSize: "1.3rem",
  border: "2px solid #ddd",
  borderRadius: "8px",
  transition: "border-color 0.3s ease",
};

const readonlyInputStyle: React.CSSProperties = {
  ...inputStyle,
  border: "2px solid #e0e0e0",
  backgroundColor: "#f8f9fa",
  color: "#666",
  cursor: "not-allowed",
};

/**
 * Props pour le composant AddressFields
 */
interface AddressFieldsProps {
  address: Partial<AddressCreateDTO>;
  onChange: (field: string, value: string) => void;
}

/**
 * Composant réutilisable pour afficher les champs d'adresse
 */
const AddressFields: React.FC<AddressFieldsProps> = ({ address, onChange }) => {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    onChange(e.target.name, e.target.value);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "#13686a";
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "#ddd";
  };

  return (
    <>
      <div className="checkout-form-group" style={{ gridColumn: "1 / -1" }}>
        <label style={labelStyle}>
          Adresse complète <span style={{ color: "#c33" }}>*</span>
        </label>
        <input
          type="text"
          name="address"
          value={address.address || ""}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          required
          placeholder="Numéro et nom de rue"
          style={inputStyle}
        />
      </div>

      <div className="checkout-form-group">
        <label style={labelStyle}>
          Code postal <span style={{ color: "#c33" }}>*</span>
        </label>
        <input
          type="text"
          name="postalCode"
          value={address.postalCode || ""}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          required
          placeholder="1000"
          style={inputStyle}
        />
      </div>

      <div className="checkout-form-group">
        <label style={labelStyle}>
          Ville <span style={{ color: "#c33" }}>*</span>
        </label>
        <input
          type="text"
          name="city"
          value={address.city || ""}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          required
          placeholder="Bruxelles"
          style={inputStyle}
        />
      </div>

      <div className="checkout-form-group" style={{ gridColumn: "1 / -1" }}>
        <label style={labelStyle}>
          Pays <span style={{ color: "#c33" }}>*</span>
        </label>
        <input
          type="text"
          name="countryName"
          value={address.countryName || "Belgique"}
          readOnly
          style={readonlyInputStyle}
        />
      </div>
    </>
  );
};

/**
 * Composant formulaire adresses de livraison et facturation
 * Utilise CheckoutContext pour gérer l'état du formulaire
 */
export default function CheckoutAddressForm() {
  const router = useRouter();
  const {
    addressData,
    updateShippingField,
    updateBillingField,
    setUseSameBillingAddress,
    validateAddresses,
  } = useCheckout();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Gère les changements dans les champs d'adresse
   * @param addressType - "shipping" ou "billing"
   */
  const handleAddressChange = (
    addressType: "shipping" | "billing",
    field: string,
    value: string
  ) => {
    if (addressType === "shipping") {
      updateShippingField(field, value);
    } else {
      updateBillingField(field, value);
    }
  };

  /**
   * Gère le changement du checkbox "Même adresse de facturation"
   */
  const handleUseSameBillingAddressChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setUseSameBillingAddress(e.target.checked);
  };

  /**
   * Gère la soumission du formulaire
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateAddresses();
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    // Rediriger vers la page de récapitulatif si la validation réussit
    router.push("/checkout/summary");
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
      {/* En-tête du formulaire avec numéro d'étape */}
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
          2
        </div>
        <h2
          className="checkout-form-title"
          style={{
            fontSize: "2.2rem",
            fontWeight: "700",
            color: "#333",
          }}
        >
          Adresse de livraison
        </h2>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Section adresse de livraison */}
        <div style={{ marginBottom: "3rem" }}>
          <h3
            style={{
              fontSize: "1.8rem",
              fontWeight: "600",
              color: "#13686a",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.8rem",
            }}
          >
            <i className="fas fa-truck"></i>
            Adresse de livraison
          </h3>
          <div
            className="checkout-form-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "2rem",
            }}
          >
            <AddressFields
              address={addressData?.shipping || {}}
              onChange={(field, value) =>
                handleAddressChange("shipping", field, value)
              }
            />
          </div>
        </div>

        {/* Checkbox pour même adresse de facturation */}
        <div
          style={{
            marginBottom: "3rem",
            padding: "1.5rem",
            background: "#f8f9fa",
            borderRadius: "8px",
            border: "2px solid #e0e0e0",
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              cursor: "pointer",
              fontSize: "1.3rem",
              fontWeight: "600",
              color: "#333",
            }}
          >
            <input
              type="checkbox"
              checked={addressData?.useSameBillingAddress ?? true}
              onChange={handleUseSameBillingAddressChange}
              style={{
                width: "20px",
                height: "20px",
                cursor: "pointer",
                accentColor: "#13686a",
              }}
            />
            <span>
              <i
                className="fas fa-check-square"
                style={{ marginRight: "0.5rem" }}
              ></i>
              Utiliser la même adresse pour la facturation
            </span>
          </label>
        </div>

        {/* Section adresse de facturation (affichée uniquement si différente) */}
        {!(addressData?.useSameBillingAddress ?? true) && (
          <div style={{ marginBottom: "3rem" }}>
            <h3
              style={{
                fontSize: "1.8rem",
                fontWeight: "600",
                color: "#13686a",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.8rem",
              }}
            >
              <i className="fas fa-file-invoice"></i>
              Adresse de facturation
            </h3>
            <div
              className="checkout-form-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "2rem",
              }}
            >
              <AddressFields
                address={addressData?.billing || {}}
                onChange={(field, value) =>
                  handleAddressChange("billing", field, value)
                }
              />
            </div>
          </div>
        )}

        {/* Boutons de navigation */}
        <div
          className="checkout-form-actions"
          style={{
            display: "flex",
            gap: "1.5rem",
            justifyContent: "space-between",
            paddingTop: "2rem",
            borderTop: "2px solid #e0e0e0",
          }}
        >
          {/* Bouton retour */}
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
        /* Responsive Design pour CheckoutAddressForm */

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

          .checkout-form-group input,
          .checkout-form-group select {
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

          .checkout-form-group input,
          .checkout-form-group select {
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

          .checkout-form-group input,
          .checkout-form-group select {
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
