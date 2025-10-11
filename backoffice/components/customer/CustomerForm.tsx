import React, { useState, useEffect } from "react";
import {
  CustomerPublicDTO,
  CustomerCreateDTO,
  CustomerUpdateDTO,
  CivilityDTO,
  SocioProfessionalCategoryDTO,
} from "../../dto";
import FormInput from "../product/form/FormInput";
import FormSelect from "../product/form/FormSelect";
import FormActions from "../product/form/FormActions";

/**
 * Props du composant CustomerForm
 */
interface CustomerFormProps {
  /** Client à éditer (null si création) */
  customer: CustomerPublicDTO | null;
  /** Liste des civilités disponibles */
  civilities: CivilityDTO[];
  /** Liste des catégories socio-professionnelles */
  categories: SocioProfessionalCategoryDTO[];
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
  civilities,
  categories,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [formData, setFormData] = useState<CustomerCreateDTO>({
    civilityId: 0,
    firstName: "",
    lastName: "",
    email: "",
    socioProfessionalCategoryId: 0,
    phoneNumber: "",
    birthday: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialiser le formulaire avec les données du client en édition
  useEffect(() => {
    if (customer) {
      setFormData({
        civilityId: customer.civilityId,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        socioProfessionalCategoryId: customer.socioProfessionalCategoryId,
        phoneNumber: customer.phoneNumber || "",
        birthday: customer.birthday
          ? new Date(customer.birthday).toISOString().split("T")[0]
          : "",
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
      [name]:
        name === "civilityId" || name === "socioProfessionalCategoryId"
          ? parseInt(value)
          : value,
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

    if (!customer && formData.civilityId === 0) {
      newErrors.civilityId = "La civilité est requise";
    }

    if (!customer && formData.socioProfessionalCategoryId === 0) {
      newErrors.socioProfessionalCategoryId = "La catégorie est requise";
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
      if (
        formData.socioProfessionalCategoryId !==
        customer.socioProfessionalCategoryId
      ) {
        updateData.socioProfessionalCategoryId =
          formData.socioProfessionalCategoryId;
      }
      if (formData.phoneNumber !== customer.phoneNumber) {
        updateData.phoneNumber = formData.phoneNumber || undefined;
      }
      const customerBirthday = customer.birthday
        ? new Date(customer.birthday).toISOString().split("T")[0]
        : "";
      if (formData.birthday !== customerBirthday) {
        updateData.birthday = formData.birthday || undefined;
      }

      onSubmit(updateData);
    } else {
      // Mode création : envoyer tous les champs
      onSubmit({
        ...formData,
        phoneNumber: formData.phoneNumber || undefined,
        birthday: formData.birthday || undefined,
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
          {/* Civilité */}
          {!customer && (
            <FormSelect
              id="civilityId"
              label="Civilité"
              name="civilityId"
              value={formData.civilityId.toString()}
              onChange={handleChange}
              required
              error={errors.civilityId}
              placeholder="Sélectionner une civilité"
              options={civilities.map((civility) => ({
                value: civility.civilityId,
                label: civility.abbreviation,
              }))}
            />
          )}

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

          {/* Catégorie socio-professionnelle */}
          <FormSelect
            id="socioProfessionalCategoryId"
            label="Catégorie socio-professionnelle"
            name="socioProfessionalCategoryId"
            value={formData.socioProfessionalCategoryId.toString()}
            onChange={handleChange}
            required={!customer}
            error={errors.socioProfessionalCategoryId}
            placeholder="Sélectionner une catégorie"
            options={categories.map((category) => ({
              value: category.categoryId,
              label: category.categoryName,
            }))}
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

          {/* Date de naissance */}
          <FormInput
            id="birthday"
            label="Date de naissance"
            name="birthday"
            type="date"
            value={formData.birthday || ""}
            onChange={handleChange}
            error={errors.birthday}
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
