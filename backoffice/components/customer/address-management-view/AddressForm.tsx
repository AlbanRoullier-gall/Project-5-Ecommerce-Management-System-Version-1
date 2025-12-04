import React from "react";
import {
  AddressPublicDTO,
  AddressCreateDTO,
  AddressUpdateDTO,
} from "../../../dto";
import FormInput from "../../shared/form/FormInput";
import FormCheckbox from "../../shared/form/FormCheckbox";
import FormActions from "../../shared/form/FormActions";
import { useAddressForm } from "../../../hooks";

/**
 * Props du composant AddressForm
 */
interface AddressFormProps {
  /** Adresse à éditer (null si création) */
  address: AddressPublicDTO | null;
  /** Callback appelé lors de la soumission */
  onSubmit: (data: AddressCreateDTO | AddressUpdateDTO) => void;
  /** Callback appelé lors de l'annulation */
  onCancel: () => void;
  /** État de chargement */
  isLoading: boolean;
}

/**
 * Formulaire de création/édition d'adresse
 * Composant présentatif uniquement - toute la logique est dans useAddressForm
 */
const AddressForm: React.FC<AddressFormProps> = ({
  address,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const { formData, errors, handleChange, handleSubmit } = useAddressForm({
    address,
  });

  const onSubmitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(onSubmit);
  };

  return (
    <div
      style={{
        background: "#f9fafb",
        borderRadius: "12px",
        padding: "1.5rem",
        marginBottom: "2rem",
        border: "1px solid #e5e7eb",
      }}
    >
      <h3
        style={{
          fontSize: "1.4rem",
          fontWeight: "600",
          color: "#13686a",
          marginBottom: "1.5rem",
        }}
      >
        {address ? "Modifier l'adresse" : "Nouvelle adresse"}
      </h3>

      <form onSubmit={onSubmitHandler}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <div style={{ gridColumn: "1 / -1" }}>
            <FormInput
              id="address"
              label="Adresse"
              name="address"
              value={formData.address || ""}
              onChange={handleChange}
              required
              error={errors.address}
            />
          </div>

          <FormInput
            id="postalCode"
            label="Code postal"
            name="postalCode"
            value={formData.postalCode || ""}
            onChange={handleChange}
            required
            error={errors.postalCode}
          />
          <FormInput
            id="city"
            label="Ville"
            name="city"
            value={formData.city || ""}
            onChange={handleChange}
            required
            error={errors.city}
          />
          <div className="form-group">
            <label htmlFor="countryDisplay" className="form-label">
              Pays <span className="required">*</span>
            </label>
            <input
              type="text"
              id="countryDisplay"
              name="countryName"
              value={formData.countryName || ""}
              readOnly
              className="form-input"
              style={{
                backgroundColor: "#f8f9fa",
                color: "#666",
                cursor: "not-allowed",
                border: "1px solid #e0e0e0",
              }}
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <FormCheckbox
              id="isDefault"
              label="Adresse par défaut"
              name="isDefault"
              checked={formData.isDefault || false}
              onChange={handleChange}
            />
          </div>
        </div>
        <FormActions
          onCancel={onCancel}
          isLoading={isLoading}
          submitLabel={address ? "Mettre à jour" : "Créer l'adresse"}
        />
      </form>
    </div>
  );
};

export default AddressForm;
