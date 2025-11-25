import React, { useState, useEffect } from "react";
import {
  CustomerPublicDTO,
  CustomerCreateDTO,
  CustomerUpdateDTO,
} from "../../dto";
import FormInput from "../shared/form/FormInput";
import FormActions from "../shared/form/FormActions";

/**
 * Props du composant CustomerForm
 */
interface CustomerFormProps {
  /** Client à éditer (null si création) */
  customer: CustomerPublicDTO | null;
  /** Callback appelé lors de la soumission */
  onSubmit: (data: CustomerCreateDTO | CustomerUpdateDTO) => void;
  /** Callback appelé lors de l'annulation */
  onCancel: () => void;
  /** État de chargement */
  isLoading: boolean;
}

/**
 * Composant formulaire de création/édition de client
 * Gère la validation et la soumission des données
 */
const CustomerForm: React.FC<CustomerFormProps> = ({
  customer,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [formData, setFormData] = useState<CustomerCreateDTO>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialiser le formulaire avec les données du client en édition
  useEffect(() => {
    if (customer) {
      setFormData({
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phoneNumber: customer.phoneNumber || "",
      });
    }
  }, [customer]);

  /**
   * Gère les changements dans les champs du formulaire
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
   * @returns true si le formulaire est valide
   */
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Le prénom est requis";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Le nom est requis";
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "L'email n'est pas valide";
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

    if (customer) {
      // Mode édition : envoyer seulement les champs modifiés
      const updateData: CustomerUpdateDTO = {};
      if (formData.firstName !== customer.firstName) {
        updateData.firstName = formData.firstName;
      }
      if (formData.lastName !== customer.lastName) {
        updateData.lastName = formData.lastName;
      }
      if (formData.email !== customer.email) {
        updateData.email = formData.email;
      }
      if (formData.phoneNumber !== customer.phoneNumber) {
        updateData.phoneNumber = formData.phoneNumber || undefined;
      }

      onSubmit(updateData);
    } else {
      // Mode création : envoyer tous les champs
      onSubmit({
        ...formData,
        phoneNumber: formData.phoneNumber || undefined,
      });
    }
  };

  return (
    <div
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "2.5rem",
        marginBottom: "2rem",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
        border: "2px solid rgba(19, 104, 106, 0.1)",
        width: "100%",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <h2
        style={{
          fontSize: "2.5rem",
          color: "#13686a",
          fontWeight: "bold",
          marginBottom: "2rem",
          paddingBottom: "1rem",
          borderBottom: "3px solid #d9b970",
        }}
      >
        {customer ? "✏️ Modifier le client" : "➕ Nouveau client"}
      </h2>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gap: "1.5rem",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "2rem",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {/* Prénom */}
          <FormInput
            id="firstName"
            label="Prénom"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            error={errors.firstName}
          />

          {/* Nom */}
          <FormInput
            id="lastName"
            label="Nom"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            error={errors.lastName}
          />

          {/* Email */}
          <FormInput
            id="email"
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            error={errors.email}
          />

          {/* Téléphone */}
          <FormInput
            id="phoneNumber"
            label="Téléphone"
            name="phoneNumber"
            type="tel"
            value={formData.phoneNumber || ""}
            onChange={handleChange}
            error={errors.phoneNumber}
          />
        </div>

        <FormActions
          onCancel={onCancel}
          isLoading={isLoading}
          isEdit={!!customer}
          submitLabel={customer ? "💾 Mettre à jour" : "➕ Créer le client"}
        />
      </form>
    </div>
  );
};

export default CustomerForm;
