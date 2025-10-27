/**
 * Composant formulaire adresses de livraison et facturation
 */

import React, { useState, useEffect } from "react";
import { AddressCreateDTO, CountryDTO } from "../../dto";

interface AddressFormData {
  shipping: Partial<AddressCreateDTO>;
}

interface CheckoutAddressFormProps {
  formData: AddressFormData;
  onChange: (data: AddressFormData) => void;
  onNext: () => void;
  onBack: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020";

export default function CheckoutAddressForm({
  formData,
  onChange,
  onNext,
  onBack,
}: CheckoutAddressFormProps) {
  const [countries, setCountries] = useState<CountryDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set Belgium as the only available country
    const belgiumCountry = { countryId: 1, countryName: "Belgique" };
    setCountries([belgiumCountry]);

    // Set Belgium as default for shipping address
    if (!formData.shipping.countryId) {
      onChange({
        shipping: {
          ...formData.shipping,
          countryId: belgiumCountry.countryId,
        },
      });
    }
  }, []);

  const handleShippingChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const updatedShipping = {
      ...formData.shipping,
      [name]: name === "countryId" ? parseInt(value) : value,
    };

    onChange({
      shipping: updatedShipping,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.shipping.address ||
      !formData.shipping.city ||
      !formData.shipping.postalCode ||
      !formData.shipping.countryId
    ) {
      alert(
        "Veuillez remplir tous les champs obligatoires de l'adresse de livraison"
      );
      return;
    }

    onNext();
  };

  const renderAddressFields = (
    data: Partial<AddressCreateDTO>,
    handleChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => void
  ) => (
    <>
      <div className="checkout-form-group" style={{ gridColumn: "1 / -1" }}>
        <label
          style={{
            display: "block",
            marginBottom: "0.8rem",
            fontSize: "1.3rem",
            fontWeight: "600",
            color: "#333",
          }}
        >
          Adresse complète <span style={{ color: "#c33" }}>*</span>
        </label>
        <input
          type="text"
          name="address"
          value={data.address || ""}
          onChange={handleChange}
          required
          placeholder="Numéro et nom de rue"
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
          Code postal <span style={{ color: "#c33" }}>*</span>
        </label>
        <input
          type="text"
          name="postalCode"
          value={data.postalCode || ""}
          onChange={handleChange}
          required
          placeholder="1000"
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
          Ville <span style={{ color: "#c33" }}>*</span>
        </label>
        <input
          type="text"
          name="city"
          value={data.city || ""}
          onChange={handleChange}
          required
          placeholder="Bruxelles"
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

      <div className="checkout-form-group" style={{ gridColumn: "1 / -1" }}>
        <label
          style={{
            display: "block",
            marginBottom: "0.8rem",
            fontSize: "1.3rem",
            fontWeight: "600",
            color: "#333",
          }}
        >
          Pays <span style={{ color: "#c33" }}>*</span>
        </label>
        <input
          type="text"
          value="Belgique"
          readOnly
          style={{
            width: "100%",
            padding: "1.2rem",
            fontSize: "1.3rem",
            border: "2px solid #e0e0e0",
            borderRadius: "8px",
            backgroundColor: "#f8f9fa",
            color: "#666",
            cursor: "not-allowed",
          }}
        />
        <input type="hidden" name="countryId" value={data.countryId || 1} />
      </div>
    </>
  );

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
            {renderAddressFields(formData.shipping, handleShippingChange)}
          </div>
        </div>

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
          <button
            type="button"
            onClick={onBack}
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
