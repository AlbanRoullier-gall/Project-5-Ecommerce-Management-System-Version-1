import React, { useState, useEffect } from "react";
import {
  AddressPublicDTO,
  AddressCreateDTO,
  AddressUpdateDTO,
} from "../../../dto";
import FormInput from "../../shared/form/FormInput";
import FormCheckbox from "../../shared/form/FormCheckbox";
import FormActions from "../../shared/form/FormActions";

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
    countryName: "",
    isDefault: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (address) {
      setFormData({
        address: address.address,
        postalCode: address.postalCode,
        city: address.city,
        countryName: address.countryName,
        isDefault: address.isDefault,
      });
    } else {
      setFormData({
        address: "",
        postalCode: "",
        city: "",
        countryName: "",
        isDefault: false,
      });
    }
  }, [address]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = async (): Promise<boolean> => {
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020";

      // Préparer les données pour la validation (format AddressesCreateDTO)
      const addressData = {
        shipping: {
          address: formData.address || "",
          postalCode: formData.postalCode || "",
          city: formData.city || "",
          countryName: formData.countryName || "Belgique",
        },
        billing: {
          address: formData.address || "",
          postalCode: formData.postalCode || "",
          city: formData.city || "",
          countryName: formData.countryName || "Belgique",
        },
        useSameBillingAddress: true,
      };

      const response = await fetch(
        `${API_URL}/api/customers/addresses/validate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(addressData),
        }
      );

      const result = await response.json();

      if (!result.isValid) {
        // Mapper les erreurs de l'API vers les champs du formulaire
        const newErrors: Record<string, string> = {};
        if (result.error) {
          // Si l'erreur concerne l'adresse de livraison, l'afficher sur les champs correspondants
          if (
            result.error.includes("adresse") ||
            result.error.includes("address")
          ) {
            newErrors.address = result.error;
          } else if (
            result.error.includes("code postal") ||
            result.error.includes("postalCode")
          ) {
            newErrors.postalCode = result.error;
          } else if (
            result.error.includes("ville") ||
            result.error.includes("city")
          ) {
            newErrors.city = result.error;
          } else {
            newErrors._general = result.error;
          }
        }
        setErrors(newErrors);
        return false;
      }

      setErrors({});
      return true;
    } catch (error) {
      console.error("Erreur lors de la validation:", error);
      setErrors({ _general: "Erreur lors de la validation" });
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = await validate();
    if (!isValid) {
      return;
    }

    if (address) {
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
      if (formData.isDefault !== address.isDefault) {
        updateData.isDefault = formData.isDefault;
      }

      onSubmit(updateData);
    } else {
      const createData: AddressCreateDTO = {
        addressType: "shipping",
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
