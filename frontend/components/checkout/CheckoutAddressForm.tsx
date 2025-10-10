/**
 * Composant formulaire adresses de livraison et facturation
 */

import React, { useState } from "react";
import { AddressCreateDTO } from "../../dto";

interface AddressFormData {
  shipping: Partial<AddressCreateDTO>;
  billing: Partial<AddressCreateDTO>;
  useSameAddress: boolean;
}

interface CheckoutAddressFormProps {
  formData: AddressFormData;
  onChange: (data: AddressFormData) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function CheckoutAddressForm({
  formData,
  onChange,
  onNext,
  onBack,
}: CheckoutAddressFormProps) {
  const [useSameAddress, setUseSameAddress] = useState(
    formData.useSameAddress || false
  );

  const handleShippingChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const updatedShipping = {
      ...formData.shipping,
      [name]: name === "countryId" ? parseInt(value) : value,
      addressType: "shipping" as const,
    };

    onChange({
      ...formData,
      shipping: updatedShipping,
      billing: useSameAddress ? updatedShipping : formData.billing,
    });
  };

  const handleBillingChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    onChange({
      ...formData,
      billing: {
        ...formData.billing,
        [name]: name === "countryId" ? parseInt(value) : value,
        addressType: "billing" as const,
      },
    });
  };

  const handleSameAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setUseSameAddress(checked);
    onChange({
      ...formData,
      useSameAddress: checked,
      billing: checked ? formData.shipping : formData.billing,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation adresse de livraison
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

    // Validation adresse de facturation si différente
    if (!useSameAddress) {
      if (
        !formData.billing.address ||
        !formData.billing.city ||
        !formData.billing.postalCode ||
        !formData.billing.countryId
      ) {
        alert(
          "Veuillez remplir tous les champs obligatoires de l'adresse de facturation"
        );
        return;
      }
    }

    onNext();
  };

  const renderAddressFields = (
    type: "shipping" | "billing",
    data: Partial<AddressCreateDTO>,
    handleChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => void
  ) => (
    <>
      {/* Adresse */}
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

      {/* Code postal */}
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

      {/* Ville */}
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

      {/* Pays */}
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
        <select
          name="countryId"
          value={data.countryId || ""}
          onChange={handleChange}
          required
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
        >
          <option value="">Sélectionnez un pays</option>
          <option value="1">Belgique</option>
          <option value="2">France</option>
          <option value="3">Luxembourg</option>
          <option value="4">Pays-Bas</option>
          <option value="5">Allemagne</option>
        </select>
      </div>
    </>
  );

  return (
    <div
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "3rem",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      <div
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
          style={{
            fontSize: "2.2rem",
            fontWeight: "700",
            color: "#333",
          }}
        >
          Adresses de livraison et facturation
        </h2>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Adresse de livraison */}
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
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "2rem",
            }}
          >
            {renderAddressFields(
              "shipping",
              formData.shipping,
              handleShippingChange
            )}
          </div>
        </div>

        {/* Case à cocher pour utiliser la même adresse */}
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
              fontSize: "1.4rem",
              fontWeight: "600",
            }}
          >
            <input
              type="checkbox"
              checked={useSameAddress}
              onChange={handleSameAddressChange}
              style={{
                width: "24px",
                height: "24px",
                cursor: "pointer",
              }}
            />
            <span>Utiliser la même adresse pour la facturation</span>
          </label>
        </div>

        {/* Adresse de facturation (si différente) */}
        {!useSameAddress && (
          <div style={{ marginBottom: "2rem" }}>
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
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "2rem",
              }}
            >
              {renderAddressFields(
                "billing",
                formData.billing,
                handleBillingChange
              )}
            </div>
          </div>
        )}

        {/* Boutons de navigation */}
        <div
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
          >
            Continuer
            <i
              className="fas fa-arrow-right"
              style={{ marginLeft: "0.8rem" }}
            ></i>
          </button>
        </div>
      </form>
    </div>
  );
}
