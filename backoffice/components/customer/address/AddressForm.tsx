import React, { useState, useEffect } from "react";
import {
  AddressPublicDTO,
  AddressCreateDTO,
  AddressUpdateDTO,
} from "../../../dto";
import FormInput from "../../product/form/FormInput";
import FormCheckbox from "../../product/form/FormCheckbox";
import FormActions from "../../product/form/FormActions";

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
 * Composant formulaire de création/édition d'adresse
 */
const AddressForm: React.FC<AddressFormProps> = ({
  address,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [formData, setFormData] = useState<Partial<AddressCreateDTO>>({
    address: "",
    postalCode: "",
    city: "",
    countryName: "", // Sera assigné par le backend
    isDefault: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialiser le formulaire avec les données de l'adresse en édition
  useEffect(() => {
    if (address) {
      setFormData({
        address: address.address,
        postalCode: address.postalCode,
        city: address.city,
        countryName: address.countryName,
        isDefault: address.isDefault,
      });
    }
  }, [address]);

  /**
   * Gère les changements dans les champs du formulaire
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  /**
   * Valide le formulaire
   */
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.address?.trim()) {
      newErrors.address = "L'adresse est requise";
    }

    if (!formData.postalCode?.trim()) {
      newErrors.postalCode = "Le code postal est requis";
    }

    if (!formData.city?.trim()) {
      newErrors.city = "La ville est requise";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Gère la soumission du formulaire
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    if (address) {
      // Mode édition : envoyer seulement les champs modifiés
      const updateData: AddressUpdateDTO = {};
      if (formData.address !== address.address) {
        updateData.address = formData.address;
      }
      if (formData.postalCode !== address.postalCode) {
        updateData.postalCode = formData.postalCode;
      }
      if (formData.city !== address.city) {
        updateData.city = formData.city;
      }
      // countryName n'est jamais mis à jour car toujours "Belgique"
      if (formData.isDefault !== address.isDefault) {
        updateData.isDefault = formData.isDefault;
      }

      onSubmit(updateData);
    } else {
      // Mode création - s'assurer que tous les champs requis sont présents
      const createData: AddressCreateDTO = {
        addressType: "shipping", // Par défaut shipping
        address: formData.address || "",
        postalCode: formData.postalCode || "",
        city: formData.city || "",
        countryName: formData.countryName,
        isDefault: formData.isDefault || false,
      };
      onSubmit(createData);
    }
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

      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {/* Adresse */}
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

          {/* Code postal */}
          <FormInput
            id="postalCode"
            label="Code postal"
            name="postalCode"
            value={formData.postalCode || ""}
            onChange={handleChange}
            required
            error={errors.postalCode}
          />

          {/* Ville */}
          <FormInput
            id="city"
            label="Ville"
            name="city"
            value={formData.city || ""}
            onChange={handleChange}
            required
            error={errors.city}
          />

          {/* Pays - Belgique uniquement */}
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

          {/* Adresse par défaut */}
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
