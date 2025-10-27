/**
 * Composant formulaire informations entreprise (optionnel)
 */

import React, { useState } from "react";
import { CompanyCreateDTO } from "../../dto";

interface CheckoutCompanyFormProps {
  formData: Partial<CompanyCreateDTO> | null;
  onChange: (data: Partial<CompanyCreateDTO> | null) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function CheckoutCompanyForm({
  formData,
  onChange,
  onNext,
  onBack,
}: CheckoutCompanyFormProps) {
  const [isCompany, setIsCompany] = useState(!!formData);

  const handleCompanyToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsCompany(checked);
    onChange(checked ? {} : null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Si achat en tant qu'entreprise, validation
    if (isCompany && formData) {
      if (!formData.companyName) {
        alert("Veuillez remplir le nom de l'entreprise");
        return;
      }
    }

    onNext();
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
          3
        </div>
        <h2
          className="checkout-form-title"
          style={{
            fontSize: "2.2rem",
            fontWeight: "700",
            color: "#333",
          }}
        >
          Informations entreprise (optionnel)
        </h2>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Case à cocher pour achat entreprise */}
        <div
          style={{
            marginBottom: "3rem",
            padding: "2rem",
            background: "#f8f9fa",
            borderRadius: "12px",
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
              checked={isCompany}
              onChange={handleCompanyToggle}
              style={{
                width: "24px",
                height: "24px",
                cursor: "pointer",
              }}
            />
            <div>
              <div style={{ marginBottom: "0.5rem" }}>
                <i
                  className="fas fa-building"
                  style={{ marginRight: "0.8rem", color: "#13686a" }}
                ></i>
                J'achète pour mon entreprise
              </div>
              <div
                style={{ fontSize: "1.2rem", fontWeight: "400", color: "#666" }}
              >
                Vous pourrez ajouter vos informations de facturation
                professionnelle
              </div>
            </div>
          </label>
        </div>

        {/* Formulaire entreprise */}
        {isCompany && (
          <div
            className="checkout-form-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "2rem",
              marginBottom: "2rem",
            }}
          >
            {/* Nom de l'entreprise */}
            <div
              className="checkout-form-group"
              style={{ gridColumn: "1 / -1" }}
            >
              <label
                style={{
                  display: "block",
                  marginBottom: "0.8rem",
                  fontSize: "1.3rem",
                  fontWeight: "600",
                  color: "#333",
                }}
              >
                Nom de l'entreprise <span style={{ color: "#c33" }}>*</span>
              </label>
              <input
                type="text"
                name="companyName"
                value={formData?.companyName || ""}
                onChange={handleChange}
                required={isCompany}
                placeholder="Nom de votre entreprise"
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

            {/* Numéro SIRET */}
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
                Numéro SIRET
              </label>
              <input
                type="text"
                name="siretNumber"
                value={formData?.siretNumber || ""}
                onChange={handleChange}
                placeholder="123 456 789 00012"
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

            {/* Numéro TVA */}
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
                Numéro TVA
              </label>
              <input
                type="text"
                name="vatNumber"
                value={formData?.vatNumber || ""}
                onChange={handleChange}
                placeholder="BE 0123.456.789"
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
          </div>
        )}

        {!isCompany && (
          <div
            style={{
              textAlign: "center",
              padding: "4rem 2rem",
              color: "#666",
              fontSize: "1.3rem",
            }}
          >
            <i
              className="fas fa-user"
              style={{
                fontSize: "4rem",
                color: "#ddd",
                marginBottom: "1.5rem",
                display: "block",
              }}
            ></i>
            <p>Vous effectuez un achat en tant que particulier.</p>
            <p style={{ marginTop: "0.5rem" }}>
              Cochez la case ci-dessus si vous souhaitez ajouter des
              informations d'entreprise.
            </p>
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

      <style jsx>{`
        /* Responsive Design pour CheckoutCompanyForm */

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

          /* Case à cocher responsive */
          label[style*="display: flex"] {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 0.8rem !important;
          }

          label[style*="display: flex"] input[type="checkbox"] {
            width: 20px !important;
            height: 20px !important;
            margin-bottom: 0.5rem !important;
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

          /* Case à cocher iPhone */
          label[style*="display: flex"] {
            font-size: 1.1rem !important;
          }

          label[style*="display: flex"] input[type="checkbox"] {
            width: 18px !important;
            height: 18px !important;
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

          label[style*="display: flex"] {
            font-size: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
}
