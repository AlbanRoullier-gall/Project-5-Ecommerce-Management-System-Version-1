/**
 * Composant formulaire informations client
 */

import React, { useEffect, useState } from "react";
import { CustomerCreateDTO } from "../../dto";

interface CheckoutCustomerFormProps {
  formData: Partial<CustomerCreateDTO>;
  onChange: (data: Partial<CustomerCreateDTO>) => void;
  onNext: () => void;
  onBack?: () => void;
}

export default function CheckoutCustomerForm({
  formData,
  onChange,
  onNext,
  onBack,
}: CheckoutCustomerFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    // No reference data to load anymore
    setError(null);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    onChange({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    onNext();
  };

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
          1
        </div>
        <h2
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem",
            marginBottom: "2rem",
          }}
        >
          {/* Civilité supprimée */}

          {/* Catégorie socio-professionnelle supprimée */}

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
              value={formData.firstName || ""}
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
              value={formData.lastName || ""}
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
              value={formData.email || ""}
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
              value={formData.phoneNumber || ""}
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
          style={{
            display: "flex",
            gap: "1.5rem",
            justifyContent: "flex-end",
            paddingTop: "2rem",
            borderTop: "2px solid #e0e0e0",
          }}
        >
          {onBack && (
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
          )}
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
    </div>
  );
}
